<template>
  <div>
    <DeviceLayout>
      <div slot="baseInfo">
        <DeviceBaseInfo :status="deviceStatus"></DeviceBaseInfo>
      </div>
      <div slot="status">
        <DeviceDynamicStatus
          :include-keys="deviceStatusKeys"
          :status="deviceStatus"></DeviceDynamicStatus>
      </div>
      <div slot="control">
        <div
          v-if="abilities[devCtrFunc.setChannelPower.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">
            设备开关
            <span class="font-gray-70 font-size-second">（长按进行控制）</span>
          </div>
          <el-row>
            <el-col
              v-for="(control, idx) in controlButton"
              :span="12"
              :key="idx"
              :class="getPaddingClass(idx)"
              class="mar-btm">
              <el-button
                type="info"
                class="width-100 font-size-main"
                @mousedown.native="deviceControl(control, 'on')"
                @mouseup.native="deviceControl(control, 'off')">
                {{ control.label }}
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
import DeviceLayout from './partial/DeviceLayout';
import DeviceBaseInfo from './partial/DeviceBaseInfo';
import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
import { deviceCtrFunc } from '../../config/common';
import { commonString, msgCode, msgContent } from '../../config/string';
import {
  assembleDeviceAbility,
  checkRespCorrect,
  deviceControlHandle,
  messageHandle, transformDeviceInitStatus
} from '../../utils';
import { DevCtrTimerHdl } from '../../modules/deviceCtrTimerHdl';
import { RealTimeMsgHandle } from '../../modules/realTimeMsgHdl';

export default {
  name: 'Curtain',
  components: {
    DeviceLayout,
    DeviceBaseInfo,
    DeviceDynamicStatus
  },
  props: {
    deviceId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      devCtrFunc: deviceCtrFunc.curtain,
      controlStatus: '',
      deviceStatus: {},
      deviceStatusKeys: [
        'channel_power'
      ],
      ctrTimer: null,
      controlButton: [],

      // 设备A属性上报所支持的控制通用命令
      ctrMethodData: []
    };
  },
  computed: {
    devCtrLoading() {
      const timer = this.$store.state.devCtrTimer[this.deviceId] || {};
      return timer.active;
    },
    // 用于控制页面控制组件是否显示
    abilities() {
      return assembleDeviceAbility(this.ctrMethodData, this.devCtrFunc);
    }
  },
  created() {
    this.getDeviceDetail();
    RealTimeMsgHandle.subscribe([this.deviceId]);
    DevCtrTimerHdl.initTimer(this.deviceId);
  },
  destroyed() {
    clearTimeout(this.ctrTimer);
    RealTimeMsgHandle.unsubscribe([this.deviceId]);
  },
  methods: {
    getPaddingClass(idx) {
      return idx % 2 === 0 ? 'pad-rgt-5' : 'pad-lft-5';
    },
    initChannelData(data = {}) {
      if (data.hasOwnProperty('sub_devices')) {
        const { sub_devices = [] } = data;
        this.controlButton = sub_devices.map(item => {
          return {
            label: item.name,
            method: deviceCtrFunc.curtain.setChannelPower.method,
            channel: item.control_num
          };
        });
      }
    },
    updateCurtainStatus(msg = {}) {
      const data = msg[this.deviceId];
      if (!data) return;
      // 设备状态
      this.deviceStatus = {...this.deviceStatus, ...data};
      const { general_commands } = data;
      // 设备能力集
      general_commands && (this.ctrMethodData = general_commands);
      this.initChannelData(data);
    },
    getDeviceDetail() { // 获取设备初始状态
      const deviceId = this.deviceId;
      API.room.roomDeviceDetailByDeviceId({ id: deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const status = transformDeviceInitStatus(resp.data);
          this.updateCurtainStatus(status);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 设备控制
    deviceControl(control = {}, value) {
      const devCtrParams = {
        deviceId: this.deviceId,
        roomId: this.$route.params.rid,
        method: control.method,
        params: {
          channel: control.channel,
          power: value
        }
      };
        // todo  发送上升下降命令时，先发送暂停命令，间隔500毫秒在发送本身命令
      if (value === 'on') {
        // todo 临时解决方案 根据通道名称判断是不是同一个窗帘, 名称不一致会导致页面显示和控制问题 需分控上报
        (this.controlButton || []).forEach(item => {
          if (item.label.indexOf(control.label.substring(0, control.label.length - 1)) >= 0) {
            const stopParam = {
              ...devCtrParams,
              params: {
                channel: item.channel,
                power: 'off'
              }
            };
            deviceControlHandle(stopParam, {}, false);
          }
        });
        this.ctrTimer = setTimeout(function() {
          deviceControlHandle(devCtrParams, {}, false);
        }, 300);
      } else {
        clearTimeout(this.ctrTimer);
        deviceControlHandle(devCtrParams, {}, false);
      }
    }
  }
};
</script>

<style scoped>

</style>
