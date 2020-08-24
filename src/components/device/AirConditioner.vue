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
          v-if="abilities[devCtrFunc.setMode.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">空调模式</div>
          <GroupButton
            :buttons="modeButton"
            :model="currentMode"
            :method="devCtrFunc.setMode.method"
            param-key="mode"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setWindLevel.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">空调风量</div>
          <GroupButton
            :buttons="windLevelButton"
            :model="windLevel"
            :method="devCtrFunc.setWindLevel.method"
            param-key="windLevel"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.setTemperature.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">温度控制</div>
          <SliderControl
            :model="temperature"
            :min="16"
            :max="30"
            :marks="temperatureMark"
            :method="devCtrFunc.setTemperature.method"
            param-key="temperature"
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
import { mapState } from 'vuex';

export default {
  name: 'AirConditioner',
  components: {
    DeviceLayout,
    GroupButton,
    SliderControl,
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
      devCtrFunc: deviceCtrFunc.airCondition,
      deviceStatus: {},
      deviceStatusKeys: [
        'all_status', 'power', 'windLevel', 'temperature', 'mode'
      ],
      powerStatus: '', // 电源状态
      powerButton: [ // 开关按钮
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
      currentMode: '', // 当前模式
      modeButton: [ // 空调模式
        {
          label: '制冷',
          icon: 'icon-zhileng',
          value: 'cooling'
        },
        {
          label: '制热',
          icon: 'icon-zhire',
          value: 'heating'
        },
        {
          label: '通风',
          icon: 'icon-tongfeng',
          value: 'ventilation'
        }
      ],
      windLevel: '', // 风量
      windLevelButton: [ // todo icon还没出，先用其他的代替
        {
          label: '高风',
          icon: 'icon-gaofeng',
          value: 'H'
        },
        {
          label: '中风',
          icon: 'icon-zhongfeng',
          value: 'M'
        },
        {
          label: '低风',
          icon: 'icon-difeng',
          value: 'L'
        },
        {
          label: '自动',
          icon: 'icon-zidong',
          value: 'Auto'
        }
      ],
      temperature: 0, // 温度
      temperatureMark: {
        // 16: '16°C',
        18: '18°C',
        20: '20°C',
        22: '22°C',
        24: '24°C',
        26: '26°C',
        28: '28°C'
        // 30: '30°C'
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
      const msg = this.$store.state.deviceStatusMsg || {};
      this.updateAirConditionStatus(msg);
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
    updateStatus(data = {}) {
      const { power, windLevel, temperature, mode } = data;
      power && (this.powerStatus = power);
      windLevel && (this.windLevel = windLevel);
      temperature && (this.temperature = parseInt(temperature));
      mode && (this.currentMode = mode);
    },
    updateAirConditionStatus(msg = {}) {
      const data = msg[this.deviceId];
      if (!data) return;
      // 设备状态
      this.deviceStatus = {...this.deviceStatus, ...data};
      const { general_commands, all_status = {} } = data;
      // 设备能力集
      general_commands && (this.ctrMethodData = general_commands);
      this.updateStatus(data);
      this.updateStatus(all_status);

      // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
      const updated = {
        power: this.powerStatus,
        mode: this.currentMode,
        windLevel: this.windLevel,
        temperature: this.temperature
      };
      DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
    },
    getDeviceDetail() { // 获取设备初始状态
      const deviceId = this.deviceId;
      API.room.roomDeviceDetailByDeviceId({ id: deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const status = transformDeviceInitStatus(resp.data);
          this.updateAirConditionStatus(status);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 设备控制
    deviceControl(params, expParam) {
      const devCtrParams = {
        deviceId: this.deviceId,
        roomId: this.$route.params.rid,
        ...params
      };
      this.ctrExpect = expParam;
      const expConfig = {
        abilities: this.ctrMethodData,
        expect: expParam
      };
      deviceControlHandle(devCtrParams, expConfig).then(timeout => {
        DevCtrTimerHdl.startTimer(this.deviceId, timeout);
      }).catch(err => {});
    }
  }
};
</script>

<style scoped lang="less">

</style>
