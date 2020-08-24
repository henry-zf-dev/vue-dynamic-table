<template>
  <div class="cisco-control-container">
    <DeviceLayout>
      <div slot="baseInfo">
        <DeviceBaseInfo :status="deviceStatus"></DeviceBaseInfo>
      </div>
      <div slot="status">
        <DeviceDynamicStatus
          :include-keys="deviceStatusKeys"
          :status="deviceStatus"
          @statusUpdated="deviceBaseStatusUpdated"></DeviceDynamicStatus>
        <el-row
          v-for="(status, idx) in microphoneStatusData"
          v-if="status.show"
          :key="idx"
          class="header6 font-weight-regular font-gray-40 mar-btm-20 cursor-pointer">
          <el-col :span="10"><i :class="status.icon" class="iconfont font-size-18 mar-rgt-10"></i>{{ status.name }}
          </el-col>
          <el-col :span="14">{{ status.value }}</el-col>
          <el-col :span="24" class="mar-top-20">
            <el-divider></el-divider>
          </el-col>
        </el-row>
        <div
          v-if="mediaNetStatusData.length > 0 && callStatus"
          class="mar-top-10 cisco-dialer-monitor">
          <el-table :data="mediaNetStatusData">
            <el-table-column prop="jitter" min-width="80" label="jitter"></el-table-column>
            <el-table-column prop="pkgLoss" min-width="80" label="loss"></el-table-column>
            <el-table-column prop="chnDirection" min-width="100" label="chnDirection"></el-table-column>
            <el-table-column prop="mediaType" min-width="100" label="mediaType"></el-table-column>
          </el-table>
        </div>
      </div>
      <div v-loading="devCtrLoading" slot="control">
        <el-tabs v-model="currentTab">
          <el-tab-pane label="视频主机" name="dialer-tab">
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
                <StatelessButton
                  :method="devCtrFunc.callJoin.method"
                  label="拨号"
                  icon="icon-shebeikongzhi-bohao"
                  @btnClicked="callJoinHandle"></StatelessButton>
              </div>
              <div v-else>
                <div class="text-align-center">
                  <div v-if="phoneNum" class="header2 mar-btm">{{ phoneNum }}</div>
                  <div class="header6 font-gray-40 mar-btm">{{ callStatusAlias }}</div>
                </div>
                <div class="position-relative">
                  <el-input
                    v-model="password"
                    clearable
                    size="medium"
                    placeholder="请输入会议密码（如有）"></el-input>
                  <i
                    class="iconfont icon-enter pwd-confirm"
                    @click="passwordConfirm"></i>
                </div>
                <div class="text-align-center pad-lft pad-rgt">
                  <SliderControl
                    v-if="abilities[devCtrFunc.setVolume.method]"
                    :model="dialerVolume"
                    :method="devCtrFunc.setVolume.method"
                    param-key="volume"
                    class="mar-top-30"
                    @sliderChanged="deviceControl"></SliderControl>
                  <el-row class="mar-top-40">
                    <el-col :span="8">
                      <AssembleButton
                        v-if="abilities[devCtrFunc.setSharingMode.method]"
                        :buttons="sharingModeButton"
                        :model="sharingMode"
                        param-key="sharingMode"
                        @btnClicked="deviceControl"></AssembleButton>
                    </el-col>
                    <el-col :span="8">
                      <SingleButton
                        v-if="abilities[devCtrFunc.callHangUp.method]"
                        :model="callStatus"
                        :default-params="{callId: callId}"
                        :param-value="false"
                        :method="devCtrFunc.callHangUp.method"
                        icon="icon-shebeikongzhi-guaduan"
                        type="danger"
                        param-key="callStatus"
                        @btnClicked="callHangUpHandle"></SingleButton>
                    </el-col>
                    <el-col :span="8">
                      <MultipleButton
                        v-if="abilities[devCtrFunc.setMute.method]"
                        :buttons="muteButton"
                        :model="muteStatus"
                        :method="devCtrFunc.setMute.method"
                        param-key="mute"
                        @btnClicked="deviceControl"></MultipleButton>
                    </el-col>
                  </el-row>
                </div>
                <div
                  v-if="abilities[devCtrFunc.setDisturb.method]"
                  class="device-monitor-unit mar-top">
                  <div class="device-monitor-title">免打扰状态</div>
                  <GroupButton
                    :buttons="disturbButton"
                    :model="disturbStatus"
                    :method="devCtrFunc.setDisturb.method"
                    param-key="isDisturbed"
                    @btnClicked="deviceControl"></GroupButton>
                </div>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="摄像头" name="camera-tab">
            <div
              v-if="abilities[devCtrFunc.setCameraHorizontal.method]"
              class="device-monitor-unit">
              <div class="device-monitor-title">设备控制</div>
              <CameraPanel
                :methods="cameraCtrMethods"
                :default-params="{cameraId: '1'}"
                @cameraControl="deviceControl"></CameraPanel>
            </div>
            <div
              v-if="abilities[devCtrFunc.setCameraPower.method]"
              class="device-monitor-unit">
              <div class="device-monitor-title">本端视频</div>
              <GroupButton
                :buttons="cameraPowerButton"
                :model="cameraPowerStatus"
                :method="devCtrFunc.setCameraPower.method"
                param-key="cameraPower"
                @btnClicked="deviceControl"></GroupButton>
            </div>
            <div
              v-if="abilities[devCtrFunc.setCameraFullScreen.method]"
              class="device-monitor-unit">
              <div class="device-monitor-title">全屏控制</div>
              <GroupButton
                :buttons="cameraFullScreenButton"
                :model="cameraFullScreenStatus"
                :method="devCtrFunc.setCameraFullScreen.method"
                param-key="action"
                @btnClicked="deviceControl"></GroupButton>
            </div>
          </el-tab-pane>
        </el-tabs>
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
  import SingleButton from './../atomic/SingleButton';
  import StatelessButton from './../atomic/StatelessButton';
  import SliderControl from './../atomic/SliderControl';
  import CameraPanel from './../assemble/CameraPanel';
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
    name: 'VideoConfHostCisco',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      GroupButton,
      SingleButton,
      StatelessButton,
      AssembleButton,
      MultipleButton,
      SliderControl,
      CameraPanel
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
        currentTab: 'dialer-tab',
        deviceStatus: {},
        deviceStatusKeys: [
          'power', 'mute', 'volume', 'zoom',
          'callId_callStatus', 'callStatus',
          'sharingMode', 'presentationMode', 'isDisturbed',
          'padStatus', 'cameraStatus', 'cameraId_model',
          'cameraId_serialNumber', 'cameraModel', 'cameraSerialNumber', 'selfviewFullscreenMode'
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
        callStatus: false, // 通话状态
        callStatusAlias: '通话中', // 通话状态
        sharingMode: '', // 远程共享模式
        sharingModeButton: [
          {
            label: '',
            icon: 'icon-shebeikongzhi-gongxiang',
            value: 'localRemote',
            method: deviceCtrFunc.videoConfHost.setSharingMode.method,
            params: {
              sharingMode: 'localRemote'
            },
            isActive: true
          },
          {
            label: '',
            icon: 'icon-shebeikongzhi-gongxiang',
            value: 'off',
            method: deviceCtrFunc.videoConfHost.setSharingOff.method
          }
        ],
        disturbStatus: '', // 免打扰状态
        disturbButton: [
          {
            label: '开启',
            icon: 'icon-kaiqi',
            value: 'on'
          },
          {
            label: '关闭',
            icon: 'icon-huiyimoshi-guanbihuiyi',
            value: 'off'
          }
        ],
        muteStatus: '', // 通话静音状态
        muteButton: [
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

        // 摄像头相关控制
        cameraCtrMethods: {
          vertical: deviceCtrFunc.videoConfHost.setCameraVertical.method,
          horizontal: deviceCtrFunc.videoConfHost.setCameraHorizontal.method,
          fullScreen: deviceCtrFunc.videoConfHost.setCameraFullScreen.method,
          zoom: deviceCtrFunc.videoConfHost.setCameraZoom.method
        },
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
        cameraFullScreenStatus: '', // 摄像头全屏状态
        cameraFullScreenButton: [
          {
            label: '开启全屏',
            icon: 'icon-kaiqi',
            value: 'on'
          },
          {
            label: '取消全屏',
            icon: 'icon-huiyimoshi-guanbihuiyi',
            value: 'off'
          }
        ],
        microphoneStatusData: [],
        mediaNetStatusData: [],
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
      },
      callStatus() {
        // 挂断会议后清空 password
        if (!this.callStatus) {
          this.password = '';
        }
      }
    },
    created() {
      this.roomId = this.$route.params.rid;
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
          297: {
            deviceType: '10',
            model: 'XJL1203',
            cameraId_firmwareVersion: {
              cameraId: '123',
              firmwareVersion: '1.23.5'
            },
            serialNumber: '25sf645as81s',
            power: 'wake',
            mute: 'mute',
            volume: '20',
            callId_conferenceId: {
              callId: '123',
              conferenceId: '456'
            },
            media_net_status: {
              'callId': '45',
              'channelList': [{
                'jitter': '2000',
                'maxJitter': '3',
                'channel': '633',
                'chnDirection': 'Incoming',
                'mediaType': 'Audio',
                'pkgSum': '161854',
                'pkgLoss': '10'
              }, {
                'jitter': '0',
                'maxJitter': '0',
                'channel': '634',
                'chnDirection': 'Outgoing',
                'mediaType': 'Audio',
                'pkgSum': '323657',
                'pkgLoss': '548'
              }, {
                'jitter': '0',
                'maxJitter': '0',
                'channel': '635',
                'chnDirection': 'Incoming',
                'mediaType': 'Video',
                'pkgSum': '325017',
                'pkgLoss': '0'
              }, {
                'jitter': '3',
                'maxJitter': '3',
                'channel': '636',
                'chnDirection': 'Outgoing',
                'mediaType': 'Video',
                'pkgSum': '834608',
                'pkgLoss': '1982'
              }, {
                'jitter': '0',
                'maxJitter': '1',
                'channel': '637',
                'chnDirection': 'Incoming',
                'mediaType': 'Video',
                'pkgSum': '605297',
                'pkgLoss': '3'
              }, {
                'jitter': '0',
                'maxJitter': '0',
                'channel': '638',
                'chnDirection': 'Outgoing',
                'mediaType': 'Video',
                'pkgSum': '0',
                'pkgLoss': '0'
              }, {
                'jitter': '0',
                'maxJitter': '0',
                'channel': '639',
                'chnDirection': 'Incoming',
                'mediaType': 'Data',
                'pkgSum': '162',
                'pkgLoss': '0'
              }, {
                'jitter': '0',
                'maxJitter': '0',
                'channel': '640',
                'chnDirection': 'Outgoing',
                'mediaType': 'Data',
                'pkgSum': '162',
                'pkgLoss': '0'
              }]
            },
            cameraId_model: {
              cameraId: 1,
              model: '10001'
            },
            cameraId_serialNumber: {
              cameraId: 1,
              serialNumber: '2501454#ddfdf4551110'
            },
            callId_callStatus: {
              callId: '123',
              callStatus: 'connected'
            },
            sharingMode: 'localRemote',
            isDisturbed: 'off',
            padStatus: 'connected',
            cameraStatus: 'disconnected'
          }
        };
        this.updateVideoConfHostStatus(this.deviceStatus);
      },
      deviceBaseStatusUpdated(data = []) {
        const callStatus = data.find(d => {
          return d.key === 'callStatus';
        }) || {};
        this.callStatusAlias = callStatus.valueAlias || '通话中';
      },
      updateVideoConfHostStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {
          general_commands, power, mute, callId_conferenceId, callId_callStatus,
          volume, sharingMode, isDisturbed, microphone_status, media_net_status
        } = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        // 设备信息赋值和显示隐藏
        power && (this.powerStatus = power);
        mute && (this.muteStatus = mute);
        isDisturbed && (this.disturbStatus = isDisturbed);
        callId_conferenceId && (this.callId = callId_conferenceId.callId || '');
        volume && (this.dialerVolume = parseInt(volume));
        // 抖动、延迟、丢包
        if (media_net_status) {
          const {channelList} = media_net_status;
          if (channelList) {
            this.mediaNetStatusData = [];
          }
          (channelList || []).forEach(item => {
            this.mediaNetStatusData.push({
              ...item,
              show: true,
              pkgLoss: Number((item.pkgLoss / item.pkgSum || 0) * 100).toFixed(1) + '%'
            });
          });
        }
        // 麦克风
        if (microphone_status) {
          const {microphoneStatusList} = microphone_status;
          if (microphoneStatusList) { // todo 有隐患，目前只有麦克风的状态还没事，后续加上其他状态就不能清空
            this.microphoneStatusData = [];
          }
          (microphoneStatusList || []).forEach((item, index) => {
            this.microphoneStatusData.push({
              name: '麦克风' + (index + 1),
              show: true,
              value: item.microphoneStatus === 'connected' ? '已连接' : '未连接',
              attribute: 'microphoneStatus',
              icon: 'icon-quxiaojingyin'
            });
          });
        }
        if (callId_callStatus) {
          const {callId = '', callStatus = ''} = callId_callStatus;
          this.callId = callId;
          this.callStatus = callStatus === 'connected';
        }
        if (sharingMode) {
          this.sharingMode = sharingMode;
        }

        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {
          power: this.powerStatus,
          callStatus: this.callStatus,
          mute: this.muteStatus,
          volume: this.dialerVolume,
          isDisturbed: this.disturbStatus,
          sharingMode: this.sharingMode
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
      passwordConfirm() {
        if (!this.password) return;
        // 思科密码入会过程：先 callJoin 成功后，再使用返回的 callId 加 password 调用 callJoinWithPwd
        const ctrParam = {
          method: deviceCtrFunc.videoConfHost.callJoinWithPwd.method,
          params: {
            callId: this.callId,
            dtmfIndex: this.password
          }
        };
        const expParam = {
          method: deviceCtrFunc.videoConfHost.callJoinWithPwd.method,
          ignoreParam: true
        };
        this.deviceControl(ctrParam, expParam);
      },
      // 加入会议单独处理
      callJoinHandle() {
        if (!this.phoneNum) {
          this.$notify({message: '请输入会议号码！', type: 'warning', duration: 2000});
          return;
        }
        const ctrParam = {
          method: deviceCtrFunc.videoConfHost.callJoin.method,
          params: {
            number: this.phoneNum
          }
        };
        const expParam = {
          method: deviceCtrFunc.videoConfHost.callJoin.method,
          paramKey: 'callStatus',
          expectKey: 'callStatus',
          value: true
        };
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

  .pwd-confirm {
    position: absolute;
    right: 0;
    top: 0;
    width: 32px;
    height: 24px;
    padding-top: 10px;
    text-align: center;
    cursor: pointer;
  }

  .pwd-confirm:hover {
    color: @colorPrimary;
  }

</style>
