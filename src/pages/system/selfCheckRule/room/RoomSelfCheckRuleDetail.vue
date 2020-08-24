<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="roomName"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="selfCheckData"
          @filterChange="getRoomSelfCheck"
          @pageChanged="getRoomSelfCheck"
          @sizeChanged="getRoomSelfCheck"
          @sortChanged="getRoomSelfCheck">
          <div slot="empty">
            <EmptyContent :opt-data="selfEmptyBtn"></EmptyContent>
          </div>
        </EZTable>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { permissionConfig } from '../../../../config/permission';
import { tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import EmptyContent from '../../../../components/EmptyContent';
import EZTable from '../../../../components/table/EZTable';
import {
  assembleTableOptBtn,
  checkRespCorrect, getRoomByIdDetail, getTableCfgFromStorage, getTableConfig,
  getTableState,
  judgePermission,
  messageHandle, momentTimeToString, updatePageNo,
  updateTableState
} from '../../../../utils';
import { routerMeta } from '../../../../router/routerMeta';
import { commonString, msgCode, msgContent } from '../../../../config/string';

export default {
  name: 'RoomSelfCheckRuleDetail',
  components: {
    Breadcrumb, EZTable, EmptyContent
  },
  data() {
    return {
      breadcrumbHeight: 0,
      tableId: tableIdConfig.monitorRoomSelfCheckRule,
      columnConfig: [],
      filters: [],
      selfCheckData: [],
      tableLoading: true,
      roomId: '',
      roomName: '',
      selfEmptyBtn: [
        {
          type: 'btn',
          label: '添加自检',
          icon: 'icon-tianjia',
          perm: permissionConfig.system,
          callback: () => {
            this.selfCheckAdd();
          }
        }
      ]
    };
  },
  computed: {
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '新增自检',
          icon: 'icon-tianjia',
          perm: permissionConfig.system,
          callback: () => {
            this.selfCheckAdd();
          }
        }
      ];
    }
  },
  activated() {
    this.initData();
  },
  methods: {
    judgePerm: judgePermission,
    initData() {
      this.roomId = this.$route.params.rid || '';
      getRoomByIdDetail(this.roomId).then(item => {
        this.roomName = item || '';
      });
      this.initTableConfig();
      this.getRoomSelfCheck();
    },
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.selfCheckDetail(data);
              break;
            case tableOptBtnConfig.edit.type:
              this.selfCheckEdit(data);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.selfCheckEnable(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.enable.type:
              this.selfCheckEnable(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.delete.type:
              this.selfCheckDelete(data);
              break;
            case tableOptBtnConfig.setAlarm.type:
              this.setAlarm(data);
              break;
            default:
              break;
          }
        });
      };
      assembleConfig(getTableCfgFromStorage(this.tableId));
      getTableConfig(this.tableId).then((config) => {
        assembleConfig(config);
      }).catch(err => {
      });
    },
    getRoomSelfCheck() { // 查询房间自检列表
      const { pageNo = 1, pageSize = 10, filters = [], sort = [] } = getTableState(this.tableId);
      const parMar = {
        pageNo, pageSize, filters, sort,
        roomId: this.roomId
      };
      this.tableLoading = true;
      API.selfCheckRule.roomSelfCheckRuleListByRoomId(parMar).then(resp => {
        this.tableLoading = false;
        function getOperatorsText(item) {
          return `<span>${item.stateName ? item.stateName : ''}</span><span class="font-color-success">${item.operatorsName ? item.operatorsName : ''}${item.expectedValueName ? item.expectedValueName : ''}</span>`;
        }
        function getScene(name) {
          if (!name) return '';
          return `<span class="font-color-success">${name}</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.selfCheckData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              mark: '通过场景触发',
              sceneHtml: getScene(item.sceneName),
              deviceName: item.deviceName || '',
              operatorsHtml: getOperatorsText(item),
              durationContent: item.duration > 0 ? `持续异常${item.duration}分钟` : '只要出现一次'
            };
          });
          updateTableState(this.tableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.tableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    selfCheckAdd() { // 新增房间自检
      this.$router.push({
        name: routerMeta.systemRoomSelfCheckListAdd.name,
        params: {
          rid: this.roomId,
          isCheck: 1
        }
      });
    },
    selfCheckDetail(row) { // 自检详情
      this.$router.push({
        name: routerMeta.systemRoomSelfCheckListDetail.name,
        params: {
          rid: this.roomId,
          sid: row.id,
          isCheck: 1
        }
      });
    },
    selfCheckEdit(row) { // 修改房间自检
      this.$router.push({
        name: routerMeta.systemRoomSelfCheckListEdit.name,
        params: {
          rid: this.roomId,
          sid: row.id,
          isCheck: 1
        }
      });
    },
    setAlarm(row) { // 设为告警
      this.$router.push({
        name: routerMeta.systemRoomSelfCheckListSetAlarm.name,
        params: {
          sid: row.id,
          rid: this.roomId,
          isCheck: 1
        }
      });
    },
    selfCheckEnable(row, enableConfig) { // 房间自检禁用/启用
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          ruleId: row.id,
          roomId: this.roomId
        };
        API.selfCheckRule.roomSelfCheckRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomSelfCheck();
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '房间自检规则' + enableConfig.label + '成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    selfCheckDelete(row) {
      this.$confirm('确认要删除房间自检规则' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.selfCheckRule.roomSelfCheckRuleDelete({ ruleId: row.id, roomId: this.roomId }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间自检规则删除成功' });
            updatePageNo(this.tableId);
            this.getRoomSelfCheck();
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

<style scoped>

</style>
