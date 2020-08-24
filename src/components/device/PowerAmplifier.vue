<template>
  <div class="height-100">
    <div>
      <DeviceBaseInfo :form-label-data="infoData" width="100%"></DeviceBaseInfo>
    </div>
  </div>
</template>

<script>
import DeviceBaseInfo from './partial/DeviceBaseInfo';

export default {
  name: 'PowerAmplifier',
  components: {
    DeviceBaseInfo
  },
  data() {
    return {
      infoData: [
        { name: '型号：', show: true, value: 'v-10' },
        { name: '固件版本：', show: true, value: 'v-10-1' },
        { name: '序列号：', show: true, value: 'v-10-2' },
        { name: '音频IP：', show: true, value: 'v-10-3' },
        { name: '设备ID：', show: true, value: 'v-10-3' }
      ]
    };
  }
};
</script>

<style scoped>

</style>
