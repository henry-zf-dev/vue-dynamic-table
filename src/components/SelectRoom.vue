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
          :style="{marginLeft: areaTreeCollapsed ? '0' : `${areaTreeWidth + 8}px`,
                   width: areaTreeCollapsed ? '100%' : `calc(100% - ${areaTreeWidth + 8}px)`}"
          class="position-relative">
          <div class="table-container pad-all">
            <div class="mar-btm-10">
              <span class="room-select-text">已选择 <span class="font-color-primary ">{{ selectData.length }}</span> 条</span>
              <el-button class="mar-lft-20" size="small" type="primary" @click="apply">应用</el-button>
              <el-button class="mar-lft" size="small" type="info" @click="cancel">取消</el-button>
            </div>
            <EZTable
              v-loading="roomTableLoading"
              :table-id="tableId"
              :ref="tableId"
              :filters="filters"
              :columns="columnConfig"
              :rows="roomData"
              :selection-data="selectData"
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
import FormOptBtn from './FormOptBtn';
import AreaTreeComp from './AreaTreeComp';
import EZTable from './table/EZTable';
import {
  checkRespCorrect,
  getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  updateTableState
} from '../utils';
import { msgCode, msgContent } from '../config/string';
import { tableIdConfig } from '../config/common';
import { updateRouteParamState } from '../modules/urlParamStoreHdl';
import AsideMenuCollapseIcon from '../components/AsideMenuCollapseIcon';

export default {
  name: 'SelectRoom',
  components: {
    FormOptBtn,
    AreaTreeComp,
    EZTable,
    AsideMenuCollapseIcon
  },
  props: {
    applyClick: {
      type: Function,
      default: () => {
        return () => {};
      }
    },
    cancelClick: {
      type: Function,
      default: () => {
        return () => {};
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
      roomTableLoading: false,
      tableId: tableIdConfig.selectRoom,
      filters: [],
      columnConfig: [],
      roomData: [],
      selectData: []
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
      this.roomTableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const pageParam = {
        pageNo, pageSize, filters, sort,
        req: {}
      };
      pageParam.req['locationId'] = this.currentAreaId || 0;
      API.room.roomList(pageParam).then(resp => {
        this.roomTableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomData = items.map(item => {
            return {
              ...item
            };
          });
          updateTableState(this.tableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.roomTableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 清空表格默认选中
    clearSelectionData() {
      this.$refs[this.tableId].toggleSelection();
    },
    // 应用
    apply() {
      this.$emit('applyClick', this.selectData || []);
    },
    // 取消
    cancel() {
      this.$emit('cancelClick');
    }
  }
};
</script>

<style lang="less" scoped>

</style>
