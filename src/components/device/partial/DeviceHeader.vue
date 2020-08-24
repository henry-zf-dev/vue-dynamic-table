<template>
  <el-row class="device-header-container">
    <el-col :span="10">
      <span class="header5">{{ deviceInfo.name }}</span>
    </el-col>
    <el-col :span="14" class="text-align-right">
      <div class="display-none">
        <div class="header-opt-btn">
          <div class="text-align-center">
            <i class="iconfont icon-hulvegaojing display-block font-size-18 pad-top-5"></i>
            <span class="mar-top-5 display-block">忽略告警</span>
          </div>
        </div>
        <div class="header-opt-btn" @click="setHitch">
          <div class="text-align-center">
            <i class="iconfont icon-biaoweiguzhang display-block font-size-18 pad-top-5"></i>
            <span class="mar-top-5 display-block">{{ deviceStatus === commonString.availableStatus.breakdown.value ? '取消故障' : '设为故障' }}</span>
          </div>
        </div>
        <el-dropdown trigger="hover" @command="moreOperation">
          <div class="header-opt-btn">
            <div class="text-align-center">
              <i class="iconfont icon-gengduocaozuo display-block font-size-18 pad-top-5"></i>
              <span class="mar-top-5 display-block">更多</span>
            </div>
          </div>
          <el-dropdown-menu>
            <el-dropdown-item command="deviceLog">
              <i class="iconfont icon-huiyimoshi-jichumoshi font-size-second"></i>&nbsp;查看设备日志
            </el-dropdown-item>
            <el-dropdown-item command="deviceDetail">
              <i class="iconfont icon-huiyimoshi-toupingmoshi font-size-second"></i>&nbsp;查看设备详情
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { checkRespCorrect, messageHandle } from '../../../utils';
import { commonString, msgCode, msgContent } from '../../../config/string';

export default {
  name: 'DeviceHeader',
  props: {
    deviceInfo: {
      type: Object,
      default: () => {
        return {};
      }
    },
    getRoomDetail: {
      type: Function,
      default: () => {
        return () => {};
      }
    },
    getDeviceDetail: {
      type: Function,
      default: () => {
        return () => {};
      }
    }
  },
  data() {
    return {
      commonString: commonString,
      deviceStatus: '',
      deviceStatusName: ''
    };
  },
  created() {
    this.deviceStatus = this.deviceInfo.deviceStatus;
  },
  methods: {
    closeMonitorDialog() {
      this.$emit('closeMonitorDialog');
    },
    moreOperation(command) {

    },
    setHitch() {
      const param = {
        did: this.deviceInfo.id,
        data: {
          deviceStatus: this.deviceStatus === commonString.availableStatus.breakdown.value
            ? commonString.availableStatus.online.value : commonString.availableStatus.breakdown.value
        }
      };
      API.device.deviceEdit(param).then(resp => {
        if (checkRespCorrect(resp)) {
          messageHandle({
            code: msgCode.HAS_SAVE,
            msg: this.deviceInfo.name + (this.deviceStatus === commonString.availableStatus.breakdown.value ? '取消故障成功' : '设为故障成功')
          });
          this.$emit('getRoomDetail');
          this.deviceStatus = param.data.deviceStatus;
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
        }
      }).catch(err => {
        messageHandle({ code: msgContent.SYSTEM });
      });
    }
  }
};
</script>

<style scoped lang="less">
  .device-header-container {
    padding: @paddingMedium 0 @paddingMedium;
  }

  .header-opt-btn {
    display: inline-block;
    padding: 10px 20px;
    font-size: @sizeSecond;
    color: @colorGray40;
    cursor: pointer;
    height: 48px;
  }

  .header-opt-btn:hover {
    background: @colorGray98;
    color: @colorPrimary;
    font-weight: bold;
  }

  .el-divider--vertical {
    height: 30px !important;
    bottom: 12px !important;
    margin-left: 5px !important;
    margin-right: 5px !important;
  }

</style>
