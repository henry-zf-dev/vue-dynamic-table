<template>
  <div>
    <DeviceLayout :status-span="24" :hide-divider="true">
      <div slot="baseInfo">
        <DeviceBaseInfo :status="deviceStatus"></DeviceBaseInfo>
      </div>
      <div slot="status">
        <DeviceDynamicStatus
          :include-keys="deviceStatusKeys"
          :status="deviceStatus"></DeviceDynamicStatus>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import DeviceLayout from './partial/DeviceLayout';
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import {deviceCtrFunc} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {checkRespCorrect, messageHandle, transformDeviceInitStatus} from '../../utils';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {mapState} from 'vuex';

  export default {
    name: 'BodyInduction',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        apiLoading: false, // 接口请求加载器(初始状态+控制)
        devCtrFunc: deviceCtrFunc.bodyInduction,
        deviceStatus: {},
        deviceStatusKeys: [
          'isOccupied', 'brightness'
        ],
        isOccupied: '', // 是否有人
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
        return timer.active || this.apiLoading;
      }
    },
    watch: {
      deviceStatusMsg() {
        const msg = this.$store.state.deviceStatusMsg || {};
        this.updateBodyInductionStatus(msg);
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
      updateBodyInductionStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        // 是否有人
        data['isOccupied'] && (this.isOccupied = data['isOccupied']);
      },
      // 获取设备初始状态
      getDeviceDetail() {
        const deviceId = this.deviceId;
        API.room.roomDeviceDetailByDeviceId({id: deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateBodyInductionStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      }
    }
  };
</script>

<style scoped>

</style>
