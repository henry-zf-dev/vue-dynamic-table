<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="roomReportData"
      @filterChange="getRoomReportData"
      @pageChanged="getRoomReportData"
      @sizeChanged="getRoomReportData"
      @sortChanged="getRoomReportData"
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
  name: 'RoomReport',
  components: {
    EZTable
  },
  props: {
    // 查询指定房间的报告
    // eslint-disable-next-line vue/require-prop-types
    roomId: {
      default: ''
    }
  },
  data() {
    return {
      tableId: tableIdConfig.monitorRoomReport,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      roomReportData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getRoomReportData();
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
              const params = { rid: data.id, roomId: data.roomId };
              this.roomId && (params['withExtraParent'] = true);
              this.$router.push({
                name: routerMeta.monitorRoomReportDetail.name,
                params: params
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
    getRoomReportData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
        // 房间监控页面，传递 roomId，用于查询指定房间的房间日志
      if (this.roomId) {
        filters.push({ fieldType: 'string', key: 'roomId', value: [this.roomId] });
      }
      API.devOpsReport.roomReportList(params).then(resp => {
        this.tableLoading = false;
        function getReportResultsHtml(item) {
          return `<span><span>全部自检 ${item.rulesCount || 0}次</span><span> 未通过自检 <span class="font-color-danger">${item.failedRulesCount || 0}次</span></span><span> 告警 <span class="font-color-danger">${item.alarmCount || 0}次</span></span></span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomReportData = items.map(item => {
            return {
              ...item,
              reportResults: getReportResultsHtml(item),
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
