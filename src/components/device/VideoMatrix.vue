<template>
  <div>
    <DeviceLayout
      :status-span="24"
      :control-span="24"
      :hide-divider="true">
      <div slot="baseInfo">
        <DeviceBaseInfo :status="deviceStatus"></DeviceBaseInfo>
      </div>
      <div slot="status">
        <DeviceDynamicStatus
          :include-keys="deviceStatusKeys"
          :status="deviceStatus"></DeviceDynamicStatus>
      </div>
      <div slot="control">
        <div class="header7 font-gray-60 mar-btm">
          <span class="iconfont icon-beizhushuoming"></span>
          <span>『V（VIDEO）表示视频，A（AUDIO）表示音频。双击即可进行路由切换』</span>
        </div>
        <MatrixPanel
          v-loading="devCtrLoading"
          v-if="abilities[devCtrFunc.setInputOutputRoute.method]"
          :rows="tableData"
          :outputs="outputData"
          @routeChanged="deviceControl"></MatrixPanel>
      </div>
    </DeviceLayout>
  </div>
</template>

<script>
  import DeviceLayout from './partial/DeviceLayout';
  import DeviceBaseInfo from './partial/DeviceBaseInfo';
  import DeviceDynamicStatus from './partial/DeviceDynamicStatus';
  import MatrixPanel from './assemble/MatrixPanel';
  import {
    checkRespCorrect,
    messageHandle,
    deviceControlHandle,
    deepCopyWithJson, assembleDeviceAbility, transformDeviceInitStatus
  } from '../../utils';
  import {deviceCtrFunc, commonConfig} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import {RealTimeMsgHandle} from '../../modules/realTimeMsgHdl';
  import {DevCtrTimerHdl} from '../../modules/deviceCtrTimerHdl';
  import {mapState} from 'vuex';

  const fakeData = [
    {
      'name': '桌插1',
      'type': 'input',
      'control_num': '01'
    },
    {
      'name': '思科输入',
      'type': 'input',
      'control_num': '02',
      'device': '1001'
    },
    {
      'name': 'maxhub PC 输入',
      'type': 'input',
      'control_num': '03'
    },
    {
      'name': '桌插2',
      'type': 'input',
      'control_num': '04'
    },
    {
      'name': '桌插3',
      'type': 'input',
      'control_num': '05'
    },
    {
      'name': '桌插4',
      'type': 'input',
      'control_num': '06'
    },
    {
      'name': '投影仪输出',
      'type': 'output',
      'control_num': '01',
      'device': '0201'
    },
    {
      'name': '思科输出',
      'type': 'output',
      'control_num': '02',
      'device': '1002'
    }
  ];

  export default {
    name: 'VideoMatrix',
    components: {
      DeviceLayout,
      DeviceBaseInfo,
      DeviceDynamicStatus,
      MatrixPanel
    },
    props: {
      deviceId: {
        type: Number,
        default: null
      }
    },
    data() {
      return {
        devCtrFunc: deviceCtrFunc.videoMatrix,
        outputData: [],
        tableData: [],
        deviceStatus: {},
        deviceStatusKeys: [],
        currentColumn: 0, // 标志当前鼠标移动到哪一列，用于列的highlight显示

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
        this.updateVideoMatrixStatus(msg);
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
      initChannelData(data = {}) {
        if (!data.channel_list) return;
        const {channel_list = []} = data;
        if (!__.isArray(channel_list)) return;
        const outputData = __.filter(channel_list, function(item) {
          return item.type === 'output';
        });
        this.outputData = [];
        const defaultTableData = [];
        channel_list.forEach(item => {
          if (item.type === 'input') {
            const channel = {
              inputChannel: {
                input: item.name,
                status: 'channel-status-offline',
                label: '无信号',
                prop: item.control_num,
                signal: false
              }
            };
            defaultTableData.push(channel);
          }
          if (item.type === 'output') {
            this.outputData.push({
              prop: item.control_num,
              label: item.name,
              device: item.device,
              status: 2,
              signal: false
            });
          }
        });
        outputData.forEach(od => {
          defaultTableData.forEach(dt => {
            dt[od.control_num] = ' ';
          });
        });
        this.tableData = JSON.parse(JSON.stringify(defaultTableData.map((dt, idx) => {
          return {...dt, idx};
        })));
      },
      updateRoute(data = {}) {
        const {input_output_route_combined = {}, output_signal_combined = {}, input_signal_combined = {}} = data;
        // 输入输出
        (Object.values(input_output_route_combined) || []).forEach(route => {
          const {input, output, signal = 'V'} = route;
          this.tableData.forEach(item => {
            if (item.inputChannel.prop === input) {
              item[output] = signal;
            } else {
              item[output] = ' ';
            }
          });
        });
        // 输入
        (Object.values(input_signal_combined) || []).forEach(signal => {
          const input = signal.input;
          this.tableData.forEach(item => {
            if (item.inputChannel.prop === input) {
              item.inputChannel.signal = signal.signal === 'true';
              item.inputChannel.label = (signal.signal === 'true') ? '有信号' : '无信号';
            }
          });
        });
        // 输出
        (Object.values(output_signal_combined) || []).forEach(signal => {
          const output = signal.output;
          this.outputData.forEach(item => {
            if (item.prop === output) {
              item.signal = signal.signal === 'true';
            }
          });
        });
        // if (data['input_output_route']) {
        //   (data.input_output_route || []).forEach(route => {
        //     const {input, output, signal = 'V'} = route;
        //     this.tableData.forEach(item => {
        //       if (item.inputChannel.prop === input) {
        //         item[output] = signal;
        //       } else {
        //         item[output] = ' ';
        //       }
        //     });
        //   });
        // }
        // if (data['input_signal']) {
        //   (data.input_signal || []).forEach(signal => {
        //     let input = signal.input;
        //     this.tableData.forEach(item => {
        //       if (item.inputChannel.prop === input) {
        //         item.inputChannel.signal = signal.signal === 'true';
        //         item.inputChannel.label = (signal.signal === 'true') ? '有信号' : '无信号';
        //       }
        //     })
        //   });
        // }
        // if (data['output_signal']) {
        //   (data.output_signal || []).forEach(signal => {
        //     let output = signal.output;
        //     this.outputData.forEach(item => {
        //       if (item.prop === output) {
        //         item.signal = signal.signal === 'true';
        //       }
        //     })
        //   });
        //   // todo 原有对象类型处理
        //   // let output = data.output_signal.output;
        //   // this.outputData.forEach(item => {
        //   //   if (parseInt(item.prop) === output) {
        //   //     if (data.output_signal.signal) {
        //   //       item.signal = data.output_signal.signal === 'true';
        //   //     }
        //   //   }
        //   // });
        // }
      },
      updateVideoMatrixStatus(msg = {}) {
        const data = msg[this.deviceId];
        if (!data) return;
        // 设备状态
        this.deviceStatus = {...this.deviceStatus, ...data};
        const {general_commands} = data;
        // 设备能力集
        general_commands && (this.ctrMethodData = general_commands);
        // 处理数据
        this.initChannelData(data);
        this.updateRoute(data);
        // 根据最新的页面数据源，以及当前控制的预期值，判断是否需要清空超时计时器
        const updated = {channelRoute: this.tableData};
        DevCtrTimerHdl.updateCtrStatus(this.deviceId, updated, this.ctrExpect);
      },
      getDeviceDetail() {
        API.room.roomDeviceDetailByDeviceId({id: this.deviceId}).then(resp => {
          if (checkRespCorrect(resp)) {
            const status = transformDeviceInitStatus(resp.data);
            this.updateVideoMatrixStatus(status);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
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

<style scoped lang="less">

</style>
