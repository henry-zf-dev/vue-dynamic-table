<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="checkLogData"
      :selection="false"
      @filterChange="getSelfCheckLogData"
      @pageChanged="getSelfCheckLogData"
      @sizeChanged="getSelfCheckLogData"
      @sortChanged="getSelfCheckLogData"
    ></EZTable>
  </div>
</template>

<script>
import { tableIdConfig } from '../../../config/common';
import EZTable from '../../../components/table/EZTable';
import {
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updateTableState
} from '../../../utils';
import { msgCode, msgContent } from '../../../config/string';

export default {
  name: 'SelfCheckLog',
  components: {
    EZTable
  },
  props: {
    // 查询指定房间的自检日志
    // eslint-disable-next-line vue/require-prop-types
    roomId: {
      default: ''
    },
    ignoreColumn: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      tableId: tableIdConfig.monitorSelfCheckLog,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      checkLogData: []
    };
  },
  activated() {
    this.selfCheckTableConfig();
    this.getSelfCheckLogData();
  },
  methods: {
    selfCheckTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
      };
      assembleConfig(getTableCfgFromStorage(this.tableId, this.ignoreColumn));
      getTableConfig(this.tableId, this.ignoreColumn).then((config) => {
        assembleConfig(config);
      }).catch(err => {
      });
    },
    // 获取自检日志列表
    getSelfCheckLogData() {
      this.tableLoading = true;
      const { pageNo = 0, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
        // 房间监控页面，传递 roomId，用于查询指定房间的房间日志
      if (this.roomId) {
        filters.push({ fieldType: 'string', key: 'roomId', value: [this.roomId] });
      }
      API.systemLog.selfCheckLogList(params).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items, pageInfo = {} } = resp.data || {};
          this.checkLogData = (items || []).map(item => {
            return {
              ...item,
              createdTime: momentTimeToString(item.createdTime),
              resultName: item.isPass === 'Y' ? '通过' : '不通过'
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
