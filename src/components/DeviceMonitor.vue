<template>
  <div class="device-monitor-container">
    <el-dialog
      :visible="showDialog"
      :width="dialogExtraProp.width"
      :custom-class="dialogExtraProp.customClass"
      @close="closeMonitorDialog">
      <div v-if="showDialog">
        <div class="device-header-container">
          <span class="header5">{{ deviceInfo.name }}</span>
          <span
            class="iconfont icon-zujiantubiao-guanbi device-monitor-close-btn"
            @click="closeMonitorDialog"></span>
        </div>
        <div v-if="deviceInfo.deviceType === deviceType.projector">
          <Projector :device-id="deviceInfo.id"></Projector>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.power">
          <Power :device-id="deviceInfo.id"></Power>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.powerAmplifier">
          <PowerAmplifier :device-id="deviceInfo.id"></PowerAmplifier>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.display">
          <Display :device-id="deviceInfo.id"></Display>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.microphone">
          <Microphone :device-id="deviceInfo.id"></Microphone>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.camera">
          <Camera :device-id="deviceInfo.id"></Camera>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.videoMatrix">
          <VideoMatrix :device-id="deviceInfo.id"></VideoMatrix>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.audioProcessor">
          <AudioProcessor :device-id="deviceInfo.id"></AudioProcessor>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.videoConfHost">
          <div v-if="deviceInfo.brandName === deviceBrand.cisco">
            <VideoConfHostCisco :device-id="deviceInfo.id"></VideoConfHostCisco>
          </div>
          <div v-if="deviceInfo.brandName === deviceBrand.zoom">
            <VideoConfHostZoomRoom :device-id="deviceInfo.id"></VideoConfHostZoomRoom>
          </div>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.gateLock">
          <GateLock :device-id="deviceInfo.id"></GateLock>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.curtain">
          <Curtain :device-id="deviceInfo.id"></Curtain>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.light">
          <Lighting :device-id="deviceInfo.id"></Lighting>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.airCondition">
          <AirConditioner :device-id="deviceInfo.id"></AirConditioner>
        </div>
        <div v-else-if="deviceInfo.deviceType === deviceType.paperlessElevator">
          <PaperlessElevator :device-id="deviceInfo.id"></PaperlessElevator>
        </div>
        <div v-else>
          <BasicDevice :device-id="deviceInfo.id"></BasicDevice>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import BasicDevice from './device/BasicDevice';
  import Projector from './device/Projector';
  import Power from './device/Power';
  import PowerAmplifier from './device/PowerAmplifier';
  import Display from './device/Display';
  import Microphone from './device/Microphone';
  import Camera from './device/Camera';
  import VideoMatrix from './device/VideoMatrix';
  import AudioProcessor from './device/AudioProcessor';
  import VideoConfHostCisco from './device/videoConfHost/Cisco';
  import VideoConfHostZoomRoom from './device/videoConfHost/ZoomRoom';
  import GateLock from './device/GateLock';
  import Curtain from './device/Curtain';
  import Lighting from './device/Lighting';
  import AirConditioner from './device/AirConditioner';
  import PaperlessElevator from './device/PaperlessElevator';
  import BodyInduction from './device/BodyInduction';

  import {commonConfig} from '../config/common';

  export default {
    name: 'DeviceDialog',
    components: {
      BasicDevice, PowerAmplifier, Power,
      Projector, Display, Microphone, VideoConfHostCisco, VideoConfHostZoomRoom,
      Camera, VideoMatrix, AudioProcessor,
      GateLock, Curtain, Lighting, AirConditioner, PaperlessElevator, BodyInduction
    },
    model: {
      prop: 'showDialog',
      event: 'change'
    },
    props: {
      showDialog: {
        type: Boolean,
        default: false
      },
      deviceInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        deviceType: commonConfig.deviceTypeCode,
        deviceBrand: commonConfig.deviceBrand
      };
    },
    computed: {
      dialogExtraProp() {
        const extraProp = {
          width: '',
          customClass: ''
        };
        switch (this.deviceInfo.deviceType) {
          case this.deviceType.bodyInduction:
          case this.deviceType.controlPad:
          case this.deviceType.appointmentScreen:
          case this.deviceType.wirelessAP:
          case this.deviceType.switch:
          case this.deviceType.keyPanel:
          case this.deviceType.centralControl:
          case this.deviceType.otherSubCtr:
            extraProp.width = '500px';
            extraProp.customClass = 'device-monitor-dialog';
            break;
          case this.deviceType.audioProcessor:
          case this.deviceType.projector:
          case this.deviceType.display:
          case this.deviceType.videoMatrix:
          case this.deviceType.power:
          case this.deviceType.microphone:
          case this.deviceType.camera:
          case this.deviceType.airCondition:
          case this.deviceType.videoConfHost:
          case this.deviceType.light:
          case this.deviceType.powerAmplifier:
          case this.deviceType.gateLock:
          case this.deviceType.paperlessElevator:
          case this.deviceType.curtain:
          default:
            extraProp.width = '50%';
            extraProp.customClass = 'device-monitor-dialog limit-width';
            break;
        }
        return extraProp;
      }
    },
    methods: {
      closeMonitorDialog() {
        this.$emit('closeMonitorDialog');
        this.$emit('change', false);
      }
    }
  };
</script>

<style scoped lang="less">
  .device-header-container {
    position: relative;
    padding: @paddingMedium @paddingMain;
    border-bottom: solid 1px @colorBlackAlpha1;

    .device-monitor-close-btn {
      position: absolute;
      right: @paddingMain;
      cursor: pointer;
      font-size: @sizeSecond;
    }

    .device-monitor-close-btn:hover {
      color: @colorPrimary;
      font-size: @sizeMain;
    }
  }
</style>
