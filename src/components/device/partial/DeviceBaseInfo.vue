<template>
  <div v-show="showDeviceInfo" class="device-info-container">
    <span class="header7 font-weight-bold device-info-title">设备信息</span>
    <el-divider direction="vertical"></el-divider>
    <span v-for="(info, idx) in baseInfo" v-show="info.show" :key="idx" class="header7 font-gray-40 mar-rgt-20">
      {{ info.label }}: {{ getStatusValue(info) }}
    </span>
  </div>
</template>

<script>
import { commonString } from '../../../config/string';
import { _ } from 'vue-underscore';
import { objectFlatten } from '../../../utils';

export default {
  name: 'DeviceBaseInfo',
  props: {
    status: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      commonString: commonString,
      baseInfo: [
        { key: 'model', label: '型号', show: false },
        { key: 'firmwareVersion', label: '固件版本', show: false },
        { key: 'softwareVersion', label: '软件版本', show: false },
        { key: 'serialNumber', label: '序列号', show: false },
        { key: 'mac', label: 'MAC地址', show: false },
        { key: 'ip', label: 'IP地址', show: false },
        { key: 'subnetMask', label: '子网掩码', show: false },
        { key: 'gateway', label: '网关地址', show: false }
      ],
      watchedStatus: {}
    };
  },
  computed: {
    showDeviceInfo() {
      return __.pluck(this.baseInfo, 'show').includes(true);
    }
  },
  watch: {
    status: {
      handler() {
        this.updateStatus();
      },
      immediate: true
    }
  },
  methods: {
    updateStatus() {
      const flattenData = objectFlatten(this.status, true);
      this.$set(this, 'watchedStatus', { ...this.watchedStatus, ...flattenData });
    },
    getStatusValue(info = {}) {
      const statusKey = Object.keys(this.watchedStatus).find(key => {
        if (key.includes('.')) {
          return __.last(key.split('.')).includes(info.key);
        } else {
          return key === info.key;
        }
      });
      info.show = !!statusKey;
      return this.watchedStatus[statusKey] || commonString.unknown;
    }
  }
};
</script>

<style scoped lang="less">
  .device-info-container {
    background: @colorGray98;
    padding: 12px @paddingMain;

    .device-info-title {
      color: @colorGray40;
    }

    .el-divider--vertical {
      margin-left: 10px !important;
      margin-right: 10px !important;
    }

  }
</style>
