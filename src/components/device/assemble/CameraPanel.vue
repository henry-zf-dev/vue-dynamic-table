<template>
  <el-row v-loading="controlLoading">
    <el-col :span="14">
      <div class="orientation-container">
        <img :src="cameraImage" class="orientation-image">
        <div class="orientation-image-mask"></div>
        <div
          v-for="(orientation, idx) in orientationButton"
          :key="idx"
          :class="`orientation-${orientation.value}`"
          @mousedown="cameraControlStart(orientation, self)"
          @mouseup="cameraControlEnd(orientation)"
          @mouseover="cameraOriHover(orientation.value)"
          @mouseout="cameraOriHover"></div>
          <!--<div class="full-screen" @click="fullScreenControl"></div>-->
      </div>
    </el-col>
    <el-col :span="10" class="text-align-center position-relative">
      <div v-for="(zoom, idx) in zoomButton" :key="idx" class="text-align-center pad-btm-20 pad-top-20">
        <!--                <div-->
        <!--                  @mousedown="cameraControlStart(zoom, self)"-->
        <!--                  @mouseup="cameraControlEnd(zoom)"-->
        <!--                  class="el-button&#45;&#45;info camera-control-btn header5 cursor-pointer text-align-center">-->
        <!--                  <i class="iconfont font-size-18" :class="zoom.icon"></i>-->
        <!--                </div>-->
        <el-button
          type="info"
          size="medium"
          class="camera-control-btn"
          @mousedown.native="cameraControlStart(zoom, self)"
          @mouseup.native="cameraControlEnd(zoom)">
          <i :class="zoom.icon" class="iconfont font-size-18"></i>
        </el-button>
      </div>
      <div
        class="header6 font-gray-40 position-absolute text-align-center"
        style="bottom: -20px; left: 0; right: 0;">缩放调整
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {_} from 'vue-underscore';
  import {devCtrTimerConfig} from '../../../config/common';

  export default {
    name: 'CameraPanel',
    props: {
      defaultParams: {
        type: Object,
        default: () => {
          return {};
        }
      },
      methods: {
        type: Object,
        default: () => {
          return {
            vertical: '',
            horizontal: '',
            fullScreen: '',
            zoom: '',
            focus: ''
          };
        }
      }
    },
    data() {
      return {
        self: this,
        orientationButton: [
          {
            key: 'vertical',
            value: 'down'
          },
          {
            key: 'vertical',
            value: 'up'
          },
          {
            key: 'horizontal',
            value: 'left'
          },
          {
            key: 'horizontal',
            value: 'right'
          }
        ],
        selOrientation: '',
        controlLoading: false, // 标志摄像头控制中，在发送 stop 命令完成之前，不能再进行其他控制
        controlTimer: 300,
        zoomButton: [
          {
            key: 'zoom',
            value: 'in',
            icon: 'icon-tianjia'
          },
          {
            key: 'zoom',
            value: 'out',
            icon: 'icon-jian'
          }
        ],
        focusButton: [
          {
            key: 'zoom',
            value: 'in',
            icon: 'icon-tianjia'
          },
          {
            key: 'zoom',
            value: 'out',
            icon: 'icon-jian'
          }
        ]
      };
    },
    computed: {
      cameraImage() {
        switch (this.selOrientation) {
          case 'up':
            return require('../../../assets/img/camera-top.png');
          case 'right':
            return require('../../../assets/img/camera-rihgt.png');
          case 'down':
            return require('../../../assets/img/camera-bottom.png');
          case 'left':
            return require('../../../assets/img/camera-left.png');
          default:
            return require('../../../assets/img/camera-new.png');
        }
      }
    },
    methods: {
      // 摄像头上下左右、缩放 节流控制
      cameraControlStart: __.throttle((ctrItem, self) => {
        if (self.controlLoading) return;
        self.cameraControl(ctrItem);
      }, self.controlTimer, true),

      cameraControlEnd(ctrItem) {
        if (this.controlLoading) return;
        this.controlLoading = true;
        setTimeout(() => {
          this.cameraControl(ctrItem, true);
          this.controlLoading = false;
        }, this.controlTimer);
      },

      cameraControl(ctrItem, isStop = false) {
        const devCtrParams = {
          method: this.methods[ctrItem.key],
          params: {
            ...this.defaultParams,
            [ctrItem.key]: !isStop ? ctrItem.value : 'stop'
          }
        };
        this.selOrientation = !isStop ? ctrItem.value : '';
        this.$emit('cameraControl', devCtrParams, {}, true);
      },

      // 摄像头上下左右 hover 更改 img 背景图
      cameraOriHover(ori = '') {
        this.selOrientation = ori;
      }
    }
  };
</script>

<style scoped lang="less">
  .orientation-container {
    position: relative;
    text-align: center;
    width: 200px;

    .orientation-image {
      width: 200px;
    }

    .orientation-image-mask {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .orientation-up {
      cursor: pointer;
      position: absolute;
      width: 80px;
      height: 50px;
      top: 10px;
      left: 60px;
    }

    .orientation-right {
      cursor: pointer;
      position: absolute;
      width: 50px;
      height: 80px;
      top: 60px;
      left: 140px;
    }

    .orientation-down {
      cursor: pointer;
      position: absolute;
      width: 80px;
      height: 50px;
      top: 140px;
      left: 60px;
    }

    .orientation-left {
      cursor: pointer;
      position: absolute;
      width: 50px;
      height: 80px;
      top: 60px;
      left: 10px;
    }

    .full-screen {
      cursor: pointer;
      position: absolute;
      width: 55px;
      height: 55px;
      top: 72px;
      left: 72px;
    }
  }

  .camera-control-btn {
    width: 68px;
    height: 48px;
    border-radius: 24px !important;
    font-size: 25px;
  }
</style>
