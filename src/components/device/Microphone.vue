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
      <div v-loading="devCtrLoading" slot="control">
        <div
          v-if="abilities[devCtrFunc.setVolume.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">音量控制</div>
          <SliderControl
            :model="volume"
            :method="devCtrFunc.setVolume.method"
            param-key="volume"
            @sliderChanged="deviceControl"></SliderControl>
        </div>
        <div
          v-if="abilities[devCtrFunc.setMute.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">静音控制</div>
          <GroupButton
            :buttons="muteButton"
            :model="muteStatus"
            :method="devCtrFunc.setMute.method"
            param-key="mute"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setReboot.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">设备开关</div>
          <StatelessButton
            :method="devCtrFunc.setReboot.method"
            label="重启"
            icon="icon-shengcheng"
            @btnClicked="deviceControl"></StatelessButton>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import DeviceLayout from './partial/DeviceLayout';
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import GroupButton from './atomic/GroupButton';
  import StatelessButton from './atomic/StatelessButton';
  import SliderControl from './atomic/SliderControl';
  import {
    checkRespCorrect,
    messageHandle,
    deviceControlHandle,
    assembleDeviceAbility, transformDeviceInitStatus
  } from '../../utils';
  import {deviceCtrFunc, commonConfig} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'Microphone',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      GroupButton,
      StatelessButton,
      SliderControl
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        devCtrFunc: deviceCtrFunc.microphone,
        deviceStatus: {},
        deviceStatusKeys: [
          'mute', 'channel', 'RFIntensity', 'channel_mute', 'batteryRemaining'
        ],
        volume: 0,
        muteStatus: '',
        muteButton: [
          {
            label: '静音',
            icon: 'icon-jingyin',
            value: 'mute'
          },
          {
            label: '取消静音',
            icon: 'icon-quxiaojingyin',
            value: 'unmute'
          }
        ],
        powerStatus: '',
        powerButton: [
          {
            label: '唤醒',
            icon: 'icon-shengcheng',
            value: 'wake'
          },
          {
            label: '待机',
            icon: 'icon-xiumian',
            value: 'standby'
          }
        ],
        // 设备A属性上报所支持的控制通用命令
        ctrMethodData: [],
        // 设备控制后的预期值
        ctrExpect: {
          key: '',
          value: ''
        }
      };
    },
    computed: {
      ...mapState(['deviceStatusMsg']),
      devCtrLoading() {
        const timer = this.$store.state.devCtrTimer[this.deviceId] || {};
        return timer.active;
      },
      // 用于控制页面控制组件是否显示
      abilities() {
        return assembleDeviceAbility(this.ctrMethodData, this.devCtrFunc);
      }
    },
    watch: {
      deviceStatusMsg() {
        const msg = this.$store.state.deviceStatusMsg || {};
        this.updateMicrophoneStatus(msg);
      }
    },
    created() {
      this.getDeviceDetail();
      RealTimeMsgHandle.subscribe([this.deviceId]);
      DevCtrTimerHdl.initTimer(this.deviceId);
    },
    destroyed() {
      RealTimeMsgHandle.unsubscribe([this.deviceId]);
    },
    methods: {
      updateMicrophoneStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands, power, mute} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        power && (this.powerStatus = power);
        mute && (this.muteStatus = mute);

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {power: this.powerStatus, mute: this.muteStatus};
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateMicrophoneStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          console.log('##### err #####', err);
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 设备控制
      deviceControl(ctrParam, expParam) {
        const devCtrParams = {
          deviceId: this.deviceId,
          roomId: this.$route.params.rid,
          ...ctrParam
        };
        this.ctrExpect = expParam;
        const expConfig = {
          abilities: this.ctrMethodData,
          expect: expParam
        };
        deviceControlHandle(devCtrParams, expConfig).then(timeout => {
          DevCtrTimerHdl.startTimer(this.deviceId, timeout);
        }).catch(err => {
        });
      }
    }
  };
</script>

<style scoped>
</style>
