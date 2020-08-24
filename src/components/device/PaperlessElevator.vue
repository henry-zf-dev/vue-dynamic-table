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
          v-if="abilities[devCtrFunc.setScreenPosition.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">屏幕控制</div>
          <GroupButton
            :span="8"
            :buttons="screenButton"
            :model="screenStatus"
            :method="devCtrFunc.setScreenPosition.method"
            param-key="action"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setMicPosition.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">话筒控制</div>
          <GroupButton
            :span="8"
            :buttons="micButton"
            :model="micStatus"
            :method="devCtrFunc.setMicPosition.method"
            param-key="action"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setScreenMicPosition.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">屏幕话筒控制</div>
          <GroupButton
            :span="8"
            :buttons="screenMicButton"
            :model="screenMicStatus"
            :method="devCtrFunc.setScreenMicPosition.method"
            param-key="action"
            @btnClicked="deviceControl"></GroupButton>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import EmptyContent from '../EmptyContent';
  import DeviceLayout from './partial/DeviceLayout';
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import GroupButton from './atomic/GroupButton';
  import {
    checkRespCorrect,
    messageHandle,
    deviceControlHandle,
    deepCopyWithJson,
    assembleDeviceAbility, transformDeviceInitStatus
  } from '../../utils';
  import {deviceCtrFunc, commonConfig, websocketType} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'PaperlessElevator',
    components: {
      EmptyContent,
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      GroupButton
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        devCtrFunc: deviceCtrFunc.paperlessElevator,
        deviceStatus: {},
        deviceStatusKeys: [],
        screenStatus: '',
        screenButton: [ // 屏幕按鈕
          {
            label: '升起',
            icon: 'icon-shengqi',
            value: 'up'
          },
          {
            label: '停止',
            icon: 'icon-zanting',
            value: 'stop'
          },
          {
            label: '下降',
            icon: 'icon-jiangxia',
            value: 'down'
          }
        ],
        micStatus: '',
        micButton: [ // 话筒按钮
          {
            label: '升起',
            icon: 'icon-shengqi',
            value: 'up'
          },
          {
            label: '停止',
            icon: 'icon-zanting',
            value: 'stop'
          },
          {
            label: '下降',
            icon: 'icon-jiangxia',
            value: 'down'
          }
        ],
        screenMicStatus: '',
        screenMicButton: [ // 屏幕话筒按鈕
          {
            label: '升起',
            icon: 'icon-shengqi',
            value: 'up'
          },
          {
            label: '停止',
            icon: 'icon-zanting',
            value: 'stop'
          },
          {
            label: '下降',
            icon: 'icon-jiangxia',
            value: 'down'
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
        this.updatePaperlessElevatorStatus(msg);
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
      updatePaperlessElevatorStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updatePaperlessElevatorStatus(status);
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
