<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="deviceLogData"
      @filterChange="getDeviceLog"
      @pageChanged="getDeviceLog"
      @sizeChanged="getDeviceLog"
      @sortChanged="getDeviceLog"
    ></EZTable>
  </div>
</template>

<script>
import { logOperationType, tableIdConfig } from '../../../config/common';
import {
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updateTableState
} from '../../../utils';
import { msgCode, msgContent } from '../../../config/string';
import EZTable from '../../../components/table/EZTable';

export default {
  name: 'DeviceLog',
  components: {
    EZTable
  },
  props: {
    // 查询指定房间的设备日志
    // eslint-disable-next-line vue/require-prop-types
    roomId: {
      default: ''
    },
    ignoreColumn: {
      type: Array,
      default: () => {
        return [];
      }
    },
    ignoreFilter: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      tableId: tableIdConfig.monitorDeviceLog,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      deviceLogData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getDeviceLog();
  },
  methods: {
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
      };
      assembleConfig(
        getTableCfgFromStorage(this.tableId, this.ignoreColumn, this.ignoreFilter)
      );
      getTableConfig(this.tableId, this.ignoreColumn, this.ignoreFilter)
        .then((config) => {
          assembleConfig(config);
        }).catch(err => {
        });
    },
    getDeviceLog() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
        // 房间监控页面，传递 roomId，用于查询指定房间的房间日志
      if (this.roomId) {
        filters.push({ fieldType: 'string', key: 'roomId', value: [this.roomId] });
      }
      API.systemLog.deviceLogList(params).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items, pageInfo = {} } = resp.data || {};
          this.deviceLogData = (items || []).map(item => {
            const logContent = (Object.values(logOperationType) || []).find(log => log.type === item.logType);
            return {
              ...item,
              logTime: momentTimeToString(item.logTime),
              logTypeText: logContent ? logContent.label : '未知'
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
