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
          v-if="abilities[devCtrFunc.setSource.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">信号源</div>
          <GroupButton
            v-if="sourceButton.length > 0"
            :buttons="sourceButton"
            :model="currentSource"
            :method="devCtrFunc.setSource.method"
            param-key="source"
            @btnClicked="deviceControl"></GroupButton>
          <div v-else class="position-relative" style="height: 250px">
            <EmptyContent empty-text="暂无可用输入源"></EmptyContent>
          </div>
        </div>
        <div
          v-if="abilities[devCtrFunc.setScreen.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">亮息屏</div>
          <GroupButton
            :buttons="screenButton"
            :model="screenStatus"
            :method="devCtrFunc.setScreen.method"
            param-key="screen"
            @btnClicked="deviceControl"></GroupButton>
        </div>
        <div
          v-if="abilities[devCtrFunc.toggleScreen.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">亮息屏</div>
          <StatelessButton
            :method="devCtrFunc.toggleScreen.method"
            label="亮/息屏"
            @btnClicked="deviceControl"></StatelessButton>
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
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import GroupButton from './atomic/GroupButton';
  import StatelessButton from './atomic/StatelessButton';
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
    name: 'Display',
    components: {
      EmptyContent, DeviceLayout, DeviceBaseInfo,
      GroupButton, DeviceDynamicStatus, StatelessButton
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        devCtrFunc: deviceCtrFunc.display,
        deviceStatus: {},
        deviceStatusKeys: [
          'power', 'source_sources', 'source', 'screen', 'volume',
          'mute', 'hdmi_signal_status',
          'screen_signal_status', 'source', 'signalStatus'
        ],
        currentSource: '',
        sourceButton: [],
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
        screenStatus: '',
        screenButton: [
          {
            label: '亮屏',
            icon: 'icon-liang',
            value: 'on'
          },
          {
            label: '息屏',
            icon: 'icon-an',
            value: 'off'
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
        const msg = this.$store.state.deviceStatusMsg;
        this.updateDisplayStatus(msg);
      }
    },
    created() {
      this.getDeviceDetail();
      // this.generateMock();
      RealTimeMsgHandle.subscribe([this.deviceId]);
      DevCtrTimerHdl.initTimer(this.deviceId);
    },
    destroyed() {
      RealTimeMsgHandle.unsubscribe([this.deviceId]);
    },
    methods: {
      generateMock() { // todo 本地调试所用
        this.deviceStatus = {
          932: {
            deviceType: '03',
            model: 'XJL1203',
            serialNumber: '25sf645as81s64d41sfe15',
            power: 'wake',
            source_sources: {
              source: 'HDMI',
              sources: []
            },
            source: 'HDMI',
            screen: 'off',
            mute: 'mute',
            volume: '20',
            hdmi_signal_status: {
              'source': 'HDMI2',
              'signalStatus': '1'
            },
            screen_signal_status: {
              'source': 'dongle',
              'signalStatus': 'true'
            }
          }
        };
        this.updateDisplayStatus(this.deviceStatus);
        setTimeout(() => {
          this.deviceStatus = {
            932: {
              deviceType: '03',
              model: 'JIDK8923489JD',
              serialNumber: '382seddes93bs0',
              power: 'standby',
              // source_sources: {
              //   source: 'INPUTA',
              //   sources: []
              // },
              screen: 'on',
              mute: 'unmute',
              volume: '80',
              hdmi_signal_status: {
                'source': 'HDMI1',
                'signalStatus': '2'
              },
              screen_signal_status: {
                'source': 'software',
                'signalStatus': 'false'
              }
            }
          };
          this.updateDisplayStatus(this.deviceStatus);
        }, 2000);
      },
      initSourceData(data = {}) {
        const {sources, source_sources} = data;
        if (sources) {
          this.sourceButton = (sources || []).map(s => {
            return {
              label: s.name,
              value: s.control_num
            };
          });
        }
        // TODO MAXHUB 现在还是以 source_sources 结构上报
        if (source_sources) {
          const {source = '', sources = []} = source_sources || {};
          this.currentSource = source;
          this.sourceButton = sources.map(s => {
            return {
              label: s.name,
              value: s.id
            };
          });
        }
      },
      updateDisplayStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        // 可用输入源及当前输入源
        this.initSourceData(data);
        const {general_commands, power, screen, source} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        power && (this.powerStatus = power);
        screen && (this.screenStatus = screen);
        source && (this.currentSource = source);

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          screen: this.screenStatus,
          source: this.currentSource
        };
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      // 获取设备初始状态
      getDeviceDetail() {
        API.room.roomDeviceDetailByDeviceId({id: this.deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateDisplayStatus(status);
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
