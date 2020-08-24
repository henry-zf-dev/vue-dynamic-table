<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="selfCheckReportData"
      @filterChange="getSelfCheckReportData"
      @pageChanged="getSelfCheckReportData"
      @sizeChanged="getSelfCheckReportData"
      @sortChanged="getSelfCheckReportData"
    ></EZTable>
  </div>
</template>

<script>
import { tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import { routerMeta } from '../../../../router/routerMeta';
import {
  assembleTableOptBtn,
  checkRespCorrect,
  getSelfCheckStatus, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updateTableState
} from '../../../../utils';
import { msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';

export default {
  name: 'SelfCheckReport',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.monitorSelfCheckReport,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      selfCheckReportData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getSelfCheckReportData();
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
                name: routerMeta.monitorDevOpsSelfCheckReportDetail.name,
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
    getSelfCheckReportData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.room.roomSelfCheckList(params).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.selfCheckReportData = items.map(item => {
            const checkItems = [];
            (item.checkItems || []).map(check => {
              checkItems.push('[ ' + check.ruleName + ' ] 触发：' + "<span class='font-color-danger'>" + (check.score || 0) + '分</span>');
            });
            const checkItemLable = checkItems.join(' ') || '未发现异常';
            const selfCheckStatus = getSelfCheckStatus(parseInt(item.score || 0));
            return {
              ...item,
              selfCheckText: selfCheckStatus.label,
              colorKey: selfCheckStatus.colorKey,
              classKey: selfCheckStatus.classKey,
              checkItemLable: checkItemLable,
              createdTime: momentTimeToString(item.createdTime)
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
    }
  }
};
</script>

<style scoped>

</style>
