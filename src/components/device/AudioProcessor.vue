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
        <el-tabs v-model="meterCurrentTab" class="audio-processor-meter">
          <el-tab-pane label="输入" name="input">
            <div v-if="inputChannels.length > 0">
              <div v-for="(channel, idx) in inputChannels" :key="idx">
                <div class="header6 font-gray-40 mar-top">{{ channel.moduleName }}-{{ channel.channelName }}</div>
                <el-slider
                  :min="channel.min"
                  :max="channel.max"
                  v-model="channel.meteor"
                  disabled
                  class="mar-rgt-10"></el-slider>
              </div>
            </div>
            <div v-else class="position-relative" style="height: 300px">
              <EmptyContent empty-text="暂无输入电平"></EmptyContent>
            </div>
          </el-tab-pane>
          <el-tab-pane label="输出" name="output">
            <div v-if="outputChannels.length > 0">
              <div v-for="(channel, idx) in outputChannels" :key="idx">
                <div class="header6 font-gray-40 mar-top">{{ channel.moduleName }}-{{ channel.channelName }}</div>
                <el-slider
                  :min="channel.min"
                  :max="channel.max"
                  v-model="channel.meteor"
                  disabled
                  class="mar-rgt-10"></el-slider>
              </div>
            </div>
            <div v-else class="position-relative" style="height: 300px">
              <EmptyContent empty-text="暂无输出电平"></EmptyContent>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-loading="devCtrLoading" slot="control">
        <div
          v-if="modeButton.length > 0"
          class="device-monitor-unit">
          <div class="device-monitor-title">音频模式</div>
          <el-row>
            <el-col
              v-for="(mode, idx) in modeButton"
              :span="12"
              :key="idx"
              :class="getPaddingClass(idx)"
              class="mar-btm">
              <el-button
                v-if="mode.show"
                :type="mode.value === currentMode ? 'primary' : 'info'"
                class="width-100 font-size-main"
                @click="deviceControl(deviceCtrFunc.audioProcessor.setMode.method, idx)">
                {{ mode.title }}
              </el-button>
            </el-col>
          </el-row>
        </div>
        <div class="device-monitor-unit">
          <div class="device-monitor-title">音频设置</div>
          <div v-if="controlChannels.length > 0">
            <div v-for="(channel, idx) in controlChannels" :key="idx">
              <div class="mar-top">
                <span
                  class="header6 font-gray-40 cursor-pointer">{{ channel.moduleName }}-{{ channel.channelName }}</span>
                <el-button
                  :type="channel.mute ? 'primary' : 'info'"
                  size="small"
                  class="float-right"
                  @click="deviceControl(deviceCtrFunc.audioProcessor.setChannelMute.method, idx)">
                  <i class="el-icon-turn-off-microphone"></i>静音
                </el-button>
              </div>
              <el-slider
                :min="channel.min"
                :max="channel.max"
                v-model="channel.volume"
                class="mar-top-5 mar-btm-10"
                @change="deviceControl(deviceCtrFunc.audioProcessor.setChannelVolume.method, idx)"></el-slider>
            </div>
          </div>
          <div v-else class="position-relative" style="height: 300px">
            <EmptyContent empty-text="暂无音频控制"></EmptyContent>
          </div>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
import EmptyContent from '../../components/EmptyContent';
import DeviceLayout from './partial/DeviceLayout';
import DeviceBaseInfo from './partial/DeviceBaseInfo';
import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
import {checkRespCorrect, messageHandle, deviceControlHandle, numberFix, transformDeviceInitStatus} from '../../utils';
import { deviceCtrFunc, commonConfig, websocketType } from '../../config/common';
import { commonString, msgCode, msgContent } from '../../config/string';
import { RealTimeMsgHandle } from '../../modules/realTimeMsgHdl';
import { DevCtrTimerHdl } from '../../modules/deviceCtrTimerHdl';
import { mapState } from 'vuex';

