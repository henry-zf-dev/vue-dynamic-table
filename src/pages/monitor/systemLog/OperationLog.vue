<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="operationData"
      @filterChange="getOperationLogData"
      @pageChanged="getOperationLogData"
      @sizeChanged="getOperationLogData"
      @sortChanged="getOperationLogData"
    ></EZTable>
  </div>
</template>

<script>
import { commonString, msgCode, msgContent } from '../../../config/string';
import { logModuleName, logOperationType, tableIdConfig } from '../../../config/common';
import EZTable from '../../../components/table/EZTable';
import {
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updateTableState
} from '../../../utils';

export default {
  name: 'OperationLog',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.monitorOperationLog,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      operationData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getOperationLogData();
  },
  methods: {
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
    getOperationLogData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.systemLog.operationLogList(params).then(resp => {
        this.tableLoading = false;
        function getLogDesText(logDesStr = '[]') {
          try {
            const destDesArr = [];
            JSON.parse(logDesStr).forEach(log => {
              if (!log.oldValue && !log.newValue) {
                destDesArr.push(`<span>${log.key || ''}</span>`);
              } else {
                destDesArr.push(`<span>${log.key || ''}: </span><span>${log.oldValue || ''}</span><span class="font-color-danger"> => </span><span>${log.newValue || ''}</span>`);
              }
            });
            return destDesArr.join('<br/>');
          } catch (e) {
            return commonString.unknown;
          }
        }
        function getLogStatusText(status = '') {
          switch (status) {
            case 'SUCCESS':
              return '操作成功';
            case 'FAILED':
              return '操作失败';
            default:
              return commonString.unknown;
          }
        }
        if (checkRespCorrect(resp)) {
          const { items, pageInfo = {} } = resp.data || {};
          this.operationData = (items || []).map(item => {
            const logContent = Object.values(logOperationType).find(log => {
              return log.type === item.logType;
            }) || {};
            const logName = Object.values(logModuleName).find(name => {
              return name.type === item.entityType;
            }) || {};
            return {
              ...item,
              logTypeText: `${(logContent.label || commonString.unknown)}${logName.label || ''}`,
              statusText: getLogStatusText(item.status),
              logDesText: getLogDesText(item.logDes),
              operationIpContent: `IP：${item.operationIp || commonString.unknown}`,
              operationTime: momentTimeToString(item.operationTime)
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
