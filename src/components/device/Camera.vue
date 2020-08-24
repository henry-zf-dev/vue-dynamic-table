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
          v-if="abilities[devCtrFunc.setHorizontal.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">设备控制</div>
          <CameraPanel
            :methods="cameraCtrMethods"
            @cameraControl="deviceControl"></CameraPanel>
        </div>
        <div
          v-if="abilities[devCtrFunc.setMode.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">设备预设</div>
          <GroupButton
            v-if="modeButton.length > 0"
            :buttons="modeButton"
            :model="currentMode"
            :method="devCtrFunc.setMode.method"
            param-key="mode"
            @btnClicked="deviceControl"></GroupButton>
          <div v-else class="position-relative" style="height: 250px">
            <EmptyContent empty-text="暂无可用预设"></EmptyContent>
          </div>
        </div>
        <div
          v-if="abilities[devCtrFunc.setMonitor.method]"
          class="device-monitor-unit">
          <GroupButton
            :buttons="monitorButton"
            :model="monitorStatus"
            :method="devCtrFunc.setMonitor.method"
            param-key="monitor"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setPower.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">设备开关</div>
          <GroupButton
            :buttons="powerButton"
            :model="powerStatus"
            :method="devCtrFunc.setPower.method"
            param-key="power"
            @btnClicked="deviceControl"></GroupButton>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import EmptyContent from '../EmptyContent';
  import DeviceLayout from './partial/DeviceLayout';
  import GroupButton from './atomic/GroupButton';
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import CameraPanel from './assemble/CameraPanel';
  import {
    checkRespCorrect,
    messageHandle,
    deviceControlHandle,
    assembleDeviceAbility, transformDeviceInitStatus
  } from '../../utils';
  import {deviceCtrFunc} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'Camera',
    components: {
      DeviceLayout,
      GroupButton,
      CameraPanel,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      EmptyContent
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        devCtrFunc: deviceCtrFunc.camera,
        deviceStatus: {},
        deviceStatusKeys: [
          'power'
        ],
        powerStatus: '',
        powerButton: [
          {
            label: '唤醒',
            icon: 'icon-kaiqi',
            value: 'wake'
          },
          {
            label: '待机',
            icon: 'icon-huiyimoshi-guanbihuiyi',
            value: 'standby'
          }
        ],
        monitorStatus: 'on',
        monitorButton: [
          {
            label: '开启跟踪',
            icon: 'icon-kaiqi',
            value: 'on'
          },
          {
            label: '关闭跟踪',
            icon: 'icon-huiyimoshi-guanbihuiyi',
            value: 'off'
          }
        ],
        currentMode: '',
        modeButton: [],
        // 摄像头相关控制
        cameraCtrMethods: {
          vertical: deviceCtrFunc.camera.setVertical.method,
          horizontal: deviceCtrFunc.camera.setHorizontal.method,
          fullScreen: deviceCtrFunc.camera.setFullScreen.method,
          zoom: deviceCtrFunc.camera.setZoom.method
        },

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
        const msg = this.$store.state.deviceStatusMsg;
        this.updateCameraStatus(msg);
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
      updateCameraStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands, power, modes, mode, monitor} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        power && (this.powerStatus = power);
        monitor && (this.monitorStatus = monitor);
        mode && (this.currentMode = mode);
        modes && (this.modeButton = modes.map(item => {
          return {
            label: item.name,
            value: item.code
          };
        }));

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          mode: this.currentMode,
          monitor: this.monitorStatus
        };
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateCameraStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 设备控制
      deviceControl(ctrParam, expParam, ignoreLoading = false) {
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
        deviceControlHandle(devCtrParams, expConfig, ignoreLoading).then(timeout => {
          DevCtrTimerHdl.startTimer(this.deviceId, timeout);
        }).catch(err => {
        });
      }
    }
  };
</script>

<style scoped lang="less">

</style>