export default {
  name: 'AudioProcessor',
  components: {
    DeviceLayout, DeviceBaseInfo, DeviceDynamicStatus, EmptyContent
  },
  props: {
    deviceId: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      deviceCtrFunc: deviceCtrFunc,
      meterCurrentTab: 'input',
      deviceStatus: {},
      deviceStatusKeys: [],
      currentMode: '',
      modeButton: [],
      inputChannels: [],
      outputChannels: [],
      controlChannels: [],
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
    }
  },
  watch: {
    deviceStatusMsg() {
      const msg = this.$store.state.deviceStatusMsg;
      this.updateAudioProcessorStatus(msg);
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
    getPaddingClass(idx) {
      return idx % 2 === 0 ? 'pad-rgt-5' : 'pad-lft-5';
    },
    initModuleData(data = {}) {
      const src = data['module_list'] || [];
      if (!src || !src.length) return;

      function assembleMeteorChannel(srcModule = {}, destChannel = []) {
        const {
          control_num: module = 'default',
          channel_list: channelList = [],
          name: moduleName,
          min_value: min = 0, max_value: max = 100
        } = srcModule;
        if (!__.isArray(channelList)) return;
        channelList.forEach(c => {
          destChannel.push({
            ...c, module, moduleName,
            channelName: c.name,
            controlNum: c.control_num,
            min, max,
            meteor: min
          });
        });
      }

      src.forEach(s => {
        if (s.module_type === 'AudioMeter') {
          if (s.type === 'input') {
            assembleMeteorChannel(s, this.inputChannels);
          } else if (s.type === 'output') {
            assembleMeteorChannel(s, this.outputChannels);
          }
        } else if (s.module_type === 'Level') {
          const {
            control_num: module = 'default',
            name: moduleName, channel_list: channelList = [],
            min_value: min = 0, max_value: max = 100
          } = s;
            // 如果 channel_list 有配置，说明是通过 channel 控制，否则就是通过 module 控制
          if (!channelList.length) {
            this.controlChannels.push({
              ...s,
              mode: 'module',
              module, moduleName,
              min, max,
              volume: min,
              mute: false
            });
          } else {
            if (!__.isArray(channelList)) return;
            // 如果 channel_list 有配置，说明是通过 channel 控制，否则就是通过 module 控制
            if (!channelList.length) {
              this.controlChannels.push({
                ...s,
                mode: 'module',
                module, moduleName,
                min, max,
                volume: min,
                mute: false
              });
            } else {
              // 判断有没有 control_type，如果有，则将 channel_list 的两个通道合并为一个通道，
              // 并分别存储 control_num，并标志音量和静音的控制是区分开的
              // 在状态上报时，要确定分控是否是按照 module->channel->value 的结构上报的
              if (__.pluck(channelList, 'control_type').length) {
                // 将两个 channel 合并成一个
                const channel = {
                  mode: 'channel',
                  module, moduleName,
                  controlNum: '1', // 只会有一个 channel
                  min, max,
                  volume: min,
                  mute: false
                };
                channelList.forEach(c => {
                  switch (c['control_type']) {
                    case 'volume':
                      channel.volumeControlNum = c['control_num'];
                      channel.channelName = c.name;
                      break;
                    case 'mute':
                      channel.muteControlNum = c['control_num'];
                      break;
                    default:
                      break;
                  }
                });
                this.controlChannels.push(channel);
              } else {
                channelList.forEach(c => {
                  this.controlChannels.push({
                    ...s,
                    mode: 'channel',
                    module, moduleName,
                    channelName: c.name,
                    controlNum: c.control_num,
                    min, max,
                    volume: min,
                    mute: false
                  });
                });
              }
            }
          }
        }
      });
      // console.systemLog('##### inputChannels #####', this.inputChannels);
      // console.systemLog('##### outputChannels #####', this.outputChannels);
      // console.systemLog('##### controlChannels #####', this.controlChannels);
    },
    meterStatus(data = {}, dest = []) {
      const { module_meter, channel_meter } = data;
      if (module_meter) {
        const { meterList = [], module = '' } = module_meter;
        dest.forEach(d => {
          if (d.module === module) {
            const idx = parseInt(d.controlNum) - 1;
            meterList[idx] && (d.meteor = numberFix(meterList[idx]['meter'] || d.min));
          }
        });
      }
      if (channel_meter) {
        const { meter = 0, channel = '' } = channel_meter;
        dest.forEach(d => {
          if (d.controlNum === channel) {
            d.meteor = numberFix(meter || d.min);
          }
        });
      }
    },
    volumeStatus(data = {}) {
      const { module_volume, channel_volume_combined = {} } = data;
      if (module_volume) {
        const { volumeList = [], module = '' } = module_volume;
        if (!volumeList.length) return;
        this.controlChannels.forEach(c => {
          if (c.module === module) {
            const idx = parseInt(c.controlNum) - 1;
            volumeList[idx] && (c.volume = numberFix(volumeList[idx].volume || c.min));
          }
        });
      }
      (Object.values(channel_volume_combined) || []).forEach(cv => {
        const { volume = 0, channel = '' } = cv;
        this.controlChannels.forEach(c => {
          if (c.volumeControlNum === channel) {
            c.volume = numberFix(volume || c.min);
          }
        });
      });
      // if (Array.isArray(channel_volume)) {
      //   channel_volume.forEach(cv => {
      //     const {volume = 0, channel = ''} = cv;
      //     this.controlChannels.forEach(c => {
      //       if (c.volumeControlNum === channel) {
      //         c.volume = numberFix(volume || c.min)
      //       }
      //     });
      //   });
      // }
    },
    muteStatus(data = {}) {
      const { module_mute, channel_mute_combined = {} } = data;
      if (module_mute) {
        const { muteList = [], module = '' } = module_mute;
        if (!muteList.length) return;
        this.controlChannels.forEach(c => {
          if (c.module === module) {
            const idx = parseInt(c.controlNum) - 1;
            muteList[idx] && (c.mute = muteList[idx].mute === 'mute');
          }
        });
      }
      (Object.values(channel_mute_combined) || []).forEach(cm => {
        const { mute, channel = '' } = cm;
        this.controlChannels.forEach(c => {
          if (c.muteControlNum === channel) {
            c.mute = mute === 'mute';
          }
        });
      });
      // if (Array.isArray(channel_mute)) {
      //   channel_mute.forEach(cm => {
      //     const {mute, channel = ''} = cm;
      //     this.controlChannels.forEach(c => {
      //       if (c.muteControlNum === channel) {
      //         c.mute = mute === 'mute'
      //       }
      //     });
      //   });
      // }
    },
    updateAudioProcessorStatus(msg = {}) { // 音频处理器数据处理
      const data = msg[this.deviceId];
      if (!data) return;
      // 设备状态
      this.deviceStatus = {...this.deviceStatus, ...data};
      // 页面结构
      this.initModuleData(data);
      // 音量/静音
      this.volumeStatus(data);
      this.muteStatus(data);
      // 输入/输出电平
      this.meterStatus(data, this.inputChannels);
      this.meterStatus(data, this.outputChannels);

      // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
      const updated = {
        channelMuteStatus: this.controlChannels.map(cc => {
          return cc.mute;
        })
      };
      DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
    },
    getDeviceDetail() { // 获取设备初始状态
      const deviceId = this.deviceId;
      API.room.roomDeviceDetailByDeviceId({ id: deviceId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const status = transformDeviceInitStatus(resp.data);
          this.updateAudioProcessorStatus(status);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 设备控制
    deviceControl(method, idx) {
      const deviceCtrParams = {
        deviceId: this.deviceId,
        roomId: this.$route.params.rid,
        method: method,
        params: {}
      };
      let ctrItem = {};
      switch (method) {
        case deviceCtrFunc.audioProcessor.setChannelMute.method:
          ctrItem = this.controlChannels[idx];
          deviceCtrParams.params = {
            module: ctrItem.module || 'default',
            channel: ctrItem.muteControlNum || ctrItem.controlNum,
            mute: ctrItem.mute ? 'unmute' : 'mute'
          };
          break;
        case deviceCtrFunc.audioProcessor.setChannelVolume.method:
          ctrItem = this.controlChannels[idx];
          deviceCtrParams.params = {
            module: ctrItem.module || 'default',
            channel: ctrItem.volumeControlNum || ctrItem.controlNum,
            volume: ctrItem.volume
          };
          break;
        case deviceCtrFunc.audioProcessor.setMode.method:
          break;
        default:
          break;
      }
      console.log('##### deviceCtrParams #####', deviceCtrParams);
      deviceControlHandle(deviceCtrParams);
    }
  }
};
</script>

<style scoped>

</style>
