<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="roomAlarmRuleData"
      @filterChange="getRoomAlarmRuleData"
      @pageChanged="getRoomAlarmRuleData"
      @sizeChanged="getRoomAlarmRuleData"
      @sortChanged="getRoomAlarmRuleData">
    </EZTable>
  </div>
</template>

<script>
import EmptyContent from '../../../../components/EmptyContent';
import { tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import { routerMeta } from '../../../../router/routerMeta';
import {
  assembleTableOptBtn,
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updatePageNo,
  updateTableState
} from '../../../../utils';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';

export default {
  name: 'RoomAlarmRule',
  components: {
    EZTable, EmptyContent
  },
  data() {
    return {
      tableId: tableIdConfig.roomAlarmRule,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      roomAlarmRuleData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getRoomAlarmRuleData();
  },
  methods: {
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.$router.push({
                name: routerMeta.systemRoomAlarmList.name,
                params: { rid: data.id }
              });
              break;
            case tableOptBtnConfig.enable.type:
              this.modifyEnableStatus(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.modifyEnableStatus(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.delete.type:
              this.roomAlarmRuleDelete(data);
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
    getRoomAlarmRuleData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.alarmRule.roomAllAlarmRuleList(params).then(resp => {
        this.tableLoading = false;
        function getAlarmText(alarmConfigList = []) {
          return `<span>${__.pluck(alarmConfigList, 'name').join('、')} 共</span><span class="font-color-success">${alarmConfigList.length}项</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomAlarmRuleData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              alarmText: getAlarmText(item.alarmConfigList)
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
    roomAlarmRuleDelete(row) {
      this.$confirm(`确定要删除：${row.name}的全部告警规则吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.alarmRule.roomAlarmRuleDeleteByRoomId({ roomId: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间告警规则删除成功' });
            updatePageNo(this.tableId);
            this.getRoomAlarmRuleData();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    // 修改启用/禁用状态
    modifyEnableStatus(row, enableConfig = {}) {
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          roomId: row.id
        };
        API.alarmRule.roomAlarmRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomAlarmRuleData();
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '告警规则' + enableConfig.label + '成功' });
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
