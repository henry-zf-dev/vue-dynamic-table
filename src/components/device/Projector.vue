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
        <el-row
          v-for="(status, idx) in lampStatusData"
          v-if="status.show"
          :key="idx"
          class="header6 font-weight-regular font-gray-40 mar-top-20">
          <el-col :span="8" class="pad-lft-20">
            <i :class="status.icon" class="iconfont font-size-14 mar-rgt-10"></i>{{ status.name }}
          </el-col>
          <el-col :span="10">{{ status.value }}</el-col>
          <el-col :span="6">{{ status.status }}</el-col>
          <el-col :span="24" class="mar-top-20">
            <el-divider></el-divider>
          </el-col>
        </el-row>
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
    name: 'Projector',
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
        devCtrFunc: deviceCtrFunc.projector,
        deviceStatus: {},
        deviceStatusKeys: [
          'power', 'source', 'lamp_power_usedTime_list',
          'lampPower', 'useTime', 'error_status', 'error',
          'filterStatus', 'resolution', 'signal'
        ],
        lampStatusData: [], // 投影机灯泡状态
        currentSource: '',
        sourceButton: [],
        powerStatus: '',
        powerButton: [ // 开关按钮
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
        this.updateProjectorStatus(msg);
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
      initSourceData(data = {}) {
        const {sources = []} = data;
        if (!sources.length) return;
        this.sourceButton = sources.map(s => {
          return {
            label: s.name,
            value: s.control_num
          };
        });
      },
      updateProjectorStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands, power, source, lamp_power_usedTime_list} = data;
        // 可用输入源
        this.initSourceData(data);
        power && (this.powerStatus = power);
        source && (this.currentSource = source);
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        // 灯泡开关状态+使用时长
        if (lamp_power_usedTime_list) {
          const {lampPowerList = [], useTime = ''} = lamp_power_usedTime_list;
          if (lampPowerList) { // todo 有隐患，目前只有灯泡的状态还没事，后续加上其他状态就不能清空
            this.lampStatusData = [];
          }
          lampPowerList.forEach((item, index) => {
            this.lampStatusData.push({
              name: '灯泡' + (index + 1),
              show: true,
              value: '时长: ' + item.useTime,
              status: '状态: ' + (item.lampPower === 'on' ? '开' : '关'),
              type: '',
              attribute: 'lampPowerList',
              icon: 'icon-liang' // todo 目前没有灯泡的icon，先用亮的图标
            });
          });
          if (useTime) {
            lamp_power_usedTime_list.useTime = `${parseInt(lamp_power_usedTime_list.useTime, 16)}h`;
          }
        }
        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          source: this.currentSource
        };
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateProjectorStatus(status);
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
