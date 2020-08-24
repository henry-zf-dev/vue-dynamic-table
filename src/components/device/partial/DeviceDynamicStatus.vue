<template>
  <div class="device-dynamic-status">
    <el-table
      :data="[true]"
      :show-header="false">
      <el-table-column prop="alias">
        <span><i class="iconfont icon-lianjiezhuangtai mar-rgt-10"></i>设备连接</span>
      </el-table-column>
      <el-table-column prop="valueAlias">
        <i :class="connectionStatus.icon" class="iconfont"></i>
        <span class="font-gray-40">{{ connectionStatus.label }}</span>
      </el-table-column>
    </el-table>
    <el-table
      :data="[true]"
      :show-header="false">
      <el-table-column prop="alias">
        <span><i class="iconfont icon-shebeizhuangtai mar-rgt-10"></i>设备状态</span>
      </el-table-column>
      <el-table-column prop="valueAlias">
        <div
          :class="{'cursor-pointer': status.alarmId && generalStatus.value === commonString.monitorStatus.alarm.value}"
          @click="deviceRuleDetail">
          <i :class="generalStatus.icon" class="iconfont"></i>
          <span class="font-gray-40">{{ generalStatus.label }}</span>
        </div>
      </el-table-column>
    </el-table>
    <el-table
      v-if="structures.length > 0"
      :data="structures"
      :show-header="false">
      <el-table-column prop="alias"></el-table-column>
      <el-table-column prop="valueAlias">
        <template slot-scope="scope">
          <span class="font-gray-40">{{ scope.row.valueAlias }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
  import {commonString} from '../../../config/string';
  import {routerMeta} from '../../../router/routerMeta';
  import {mapState} from 'vuex';
  import {getStorage, StorageKey} from '../../../config/sessions';
  import {judgeStrEqual, objectFlatten} from '../../../utils';

  export default {
    name: 'DeviceDynamicStatus',
    props: {
      status: {
        type: Object,
        default: () => {
          return {};
        }
      },
      includeKeys: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    data() {
      return {
        commonString: commonString,
        connectionStatus: commonString.unknownStatus,
        generalStatus: commonString.unknownStatus,
        structures: [],
        genCommParams: [],
        watchedStatus: {}
      };
    },
    computed: {
      ...mapState(['deviceOnlineMsg', 'deviceAlarmMsg'])
    },
    watch: {
      status: {
        handler() {
          this.initGenCommParams();
          this.updateConnectionStatus();
          this.updateGeneralStatus();
          this.updateDynamicStatus();
        },
        immediate: true
      },
      deviceOnlineMsg() {
        if (__.isEmpty(this.status)) return;
        const msg = this.$store.state.deviceOnlineMsg;
        if (!msg || !judgeStrEqual(msg.deviceId, this.status.id)) return;
        this.status['isOnline'] = msg.isOnline || '';
        this.updateConnectionStatus(msg);
      },
      deviceAlarmMsg() {
        if (__.isEmpty(this.status)) return;
        const msg = this.$store.state.deviceAlarmMsg;
        if (!msg || !judgeStrEqual(msg.deviceId, this.status.id)) return;
        this.status['alarmStatus'] = msg.alarmStatus || '';
        this.updateGeneralStatus(msg);
      }
    },
    methods: {
      // 设备连接状态、告警状态相关
      updateConnectionStatus() {
        if (this.status['isOnline']) {
          this.connectionStatus = Object.values(commonString.connectionStatus).find(c => {
            return c.value === this.status['isOnline'];
          }) || commonString.unknownStatus;
          if (this.connectionStatus.value === commonString.connectionStatus.offline.value &&
            this.generalStatus.value === commonString.monitorStatus.normal.value) {
            this.generalStatus = commonString.unknownStatus;
          } else {
            this.updateGeneralStatus();
          }
        }
      },
      updateGeneralStatus() {
        if (this.status['deviceStatus']) {
          if (this.status.deviceStatus === commonString.availableStatus.breakdown.value) {
            this.generalStatus = commonString.availableStatus.breakdown;
            return;
          }
        }
        if (this.status['alarmStatus']) {
          this.generalStatus = Object.values(commonString.monitorStatus).find(c => {
            if (this.connectionStatus.value === commonString.connectionStatus.offline.value && this.status['alarmStatus'] === commonString.monitorStatus.normal.value) {
              return c.value === commonString.unknownStatus.value;
            } else {
              return c.value === this.status['alarmStatus'];
            }
          }) || commonString.unknownStatus;
        }
      },
      deviceRuleDetail() {
        if (!this.status.alarmId ||
          this.generalStatus.value !== commonString.monitorStatus.alarm.value) return;
        this.$router.push({
          name: routerMeta.alarmDetail.name,
          params: {
            aid: this.status.alarmId
          }
        });
      },
      // 设备其他状态相关
      initGenCommParams() {
        const genCommands = getStorage(StorageKey.genComm, true) || [];
        const genCommInfo = genCommands.find(gc => {
          return gc.deviceType === this.status.deviceType;
        });
        if (!genCommInfo) return;
        const {generalCommands = []} = genCommInfo;
        let genCommParams = [];
        generalCommands.forEach(gc => {
          // 过滤出 查询、被动命令
          const params = [];
          if (parseInt(gc.type) === 2 || parseInt(gc.type) === 4) {
            const {control = [], status = []} = gc;
            __.union(control, status).forEach(p => {
              const {key, storeKey} = p;
              params.push({
                ...p,
                key: key !== storeKey ? `${storeKey}.${key}` : key
              });
            });
            genCommParams = __.union(genCommParams, params);
          }
        });
        this.genCommParams = genCommParams;
      },
      getStatusValueAlias(param) {
        const {enumList = []} = param;
        let value = this.watchedStatus[param.key];
        if (!enumList.length && !isNaN(value)) {
          const numVal = parseFloat(value);
          value = numVal.toFixed(numVal > 1 ? 0 : 2);
        }
        const config = enumList.find(e => {
          return e.key === value;
        }) || {};
        return config.alias || value || commonString.unknown;
      },
      updateDynamicStatus() {
        const flattenData = objectFlatten(this.status, false, this.includeKeys);
        this.watchedStatus = {...this.watchedStatus, ...flattenData};
        const structures = [];
        Object.keys(this.watchedStatus).forEach(key => {
          const param = this.genCommParams.find(p => p.key === key) || {};
          if (param.alias) {
            structures.push({
              ...param,
              valueAlias: this.getStatusValueAlias(param)
            });
          }
        });
        this.structures = structures;
        // 将组装好的状态返回，父组件可能会用到
        this.$emit('statusUpdated', this.structures);
      }
    }
  };
</script>

<style scoped>

</style>
