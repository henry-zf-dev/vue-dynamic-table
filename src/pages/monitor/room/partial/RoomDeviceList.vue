<template>
  <EZTable
    v-loading="tableLoading"
    :table-id="tableId"
    :filters="filters"
    :columns="columnConfig"
    :rows="roomDeviceData"
    @filterChange="getRoomDeviceData"
    @pageChanged="getRoomDeviceData"
    @sizeChanged="getRoomDeviceData">
    <div v-if="roomDeviceData.length > 0" slot="customOpts">
      <el-tooltip :open-delay="300" content="链路图" placement="top">
        <el-button
          class="iconfont icon-lianlutu table-filter-opt-btn"
          @click="switchToGraphMode"></el-button>
      </el-tooltip>
    </div>
  </EZTable>
</template>

<script>
  import {
    assembleTableOptBtn,
    checkRespCorrect,
    deepCopyWithJson,
    getDeviceStatus,
    getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    judgeStrEqual,
    messageHandle,
    updateTableState
  } from '../../../../utils';
  import {
    commonConfig,
    tableIdConfig,
    tableOptBtnConfig,
    websocketType
  } from '../../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../../config/string';
  import EZTable from '../../../../components/table/EZTable';
  import FormOptBtn from '../../../../components/FormOptBtn';
  import {mapState} from 'vuex';

  export default {
    name: 'RoomDeviceList',
    components: {FormOptBtn, EZTable},
    props: {
      roomInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        commonConfig: commonConfig,
        commonString: commonString,
        tableIdConfig: tableIdConfig,

        // 列表模式相关数据源
        tableLoading: true,
        tableId: tableIdConfig.monitorRoomDevice,
        filters: [],
        columnConfig: [],
        roomDeviceData: [],
        deviceMonitorDialog: false, // 显示隐藏设备控制
        monitorDeviceInfo: {} // 当前选中监控设备信息

      };
    },
    computed: {
      ...mapState([
        'deviceOnlineMsg', 'deviceAlarmMsg', 'deviceStatusMsg', 'routeParamState'
      ])
    },
    watch: {
      deviceOnlineMsg() {
        const msg = this.$store.state.deviceOnlineMsg;
        this.updateRoomStatus(websocketType.deviceOnline, msg);
      },
      deviceAlarmMsg() {
        const msg = this.$store.state.deviceAlarmMsg;
        this.updateRoomStatus(websocketType.deviceAlarm, msg);
      },
      deviceStatusMsg() {
        const msg = this.$store.state.deviceStatusMsg;
        this.updateRoomStatus(websocketType.deviceStatus, msg);
      }
    },
    activated() {
      this.initTableConfig();
      this.getRoomDeviceData();
    },
    methods: {
      // 房间设备 table 相关
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.monitor.type:
                this.$emit('showMonitorDevice', data);
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
      // 有会议室告警、分数、使用状态、设备告警、在线/离线 推送后更新相关页面
      updateRoomStatus(type, msg) {
        if (!msg) return;
        const roomDeviceData = deepCopyWithJson(this.roomDeviceData);

        function getOnlineStatus(isOnline = '') {
          const connValues = Object.values(commonString.connectionStatus);
          return connValues.find(c => {
            return c.value === isOnline;
          }) || {};
        }

        function getDeviceExtText(status = []) {
          const statusTextArr = [];
          status.forEach(s => {
            const {show = false, cn = '', v = ''} = s;
            if (show) {
              statusTextArr.push(`${cn}: ${v}`);
            }
          });
          return statusTextArr.join('<br/>');
        }

        switch (type) {
          case websocketType.deviceOnline:
            roomDeviceData.forEach(device => {
              if (judgeStrEqual(msg.deviceId, device.id)) {
                device.isOnline = msg.isOnline;
                const onlineStatus = getOnlineStatus(msg.isOnline);
                device.isOnlineText = onlineStatus.label;
                device.isOnlineIcon = onlineStatus.icon;
                const alarmStatus = getDeviceStatus(device);
                device.deviceStatusType = alarmStatus.type || '';
                device.deviceAlarmText = alarmStatus.label || '';
                device.deviceAlarmIcon = alarmStatus.icon || '';
              }
            });
            this.roomDeviceData = roomDeviceData;
            break;
          case websocketType.deviceAlarm:
            roomDeviceData.forEach(device => {
              if (judgeStrEqual(msg.deviceId, device.id)) {
                device.alarmStatus = msg.alarmStatus;
                // 设备告警恢复时清空告警详情内容
                if (msg.alarmStatus === commonString.monitorStatus.normal.value) {
                  device.detail = '';
                }
                const alarmStatus = getDeviceStatus(device);
                device.deviceStatusType = alarmStatus.type || '';
                device.deviceAlarmText = alarmStatus.label || '';
                device.deviceAlarmIcon = alarmStatus.icon || '';
              }
            });
            this.roomDeviceData = roomDeviceData;
            break;
          case websocketType.deviceStatus:
            roomDeviceData.forEach(device => {
              const newStatus = msg[device.id];
              if (newStatus) {
                const {status = []} = device;
                status.forEach(s => {
                  if (newStatus.hasOwnProperty(s.k)) {
                    s.v = newStatus[s.k];
                  }
                });
                device.statusText = getDeviceExtText(status);
              }
            });
            this.roomDeviceData = roomDeviceData;
            break;
          default:
            break;
        }
      },
      // 根据房间 id 获取设备列表
      getRoomDeviceData() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        API.room.roomDeviceListByRoomId({
          id: this.$route.params.rid, pageNo, pageSize, filters, sort
        }).then(resp => {
          this.tableLoading = false;

          function getOnlineStatus(isOnline = '') {
            const connValues = Object.values(commonString.connectionStatus);
            return connValues.find(c => {
              return c.value === isOnline;
            }) || {};
          }

          function getDeviceExtText(status = []) {
            const statusTextArr = [];
            status.forEach(s => {
              const {show = false, cn = '', v = ''} = s;
              if (show) {
                statusTextArr.push(`${cn}: ${v}`);
              }
            });
            return statusTextArr.join('<br/>');
          }

          if (checkRespCorrect(resp)) {
            const {items = [], pageInfo = {}} = resp.data || {};
            this.roomDeviceData = items.map(device => {
              const {serverExt = {}} = device;
              const onlineStatus = getOnlineStatus(device.isOnline);
              const alarmStatus = getDeviceStatus(device);
              return {
                ...device,
                ...serverExt,
                deviceType: device['categoryCode'],
                isOnlineText: onlineStatus.label,
                isOnlineIcon: onlineStatus.icon,
                deviceAlarmType: alarmStatus.type,
                deviceAlarmText: alarmStatus.label,
                deviceAlarmIcon: alarmStatus.icon,
                statusText: getDeviceExtText(device.status)
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
      switchToGraphMode() {
        this.$emit('switchToGraphMode');
      }
    }
  };
</script>

<style scoped lang="less">

</style>
