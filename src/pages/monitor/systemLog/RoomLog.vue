<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="roomLogData"
      @filterChange="getRoomLogData"
      @pageChanged="getRoomLogData"
      @sizeChanged="getRoomLogData"
      @sortChanged="getRoomLogData"
      @listClickJump="listClickJump"
    ></EZTable>
  </div>
</template>

<script>
  import {tableIdConfig} from '../../../config/common';
  import EZTable from '../../../components/table/EZTable';
  import {
    checkRespCorrect, getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    messageHandle,
    momentTimeToString,
    updateTableState
  } from '../../../utils';
  import {msgCode, msgContent} from '../../../config/string';
  import routerMeta from '../../../router/monitor';

  export default {
    name: 'RoomLog',
    components: {
      EZTable
    },
    props: {
      // 查询指定房间的日志
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
        tableId: tableIdConfig.monitorRoomLog,
        tableLoading: true,
        filters: [],
        columnConfig: [],
        tableOptBtn: [],
        roomLogData: []
      };
    },
    activated() {
      this.initTableConfig();
      this.getRoomLogData();
    },
    methods: {
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
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
      getRoomLogData() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort
        };
        // 房间监控页面，传递 roomId，用于查询指定房间的房间日志
        if (this.roomId) {
          filters.push({fieldType: 'string', key: 'roomId', value: [this.roomId]});
        }
        API.systemLog.roomLogList(params).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items, pageInfo = {}} = resp.data || {};
            this.roomLogData = (items || []).map(item => {
              return {
                ...item,
                logTime: momentTimeToString(item.logTime)
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 列表点击跳转集合
      listClickJump(type, data) {
        switch (type) {
          case 'roomName':
          case 'roomLocation':
            this.$router.push({
              name: routerMeta.monitorRoomDetail.name,
              params: {rid: data.roomId}
            });
            break;
          default:
            break;
        }
      }
    }
  };
</script>

<style scoped>

</style>
