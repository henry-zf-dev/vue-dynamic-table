<template>
  <div class="device-monitor-layout">
    <slot name="baseInfo"></slot>
    <el-row class="position-relative">
      <el-col :span="statusSpan" class="device-status-container">
        <div class="header6 device-status-header">设备状态</div>
        <slot name="status"></slot>
      </el-col>
      <el-col :span="controlSpan" class="device-control-container">
        <slot name="control"></slot>
      </el-col>
      <div v-if="!hideDivider" class="device-monitor-divider"></div>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'DeviceLayout',
  props: {
    statusSpan: {
      type: Number,
      default: 12
    },
    controlSpan: {
      type: Number,
      default: 12
    },
    hideDivider: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="less">

  .device-status-container {
    padding-bottom: @paddingMain;

    .device-status-header {
      padding: @paddingMedium 0 @paddingMedium @paddingMain;
    }
  }

  .device-control-container {
    padding-left: @paddingMain;
    padding-right: @paddingMain;
    padding-bottom: @paddingMain;
  }

  /* 设备状态和控制中间的竖线样式 */
  .device-monitor-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: @colorGray90;
  }

</style>
