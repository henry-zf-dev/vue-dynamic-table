<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="jointCheckReportData"
      @filterChange="getJointCheckReportData"
      @pageChanged="getJointCheckReportData"
      @sizeChanged="getJointCheckReportData"
      @sortChanged="getJointCheckReportData"
    ></EZTable>
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
import { msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';

export default {
  name: 'JointCheckReport',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.monitorJointCheckReport,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      jointCheckReportData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getJointCheckReportData();
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
                name: routerMeta.monitorDevOpsJointCheckReportDetail.name,
                params: { jid: data.id }
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
    getJointCheckReportData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.room.roomJointCheckList(params).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.jointCheckReportData = items.map(item => {
            const { report = [] } = item;
            const flags = __.pluck(report, 'flag');
            const countOccurrences = (arr, value) => arr.reduce((a, v) => (v === value ? a + 1 : a + 0), 0);// 获取某个值在数组中出现的次数
            const count = countOccurrences(flags, false);
            function getResultText(txt) {
              const notPass = [];
              txt.forEach(result => {
                if (!result.flag) {
                  notPass.push(`<span>${result.deviceName || ''} ${result.stateName || ''} ${result.operatorsName || ''} ${result.expectedValueName || ''}</span><span class="font-color-danger"> 未通过</span>`);
                }
              });
              const adopt = countOccurrences(flags, true) > 0 ? `<span class="font-color-success"> ${countOccurrences(flags, true)}项通过</span>` : '';
              return notPass.join('、') + adopt;
            }
            return {
              ...item,
              resultCount: item.isSuccess === 'Y' ? '通过' : count ? count + '项未通过' : '未通过',
              resultContent: getResultText(report),
              levelType: item.isSuccess === 'Y' ? 'success' : 'warning',
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
