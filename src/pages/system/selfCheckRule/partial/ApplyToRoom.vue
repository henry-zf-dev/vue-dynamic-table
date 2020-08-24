<template>
  <div>
    <div class="page-container color-gray-96">
      <div class="position-relative">
        <div class="aside-menu-container">
          <AreaTreeComp
            v-model="areaTreeWidth"
            :show-more-opt="false"
            :ignore-route-ctr="true"
            @currentNodeChange="currentAreaChange">
          </AreaTreeComp>
        </div>
        <div
          :style="{marginLeft: areaTreeCollapsed ? '0' : `${areaTreeWidth + 8}px`}"
          class="position-relative page-content-with-menu">
          <div class="table-container">
            <div class="mar-btm-10">
              <span class="room-select-text">已选择 <span class="font-color-primary ">{{ selectData.length }}</span>&nbsp;条</span>
              <el-button class="mar-lft-20" size="small" type="primary" @click="applicationRoom">应用</el-button>
              <el-button class="mar-lft" size="small" type="info" @click="cancelApplicationRoom">取消应用</el-button>
            </div>
            <EZTable
              v-loading="tableLoading"
              :table-id="tableId"
              :ref="tableId"
              :filters="filters"
              :columns="columnConfig"
              :rows="roomData"
              :selection-data="selectionData"
              :selection="true"
              :fit-table="false"
              :ignore-route-ctr="true"
              @filterChange="getRoomTableData"
              @pageChanged="getRoomTableData"
              @selectionChanged="selectionChanged"
              @sizeChanged="getRoomTableData"
              @sortChanged="getRoomTableData"
            ></EZTable>
          </div>
          <AsideMenuCollapseIcon v-model="areaTreeCollapsed"></AsideMenuCollapseIcon>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FormOptBtn from '../../../../components/FormOptBtn';
import AreaTreeComp from '../../../../components/AreaTreeComp';
import EZTable from '../../../../components/table/EZTable';
import {
  checkRespCorrect,
  getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  updateTableState
} from '../../../../utils';
import { msgCode, msgContent } from '../../../../config/string';
import { tableIdConfig } from '../../../../config/common';
import { updateRouteParamState } from '../../../../modules/urlParamStoreHdl';
import AsideMenuCollapseIcon from '../../../../components/AsideMenuCollapseIcon';

export default {
  name: 'ApplyToRoom',
  components: {
    FormOptBtn,
    AreaTreeComp,
    EZTable,
    AsideMenuCollapseIcon
  },
  props: {
    roomForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    sel: {
      type: Object,
      default: () => {
        return {
          roomData: []
        };
      }
    }
  },
  data() {
    return {
      // ========== 区域相关 ==========//
      areaTreeWidth: 250, // 初始值为默认最小宽度
      areaTreeCollapsed: false,
      currentAreaId: 0, // 标志当前进行操作的区域 id

      // ========== 房间相关 ==========//
      tableLoading: true,
      tableId: tableIdConfig.selfCheckTemplateApply,
      filters: [],
      columnConfig: [],
      roomData: [],
      selectData: [],
      selectionData: []

    };
  },
  mounted() {
    this.initTableConfig();
    this.getRoomTableData();
  },
  beforeDestroy() {
    this.$refs[this.tableId].clearState();
  },
  methods: {
    // ========== 区域相关 ==========//
    currentAreaChange(val, clear = false) {
      if (this.currentAreaId !== val) {
        this.currentAreaId = val;
        this.getRoomTableData(clear);
      }
    },
    // 已应用表格选中行
    selectionChanged(selection) {
      this.selectData = selection;
    },
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
      };
      assembleConfig(getTableCfgFromStorage(this.tableId));
      getTableConfig(this.tableId).then((config) => {
        assembleConfig(config);
      }).catch(err => {
      });
    },
    // 查询会议室列表
    getRoomTableData(clearTable = false) {
      if (clearTable) {
        // 清空 tableState 和 routeParamState 中的分页参数
        this.$store.commit('initTableState', this.tableId);
        updateRouteParamState(this.$route.name, { pageNo: '', pageSize: '', sort: '' });
      }
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const pageParam = {
        pageNo, pageSize, filters, sort,
        id: this.roomForm.id || '',
        category: this.roomForm.category || '',
        req: {}
      };
      pageParam.req['locationId'] = this.currentAreaId || 0;
      API.selfCheckRule.ruleTemplateApplyRoomList(pageParam).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomData = items.map(item => {
            return {
              ...item
            };
          });
          const selectionValue = [];
          (this.roomData || []).forEach(item => {
            if (item.isApplied === 'Y') {
              selectionValue.push({ ...item });
            }
          });
          if (selectionValue.length > 0) {
            this.selectionData = selectionValue;
          }
          updateTableState(this.tableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.tableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 清空表格默认选中
    clearSelectionData() {
      this.$refs[this.tableId].toggleSelection();
    },
    // 应用至房间
    applicationRoom() {
      this.$confirm(`确定要将自检模板应用至当前选中的${this.selectData.length}个房间吗？`, '应用至房间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          roomIdList: __.pluck(this.selectData || [], 'id'),
          id: this.roomForm.id
        };
        API.selfCheckRule.ruleTemplateApply(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '自检模板应用至房间成功' });
            this.selectionData = [];
            this.getRoomTableData();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    // 取消应用至房间
    cancelApplicationRoom() {
      this.$confirm(`确定要将自检模板取消应用至当前选中的${this.selectData.length}个房间吗？`, '应用至房间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          roomIdList: __.pluck(this.selectData || [], 'id'),
          id: this.roomForm.id
        };
        API.selfCheckRule.ruleTemplateApplyCancel(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '自检模板取消应用至房间成功' });
            this.selectionData = [];
            // this.clearSelectionData();
            this.getRoomTableData();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    }
  }
};
</script>

<style lang="less" scoped>

</style>
