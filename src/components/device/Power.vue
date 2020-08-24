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
          v-if="abilities[devCtrFunc.setChannelPowerOn.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">设备开关</div>
          <div v-if="channelStatusData.length">
            <el-row v-for="(channel, idx) in channelStatusData" :key="idx" class="mar-top-20">
              <el-col :span="18" class="header6 font-weight-regular">{{ channel.label }}</el-col>
              <el-col :span="6" class="text-align-right">
                <SwitchControl
                  :switches="switchData"
                  :model="channel.value"
                  :default-params="{channel: channel.channel}"
                  :expect-key="`allChannelPower.${idx}`"
                  @switched="deviceControl"></SwitchControl>
              </el-col>
              <el-col :span="24" class="mar-top-20">
                <el-divider></el-divider>
              </el-col>
            </el-row>
          </div>
          <div v-else class="position-relative" style="height: 250px">
            <EmptyContent empty-text="暂无可控通道"></EmptyContent>
          </div>
        </div>
        <div
          v-if="abilities[devCtrFunc.setAllChannelPower.method]"
          class="device-monitor-unit">
          <GroupButton
            :buttons="powerButton"
            :model="powerStatus"
            :method="devCtrFunc.setAllChannelPower.method"
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
import DeviceBaseInfo from './partial/DeviceBaseInfo';
import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
import GroupButton from './atomic/GroupButton';
import SwitchControl from './atomic/SwitchControl';
import { deviceCtrFunc, commonConfig } from '../../config/common';
import { commonString, msgCode, msgContent } from '../../config/string';
import {
  checkRespCorrect,
  messageHandle,
  objArrayComparison,
  deviceControlHandle, assembleDeviceAbility, transformDeviceInitStatus
} from '../../utils';
import { RealTimeMsgHandle } from '../../modules/realTimeMsgHdl';
import { DevCtrTimerHdl } from '../../modules/deviceCtrTimerHdl';
import { mapState } from 'vuex';

export default {
  name: 'Power',
  components: {
    EmptyContent,
    DeviceLayout,
    DeviceBaseInfo,
    DeviceDynamicStatus,
    GroupButton,
    SwitchControl
  },
  props: {
    deviceId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      devCtrFunc: deviceCtrFunc.power,
      deviceStatus: {},
      deviceStatusKeys: [],
      powerStatus: '',
      powerButton: [ // 开关按钮
        {
          label: '全开',
          icon: 'icon-qiyong',
          value: 'on'
        },
        {
          label: '全关',
          icon: 'icon-jinyong',
          value: 'off'
        }
      ],
      switchData: [
        {
          label: '开启',
          value: 'on',
          method: deviceCtrFunc.power.setChannelPowerOn.method,
          isActive: true
        },
        {
          label: '关闭',
          value: 'off',
          method: deviceCtrFunc.power.setChannelPowerOff.method,
          isActive: false
        }
      ],
      channelStatusData: [],

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
      this.updatePowerSupplyStatus(msg);
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
      if (!data.channel_list) return;
      const { channel_list = [] } = data;
      if (!__.isArray(channel_list)) return;
      this.channelStatusData = [];
      // 先将 src 按照 control_num 从小到大排序
      channel_list.sort(objArrayComparison('control_num'));
      channel_list.forEach(c => {
        if (c.type === 'output') {
          this.channelStatusData.push({
            label: c.name,
            value: 'off',
            channel: c.control_num
          });
        }
      });
    },
    updatePowerSupplyStatus(msg = {}) {
      const data = msg[this.deviceId];
      if (!data) return;
      this.initChannelData(data);
      // 设备状态
      this.deviceStatus = {...this.deviceStatus, ...data};
      const { general_commands } = data;
      // 设备能力集
      general_commands && (this.ctrMethodData = general_commands);
      const tsKeyObj = []; // [{key: 'channel_power', ts: 12432423434}]
      Object.keys(data).forEach(k => {
        if (~k.indexOf('ts__')) {
          tsKeyObj.push({
            key: k.substring(4), // 去除 'ts__'
            ts: data[k]
          });
        }
      });
      // 如果是初始状态，则只取 channel_power 的值，原有：接口请求到的状态值没有时间戳
      if (tsKeyObj.length) {
        tsKeyObj.sort(objArrayComparison('ts', true));
      } else {
        tsKeyObj.push({ key: 'channel_power', ts: 0 });
      }
      const obj = tsKeyObj[0]; // 取时间戳最大的那个值，再进行之后的判断
      const key = obj['key'];
      const value = data[key]; // 根据时间戳最新的 key，取推送数据的最终 value
      if (!value) return;
      const idx = parseInt(value.channel || 0) - 1;
      switch (key) {
        case 'channel_power':
          // 多通道处理
          Object.keys(value).forEach(k => {
            const idx = parseInt(k) - 1;
            if (!this.channelStatusData[idx]) return;
            this.channelStatusData[idx].value = value[k] || 'off';
          });
          break;
        case 'power_on_channels':
          if (!this.channelStatusData[idx]) return;
          this.channelStatusData[idx].value = 'on';
          break;
        case 'power_off_channels':
          if (!this.channelStatusData[idx]) return;
          this.channelStatusData[idx].value = 'off';
          break;
        default:
          break;
      }
      this.judgeAllChannelStatus();

      // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
      const updated = {
        power: this.powerStatus,
        allChannelPower: this.channelStatusData.map(cs => {
          return cs.value;
        })
      };
      DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
    },
    // 判断全开全关
    judgeAllChannelStatus() {
      if (!this.channelStatusData.length) return;
      const status = __.pluck(this.channelStatusData, 'value');
      if (!status.includes('off')) {
        this.powerStatus = 'on';
      } else if (!status.includes('on')) {
        this.powerStatus = 'off';
      } else {
        this.powerStatus = '';
      }
    },
    getDeviceDetail() { // 获取设备初始状态
      const deviceId = this.deviceId;
      API.room.roomDeviceDetailByDeviceId({ id: deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const status = transformDeviceInitStatus(resp.data);
          this.updatePowerSupplyStatus(status);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        console.log('##### err #####', err);
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 设备控制
    deviceControl(ctrParam, expParam) {
      const devCtrParams = {
        deviceId: this.deviceId,
        roomId: this.$route.params.rid,
        ...ctrParam
      };
      let confirmMsg = '';
      if (devCtrParams.method === deviceCtrFunc.power.setAllChannelPower.method) {
        const btn = this.powerButton.find(b => {
          return b.value === devCtrParams.params.power;
        }) || {};
        confirmMsg = `确定要 ${btn.label} 时序电源吗?`;
      } else {
        const channel = this.channelStatusData.find(c => {
          return c.channel === devCtrParams.params.channel;
        }) || {};
        if (devCtrParams.method === deviceCtrFunc.power.setChannelPowerOn.method) {
          confirmMsg = `确定要 开启 ${channel.label} 的电源吗?`;
        } else {
          confirmMsg = `确定要 关闭 ${channel.label} 的电源吗?`;
        }
      }
      this.$confirm(confirmMsg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.ctrExpect = expParam;
        const expConfig = {
          abilities: this.ctrMethodData,
          expect: expParam
        };
        deviceControlHandle(devCtrParams, expConfig).then(timeout => {
          DevCtrTimerHdl.startTimer(this.deviceId, timeout);
        }).catch(err => {});
      }).catch(err => {
      });
    }
  }
};
</script>

<style scoped>

</style>
