<template>
  <div :style="{paddingTop: !showTableOnly ? '60px' : '0'}" class="alarm-page">
    <Breadcrumb v-if="!showTableOnly"></Breadcrumb>
    <div :class="{'page-container': !showTableOnly}">
      <div :class="{'table-container': !showTableOnly}">
        <EZTable
          v-loading="tableLoading"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="recordData"
          @filterChange="getDeviceAlarmList"
          @pageChanged="getDeviceAlarmList"
          @sizeChanged="getDeviceAlarmList"
          @sortChanged="getDeviceAlarmList"
        ></EZTable>
      </div>
    </div>
  </div>
</template>

<script>
  import {tableIdConfig, tableOptBtnConfig} from '../../config/common';
  import EZTable from '../../components/table/EZTable';
  import {
    assembleTableOptBtn,
    checkRespCorrect,
    getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    judgePermission,
    messageHandle, momentTimeToString,
    updateTableState
  } from '../../utils';
  import {commonString, msgContent} from '../../config/string';
  import {routerMeta} from '../../router/routerMeta';
  import Breadcrumb from '../../components/breadcrumb/Breadcrumb';

  export default {
    name: 'AlarmDevice',
    components: {
      EZTable, Breadcrumb
    },
    props: {
      // 是否只显示 table
      showTableOnly: {
        type: Boolean,
        default: false
      },
      // 查询指定房间的告警设备
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
        tableId: tableIdConfig.alarmDevice,
        columnConfig: [],
        filters: [],
        recordData: [],
        tableLoading: true
      };
    },
    activated() {
      this.initTableConfig();
      this.getDeviceAlarmList();
    },
    methods: {
      judgePerm: judgePermission,
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.getAlarmLog(data.id);
                break;
              default:
                break;
            }
          });
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
      getDeviceAlarmList() {
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const parMar = {pageNo, pageSize, filters, sort};
        // 房间监控页面，传递 roomId，用于查询指定房间的房间日志
        if (this.roomId) {
          filters.push({fieldType: 'string', key: 'roomId', value: [this.roomId]});
        }
        this.tableLoading = true;
        API.alarm.deviceAlarmList(parMar).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items, pageInfo = {}} = resp.data || {};
            const values = Object.values(commonString.monitorStatus);
            this.recordData = (items || []).map(item => {
              const deviceStatus = values.find(s => {
                return s.value === item.alarmStatus;
              }) || {};
              return {
                ...item,
                createdTime: momentTimeToString(item.createdTime),
                alarmStatusText: deviceStatus.label,
                alarmStatusType: deviceStatus.type,
                ipContent: __.pluck(item.ipParam || [], 'remoteIP').join('、')
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      getAlarmLog(id) { // 跳转到设备告警日志列表
        if (this.showTableOnly) {
          this.$emit('tableOptClick', id);
        } else {
          this.$router.push({
            name: routerMeta.alarmDeviceRecord.name,
            params: {did: id}
          });
        }
      }
    }
  };
</script>

<style scoped>

</style>
