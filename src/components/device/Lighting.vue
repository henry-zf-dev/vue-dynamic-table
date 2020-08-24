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
          v-if="abilities[devCtrFunc.setChannelPower.method] && lightingData.length"
          class="device-monitor-unit">
          <div v-for="(light, lightIdx) in lightingData" :key="lightIdx" class="mar-btm">
            <div class="device-monitor-title">{{ light.label }}</div>
            <GroupButton
              :buttons="powerButton"
              :model="light.powerStatus"
              :method="devCtrFunc.setChannelPower.method"
              :expect-key="`allChannelPower.${lightIdx}`"
              :default-params="{channel: light.channel}"
              param-key="power"
              @btnClicked="deviceControl"></GroupButton>
          </div>
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
        <div
          v-if="abilities[devCtrFunc.setBrightness.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">灯光亮度</div>
          <SliderControl
            :model="brightness"
            :method="devCtrFunc.setBrightness.method"
            param-key="brightness"
            @sliderChanged="deviceControl"></SliderControl>
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
  import SliderControl from './atomic/SliderControl';
  import {deviceCtrFunc} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {
    assembleDeviceAbility,
    checkRespCorrect,
    deviceControlHandle,
    messageHandle, transformDeviceInitStatus
  } from '../../utils';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'Lighting',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      GroupButton,
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
        devCtrFunc: deviceCtrFunc.light,
        deviceStatus: {},
        lightingData: [],
        deviceStatusKeys: [
          // 'channel_power', 'power'
        ],
        powerStatus: '',
        powerButton: [ // 开关按钮
          {
            label: '开启',
            icon: 'icon-shengcheng',
            value: 'on'
          },
          {
            label: '关闭',
            icon: 'icon-xiumian',
            value: 'off'
          }
        ],
        brightness: 0,

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
        this.updateLightStatus(msg);
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
      initChannelData(data = {}) {
        if (this.lightingData.length > 0) return;
        if (data.hasOwnProperty('sub_devices')) {
          const {sub_devices = []} = data;
          this.lightingData = sub_devices.map(item => {
            return {
              label: item.name,
              powerStatus: '',
              method: deviceCtrFunc.light.setChannelPower.method,
              channel: item.control_num
            };
          });
        }
      },
      updateLightStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        this.initChannelData(data);
        const {general_commands, power, brightness, channel_power_combine = {}} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);

        // 单通道状态处理
        power && (this.powerStatus = power);
        brightness && (this.brightness = parseInt(brightness));

        // 多通道状态处理
        (Object.values(channel_power_combine) || []).forEach(channelItem => {
          const {channel, power} = channelItem;
          this.lightingData.forEach(item => {
            if (item.channel === channel) {
              item['powerStatus'] = power;
            }
          });
        });
        // (data['channel_power'] || []).forEach(channelItem => {
        //   const {channel, power} = channelItem;
        //   this.lightingData.forEach(item => {
        //     if (item.channel === channel) {
        //       item['powerStatus'] = power;
        //     }
        //   });
        // });

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          brightness: this.brightness.volume,
          allChannelPower: this.lightingData.map(cs => {
            return cs.powerStatus;
          })
        };
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateLightStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
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
