<template>
  <div>
    <DeviceLayout>
      <div slot="baseInfo">
        <DeviceBaseInfo :status="deviceStatus"></DeviceBaseInfo>
      </div>
      <div slot="status">
        <DeviceDynamicStatus
          :include-keys="deviceStatusKeys"
          :status="deviceStatus"
          @statusUpdated="deviceBaseStatusUpdated"></DeviceDynamicStatus>
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
        <div class="device-monitor-unit">
          <div class="device-monitor-title">视频会议</div>
          <div v-if="!callStatus">
            <el-input
              v-model="phoneNum"
              clearable
              size="medium"
              class="mar-btm"
              placeholder="请输入会议号"></el-input>
            <el-input
              v-model="password"
              clearable
              size="medium"
              class="mar-btm"
              placeholder="请输入会议密码（如有）"></el-input>
            <StatelessButton
              :method="devCtrFunc.callJoin.method"
              label="拨号"
              icon="icon-shebeikongzhi-bohao"
              @btnClicked="callJoinHandle"></StatelessButton>
          </div>
          <div v-else>
            <div class="text-align-center">
              <div v-if="phoneNum" class="header2">{{ phoneNum }}</div>
              <div class="header6 font-gray-40 mar-top-10">{{ callStatusAlias }}</div>
            </div>
            <div class="text-align-center pad-lft pad-rgt">
              <SliderControl
                v-if="abilities[devCtrFunc.setVolume.method]"
                :model="dialerVolume"
                :method="devCtrFunc.setVolume.method"
                param-key="volume"
                @sliderChanged="deviceControl"></SliderControl>
              <el-row class="mar-top-40">
                <el-col :span="8">
                  <MultipleButton
                    v-if="abilities[devCtrFunc.setSharingMode.method]"
                    :buttons="sharingModeButton"
                    :model="sharingMode"
                    :method="devCtrFunc.setSharingMode.method"
                    param-key="sharingMode"
                    @btnClicked="deviceControl"></MultipleButton>
                </el-col>
                <el-col :span="8">
                  <SingleButton
                    v-if="abilities[devCtrFunc.callHangUpWithoutParams.method]"
                    :model="callStatus"
                    :param-value="false"
                    :method="devCtrFunc.callHangUpWithoutParams.method"
                    icon="icon-shebeikongzhi-guaduan"
                    type="danger"
                    param-key="callStatus"
                    @btnClicked="callHangUpHandle"></SingleButton>
                </el-col>
                <el-col :span="8">
                  <MultipleButton
                    v-if="abilities[devCtrFunc.setMute.method]"
                    :buttons="dialerMuteButton"
                    :model="dialerMuteStatus"
                    :method="devCtrFunc.setMute.method"
                    param-key="mute"
                    @btnClicked="deviceControl"></MultipleButton>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
        <div
          v-if="abilities[devCtrFunc.setCameraPower.method]"
          class="device-monitor-unit">
          <div class="device-monitor-title">摄像头本端视频</div>
          <GroupButton
            :buttons="cameraPowerButton"
            :model="cameraPowerStatus"
            :method="devCtrFunc.setCameraPower.method"
            param-key="cameraPower"
            @btnClicked="deviceControl"></GroupButton>
        </div>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import DeviceLayout from './../partial/DeviceLayout';
  import DeviceBaseInfo from '../partial/DeviceBaseInfo';
  import DeviceDynamicStatus from '../partial/DeviceDynamicStatus';
  import GroupButton from './../atomic/GroupButton';
  import MultipleButton from './../atomic/MultipleButton';
  import AssembleButton from './../atomic/AssembleButton';
  import StatelessButton from './../atomic/StatelessButton';
  import SingleButton from './../atomic/SingleButton';
  import SliderControl from './../atomic/SliderControl';
  import DialerPanel from './../assemble/DialerPanel';
  import {
    assembleDeviceAbility,
    checkRespCorrect,
    deviceControlHandle,
    messageHandle, transformDeviceInitStatus
  } from '../../../utils';
  import {commonConfig, deviceCtrFunc} from '../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import {RealTimeMsgHandle} from '../../../modules/realTimeMsgHdl';
  import {DevCtrTimerHdl} from '../../../modules/deviceCtrTimerHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'VideoConfHostZoomRoom',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      GroupButton,
      SingleButton,
      AssembleButton,
      StatelessButton,
      MultipleButton,
      SliderControl,
      DialerPanel
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        roomId: '',
        devCtrFunc: deviceCtrFunc.videoConfHost,
        deviceStatus: {},
        deviceStatusKeys: [
          'power', 'mute', 'volume',
          'callId_callStatus', 'callId', 'callStatus',
          'sharingMode', 'cameraPower'
        ],
        callId: '',
        phoneNum: '',
        password: '',
        powerStatus: '', // 主机开关机状态
        powerButton: [
          {
            label: '开机',
            icon: 'icon-kaiqi',
            value: 'wake'
          },
          {
            label: '待机',
            icon: 'icon-huiyimoshi-guanbihuiyi',
            value: 'standby'
          }
        ],
        sharingMode: '', // 远程共享模式
        sharingModeButton: [
          {
            label: '',
            icon: 'icon-shebeikongzhi-gongxiang',
            value: 'on',
            isActive: true
          },
          {
            label: '',
            icon: 'icon-shebeikongzhi-gongxiang',
            value: 'off'
          }
        ],
        callStatus: false, // 通话状态
        callStatusAlias: '', // 通话状态
        dialerMuteStatus: '', // 通话静音状态
        dialerMuteButton: [
          {
            label: '',
            icon: 'icon-shebeikongzhi-jingyin',
            value: 'mute',
            isActive: true
          },
          {
            label: '',
            icon: 'icon-shebeikongzhi-jingyin',
            value: 'unmute'
          }
        ],
        dialerVolume: 0, // 通话音量

        cameraPowerStatus: '', // 摄像头开关机状态
        cameraPowerButton: [
          {
            label: '显示',
            icon: 'icon-kaiqi',
            value: 'wake'
          },
          {
            label: '隐藏',
            icon: 'icon-huiyimoshi-guanbihuiyi',
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
        const msg = this.$store.state.deviceStatusMsg;
        this.updateVideoConfHostStatus(msg);
      }
    },
    created() {
      this.roomId = this.$route.params.rid;
      this.getDeviceDetail();
      RealTimeMsgHandle.subscribe([this.deviceId]);
      DevCtrTimerHdl.initTimer(this.deviceId);
    },
    destroyed() {
      RealTimeMsgHandle.unsubscribe([this.deviceId]);
    },
    methods: {
      generateMock() { // todo 本地调试所用
        this.deviceStatus = {
          // model: 'XJL1203',
          // cameraId_firmwareVersion: {
          //   cameraId: '123',
          //   firmwareVersion: '1.23.5'
          // },
          // serialNumber: '25sf645as81s64d41sfe15',
          // power: 'wake',
          // mute: 'mute',
          // volume: '20',
          // callId_conferenceId: {
          //   callId: '123',
          //   conferenceId: '456'
          // },
          callId_callStatus: {
            callId: '123',
            callStatus: 'connected'
          }
          // sharingMode: 'localRemote',
        };
      },
      deviceBaseStatusUpdated(data = []) {
        const callStatus = data.find(d => {
          return d.key === 'callStatus';
        }) || {};
        this.callStatusAlias = callStatus.valueAlias || commonString.unknown;
      },
      updateVideoConfHostStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands, power, mute, callId_conferenceId, callId_callStatus, volume, sharingMode, cameraPower} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        // 设备信息赋值和显示隐藏
        power && (this.powerStatus = power);
        mute && (this.dialerMuteStatus = mute);
        callId_conferenceId && (this.callId = callId_conferenceId.callId || '');
        volume && (this.dialerVolume = parseInt(volume));
        if (callId_callStatus) {
          const {callId = '', callStatus = ''} = callId_callStatus;
          this.callId = callId;
          this.callStatus = callStatus === 'connected';
        }
        if (sharingMode) {
          this.sharingMode = sharingMode;
        }
        cameraPower && (this.cameraPowerStatus = cameraPower);

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          callStatus: this.callStatus,
          mute: this.dialerMuteStatus,
          volume: this.dialerVolume,
          sharingMode: this.sharingMode,
          cameraPower: this.cameraPowerStatus
        };
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() { // 获取设备初始状态
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateVideoConfHostStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      phoneNumChanged(val = '') {
        this.phoneNum = val;
      },
      passwordChanged(val = '') {
        this.password = val;
      },
      // 加入会议单独处理
      callJoinHandle() {
        if (!this.phoneNum) {
          this.$notify({message: '请输入会议号码！', type: 'warning', duration: 2000});
          return;
        }
        const ctrParam = {
          method: '',
          params: {
            number: this.phoneNum
          }
        };
        const expParam = {
          method: '',
          paramKey: 'callStatus',
          expectKey: 'callStatus',
          value: true
        };
        if (this.password.length > 0) {
          expParam.method = deviceCtrFunc.videoConfHost.callJoinEncrypted.method;
          ctrParam.method = deviceCtrFunc.videoConfHost.callJoinEncrypted.method;
          ctrParam.params['password'] = this.password;
        } else {
          expParam.method = deviceCtrFunc.videoConfHost.callJoin.method;
          ctrParam.method = deviceCtrFunc.videoConfHost.callJoin.method;
        }
        this.deviceControl(ctrParam, expParam);
      },
      // 挂断会议处理
      callHangUpHandle(ctrParam, expParam) {
        this.$confirm('确定挂断会议吗?', '挂断会议', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          this.deviceControl(ctrParam, expParam, true);
        }).catch(() => {
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

  .dialer-container {
    min-height: 450px;
    background-color: @colorGray98;
    border-radius: @borderRadiusMain;
    padding: 45px 70px;

    .conference-control-container {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 45px;
      padding-left: 50px;
      padding-right: 50px;
      text-align: center;
    }
  }

</style>
