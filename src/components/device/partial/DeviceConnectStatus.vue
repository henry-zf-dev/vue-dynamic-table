<template>
  <div>
    <div class="header5 pad-top-30 pad-btm-30">设备状态</div>
    <el-row class="header6 font-weight-regular font-gray-40" style="padding-top: 12px; padding-bottom: 12px">
      <el-col :span="10"><i class="iconfont icon-lianjiezhuangtai mar-rgt-10"></i>设备连接</el-col>
      <el-col :span="14">
        <i :class="connectionStatus.icon" class="iconfont"></i>
        <span class="font-gray-10">{{ connectionStatus.label }}</span>
      </el-col>
      <el-col :span="24" class="">
        <el-divider></el-divider>
      </el-col>
    </el-row>
    <el-row class="header6 font-weight-regular font-gray-40" style="padding-top: 12px; padding-bottom: 12px">
      <el-col :span="10"><i class="iconfont icon-shebeizhuangtai mar-rgt-10"></i>设备状态</el-col>
      <el-col :span="14">
        <i :class="generalStatus.icon" class="iconfont"></i>
        <span class="font-gray-10 cursor-pointer" @click="deviceRuleDetail">{{ generalStatus.label }}</span>
      </el-col>
      <el-col :span="24" class="">
        <el-divider></el-divider>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { commonConfig } from '../../../config/common';
import { commonString } from '../../../config/string';
import { routerMeta } from '../../../router/routerMeta';
import { mapState } from 'vuex';
import {judgeStrEqual} from "../../../utils";

export default {
  name: 'DeviceConnectStatus',
  props: {
    status: {
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
      connectionStatus: commonString.unknownStatus,
      generalStatus: commonString.unknownStatus
    };
  },
  computed: {
    ...mapState(['deviceOnlineMsg', 'deviceAlarmMsg'])
  },
  watch: {
    deviceOnlineMsg() {
      if (__.isEmpty(this.status)) return;
      const msg = this.$store.state.deviceOnlineMsg;
      if (!msg || judgeStrEqual(msg.deviceId, this.status.id)) return;
      this.updateConnectionStatus(msg);
    },
    deviceAlarmMsg() {
      if (__.isEmpty(this.status)) return;
      const msg = this.$store.state.deviceAlarmMsg;
      if (!msg || judgeStrEqual(msg.deviceId, this.status.id)) return;
      this.updateGeneralStatus(msg);
    },
    'status.deviceStatus'() {
      if (__.isEmpty(this.status)) return;
      // this.initStatus();
      this.updateGeneralStatus(this.status);
    }
  },
  created() {
    this.initStatus();
  },
  methods: {
    initStatus() {
      this.updateConnectionStatus(this.status);
      this.updateGeneralStatus(this.status);
    },
    updateConnectionStatus(data = {}) {
      if (data['isOnline']) {
        this.connectionStatus = Object.values(commonString.connectionStatus).find(c => {
          return c.value === data['isOnline'];
        }) || commonString.unknownStatus;
        if (this.connectionStatus.value === commonString.connectionStatus.offline.value && this.generalStatus.value === commonString.monitorStatus.normal.value) {
          this.generalStatus = commonString.unknownStatus;
        } else {
          this.updateGeneralStatus(this.status);
        }
      }
    },
    updateGeneralStatus(data = {}) {
      if (data['deviceStatus']) {
        if (data.deviceStatus === commonString.availableStatus.breakdown.value) {
          this.generalStatus = commonString.availableStatus.breakdown;
          return;
        }
      }
      if (data['alarmStatus']) {
        this.generalStatus = Object.values(commonString.monitorStatus).find(c => {
          if (this.connectionStatus.value === commonString.connectionStatus.offline.value && data['alarmStatus'] === commonString.monitorStatus.normal.value) {
            return c.value === commonString.unknownStatus.value;
          } else {
            return c.value === data['alarmStatus'];
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
    }
  }
};
</script>

<style scoped>

</style>
