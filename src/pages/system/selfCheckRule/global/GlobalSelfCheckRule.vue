<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="globalSelfCheckRuleData"
      @filterChange="getGlobalSelfCheckRuleData"
      @pageChanged="getGlobalSelfCheckRuleData"
      @sizeChanged="getGlobalSelfCheckRuleData"
      @sortChanged="getGlobalSelfCheckRuleData">
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
  updateTableState
} from '../../../../utils';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';

export default {
  name: 'GlobalSelfCheckRule',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.globalSelfCheckRule,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      globalSelfCheckRuleData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getGlobalSelfCheckRuleData();
  },
  methods: {
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.edit.type:
              this.$router.push({
                name: routerMeta.systemGlobalSelfCheckEdit.name,
                params: { sid: data.id }
              });
              break;
            case tableOptBtnConfig.enable.type:
              this.modifyEnableStatus(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.modifyEnableStatus(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.setAlarm.type:
              this.$router.push({
                name: routerMeta.systemGlobalSelfCheckSetAlarm.name,
                params: { sid: data.id }
              });
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
    getGlobalSelfCheckRuleData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.selfCheckRule.globalSelfCheckRuleList(params).then(resp => {
        this.tableLoading = false;
        function getOperators(item) {
          return `<span>${item.stateName ? item.stateName : ''}</span><span class="font-color-success">${item.operatorsName ? item.operatorsName : ''}${item.expectedValueName ? item.expectedValueName : ''}</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.globalSelfCheckRuleData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              operatorsHtml: getOperators(item),
              durationContent: item.duration > 0 ? `持续异常${item.duration}分钟` : '只要有异常'
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
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          id: row.id
        };
        API.selfCheckRule.globalSelfCheckRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getGlobalSelfCheckRuleData();
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
