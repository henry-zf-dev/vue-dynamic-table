<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="roomSelfCheckRuleData"
      @filterChange="getRoomSelfCheckRuleData"
      @pageChanged="getRoomSelfCheckRuleData"
      @sizeChanged="getRoomSelfCheckRuleData"
      @sortChanged="getRoomSelfCheckRuleData">
    </EZTable>
  </div>
</template>

<script>
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
  name: 'RoomSelfCheckRule',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.roomSelfCheckRule,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      roomSelfCheckRuleData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getRoomSelfCheckRuleData();
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
                name: routerMeta.systemRoomSelfCheckList.name,
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
              this.roomSelfCheckRuleDelete(data);
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
    getRoomSelfCheckRuleData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.selfCheckRule.roomAllSelfCheckRuleList(params).then(resp => {
        this.tableLoading = false;
        function getOperators(ruleList = []) {
          if (!ruleList.length) return '';
          return `<span>${__.pluck(ruleList, 'name').join('、')} 共</span><span class="font-color-success">${ruleList.length}项</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomSelfCheckRuleData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              operatorsHtml: getOperators(item.ruleList)
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
    // 修改启用/禁用状态
    modifyEnableStatus(row, enableConfig = {}) {
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '的自检规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          roomId: row.id
        };
        API.selfCheckRule.roomSelfCheckRuleAllEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomSelfCheckRuleData();
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
    roomSelfCheckRuleDelete(row) { // 房间自检删除
      this.$confirm('确认要删除' + row.name + '的自检规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.selfCheckRule.roomSelfCheckRuleAllDelete({ roomId: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            updatePageNo(getTableState(this.tableId));
            this.getRoomSelfCheckRuleData();
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间自检规则删除成功' });
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
