<template>
  <div>
    <div class="position-relative">
      <div v-loading="graphLoading" class="device-link-graph-container">
        <div :id="linkGraphContainer" style="min-height: 600px"></div>
        <el-tooltip :open-delay="300" content="列表模式" placement="top">
          <el-button
            class="iconfont icon-liebiaomoshi view-switch-btn"
            @click="switchToListMode"></el-button>
        </el-tooltip>
      </div>
    </div>
    <div
      v-show="nodeTooltip.show"
      :id="nodeTooltipId"
      :style="{top: `${nodeTooltip.top}px`, left: `${nodeTooltip.left}px`}"
      class="device-node-tooltip-container">
      <div class="device-node-tooltip-content">
        <div class="device-node-tooltip-title">{{ nodeTooltip.data.name }}</div>
        <div class="device-node-tooltip-detail">品牌：{{ nodeTooltip.data.brandName || commonString.unknown }}</div>
        <div class="device-node-tooltip-detail">系列：{{ nodeTooltip.data.seriesName || commonString.unknown }}</div>
        <div v-for="(extend, idx) in nodeTooltip.data.baseAttr" :key="idx" class="device-node-tooltip-detail">
          <span>{{ extend.cn }}：{{ extend.v || commonString.unknown }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import G6 from '@antv/g6';
  import {
    checkRespCorrect,
    deepCopyWithJson,
    getTableMinHeight,
    judgeStrEqual,
    messageHandle,
    assembleTreeFromArray, calculateTreeDepth, forceToString
  } from '../../../../utils';
  import {
    commonConfig,
    websocketType
  } from '../../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../../config/string';
  import EZTable from '../../../../components/table/EZTable';
  import FormOptBtn from '../../../../components/FormOptBtn';
  import {mapState} from 'vuex';
  import {RealTimeMsgHandle} from '../../../../modules/realTimeMsgHdl';

  const elementResizeDetectorMaker = require('element-resize-detector');

  export default {
    name: 'RoomDeviceLinkGraph',
    components: {
      FormOptBtn,
      EZTable
    },
    model: {
      event: 'change'
    },
    props: {
      roomInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    data() {
      return {
        commonConfig: commonConfig,
        commonString: commonString,
        // 链路图模式相关数据源
        graphLoading: true,
        linkGraphContainer: 'linkGraphContainer',
        deviceLinkData: [],
        subscribeDevice: [],
        graphSize: {
          width: 600,
          height: 600
        },
        graph: null,
        graphData: {
          nodes: [],
          edges: []
        },
        nodeTooltipId: 'nodeTooltipId',
        nodeTooltip: {
          show: false,
          top: 0,
          left: 0,
          data: {}
        },
        nodeToolTipSize: {
          width: 0,
          height: 60
        }
      };
    },
    computed: {
      ...mapState([
        'deviceOnlineMsg', 'deviceAlarmMsg', 'deviceStatusMsg', 'routeParamState'
      ]),
      subCtrInfo() {
        const {centralControl = {}} = this.roomInfo;
        const {id, isOnline, ipParam = []} = centralControl;
        let ip = '';
        if (ipParam.length > 0) {
          ip = ipParam[0]['remoteIP'];
        }
        return {
          id: `node-${id}`,
          dataId: id,
          name: '易科分控',
          subtitle: `EZpro ${ip}`,
          deviceType: '99',
          isOnline: isOnline,
          alarmStatus: '0',
          isSubCtr: true
        };
      }
    },
    watch: {
      deviceOnlineMsg() {
        const msg = this.$store.state.deviceOnlineMsg;
        this.updateDeviceStatus(websocketType.deviceOnline, msg);
      },
      deviceAlarmMsg() {
        const msg = this.$store.state.deviceAlarmMsg;
        this.updateDeviceStatus(websocketType.deviceAlarm, msg);
      },
      deviceStatusMsg() {
        const msg = this.$store.state.deviceStatusMsg;
        this.updateDeviceStatus(websocketType.deviceStatus, msg);
      },
      subCtrInfo() {
        this.initLinkGraph();
      },
      deviceLinkData() {
        this.initLinkGraph();
      }
    },
    activated() {
      this.getDeviceLinkData();
      // setTimeout(() => {
      //   this.updateDeviceStatus(websocketType.deviceAlarm, {
      //     deviceId: '5',
      //     alarmStatus: '1'
      //   });
      // }, 3000);
      // setTimeout(() => {
      //   this.updateDeviceStatus(websocketType.deviceOnline, {
      //     deviceId: '5',
      //     isOnline: 'N'
      //   });
      // }, 6000);
    },
    deactivated() {
      RealTimeMsgHandle.unsubscribe(__.pluck(this.deviceLinkData, 'id'));
    },
    mounted() {
      // 监听 nodeTooltip 宽高变化，该高度决定 nodeTooltip 绝对定位的起始位置
      const nodeTooltip = document.getElementById(this.nodeTooltipId);
      if (!nodeTooltip) return;
      const erd = elementResizeDetectorMaker();
      erd.listenTo(nodeTooltip, (element) => {
        this.nodeToolTipSize = {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
      });
    },
    destroyed() {
      RealTimeMsgHandle.unsubscribe(__.pluck(this.deviceLinkData, 'id'));
      // 移除事件监听
      const nodeTooltip = document.getElementById(self.nodeTooltipId);
      const events = ['mouseenter', 'mousemove', 'wheel'];
      if (nodeTooltip) {
        events.forEach(event => {
          nodeTooltip.removeEventListener(event, () => {
          });
        });
        nodeTooltip.removeEventListener('mouseleave', () => {
        });
      }
      const domNodes = document.getElementsByClassName('device-node-container');
      if (domNodes) {
        Array.from(domNodes).forEach(node => {
          events.forEach(event => {
            node.removeEventListener(event, () => {
            });
          });
          node.removeEventListener('mouseleave', () => {
          });
          node.removeEventListener('click', () => {
          });
        });
      }
    },
    methods: {
      // 有会议室告警、分数、使用状态、设备告警、在线/离线 推送后更新相关页面
      updateDeviceStatus(type, msg) {
        const device = this.deviceLinkData.find(data => {
          return judgeStrEqual(msg.deviceId, data.id);
        });
        if (!device) return;
        switch (type) {
          case websocketType.deviceOnline:
            device['isOnline'] = msg.isOnline;
            break;
          case websocketType.deviceAlarm:
            device['alarmStatus'] = msg.alarmStatus;
            break;
          default:
            break;
        }
        const nodeId = `node-${device.id}`;
        this.graph.updateItem(nodeId, {...device, id: nodeId});
      },
      getDeviceLinkData() {
        this.graphLoading = true;
        API.room.roomDeviceListByRoomId({
          id: this.$route.params.rid,
          pageNo: 1,
          pageSize: 50
        }).then(resp => {
          this.graphLoading = false;
          if (checkRespCorrect(resp)) {
            const {items = []} = resp.data || {};
            if (!items.length) {
              this.$emit('change', 'list');
              return;
            }
            this.deviceLinkData = items.map(device => {
              return {
                ...device,
                deviceType: device['categoryCode']
              };
            });
            RealTimeMsgHandle.subscribe(__.pluck(this.deviceLinkData, 'id'));
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.graphLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },

      // 设备链路图相关
      initLinkGraph() {
        if (!this.subCtrInfo.id || !this.deviceLinkData.length) return;
        const container = $(`#${this.linkGraphContainer}`);
        if (!container) return;
        this.destroyLinkGraph();
        const self = this;
        const deviceData = deepCopyWithJson(this.deviceLinkData);

        function assembleGraphData() {
          self.graphData = {
            nodes: [],
            edges: []
          };
          const nodes = [];
          const gatewayNodes = [];
          const edges = [];
          nodes.push(self.subCtrInfo);
          deviceData.forEach(data => {
            data['dataId'] = data['id'];
            data['id'] = `node-${data['id']}`;
            data['parentId'] && (data['pid'] = `node-${data['parentId']}`);
            data['deviceType'] = data['categoryCode'];
            data['subtitle'] = `${data['brandName'] || '--'}${data['seriesName'] || '--'}`;
            if (data.deviceType === commonConfig.deviceTypeCode.otherSubCtr) {
              gatewayNodes.push(data);
            } else {
              if (data.hasOwnProperty('pid')) {
                if (data.pid === self.subCtrInfo.id) {
                  nodes.push(data);
                  edges.push({
                    source: data.pid,
                    target: data.id,
                    name: data.name
                  });
                } else {
                  gatewayNodes.push(data);
                }
              }
            }
          });
          const insertIdx = parseInt(nodes.length / 2) + 1;
          gatewayNodes.forEach(node => {
            nodes.splice(insertIdx, 0, node);
            edges.splice(insertIdx, 0, {
              source: node.pid,
              target: node.id,
              name: node.name
            });
          });
          self.graphData = {nodes, edges};
        }

        function calculateGraphSize() {
          let heightUnit = 0;
          let hasOtherGateway = false;
          self.graphData.nodes.forEach(n => {
            if (n.hasOwnProperty('parentId')) {
              if (n['parentId'] === self.subCtrInfo.dataId) {
                heightUnit++;
              } else {
                hasOtherGateway = true;
              }
            }
          });
          const widthUnit = hasOtherGateway ? 3 : 2;
          self.graphSize = {
            width: widthUnit * 190 + (widthUnit - 1) * 95,
            height: Math.max(
              heightUnit * 56 + (heightUnit - 1) * 15,
              getTableMinHeight(self.linkGraphContainer, 43)
            )
          };
        }

        function getDeviceClass(device = {}) {
          let deviceImg, onlineIcon, alarmImg, alarmColor;
          const {deviceType, isOnline, alarmStatus} = device;
          const online = isOnline === 'Y' ? 'on' : 'off';
          switch (deviceType) {
            case commonConfig.deviceTypeCode.audioProcessor:
              deviceImg = require(`../../../../assets/img/videoMatrix-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.projector:
              deviceImg = require(`../../../../assets/img/projector-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.display:
              deviceImg = require(`../../../../assets/img/display-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.videoMatrix:
              deviceImg = require(`../../../../assets/img/videoMatrix-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.power:
              deviceImg = require(`../../../../assets/img/power-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.microphone:
              deviceImg = require(`../../../../assets/img/microphone-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.camera:
              deviceImg = require(`../../../../assets/img/camera-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.airCondition:
              deviceImg = require(`../../../../assets/img/airCondition-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.videoConfHost:
              deviceImg = require(`../../../../assets/img/videoConfHost-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.light:
              deviceImg = require(`../../../../assets/img/light-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.bodyInduction:
              deviceImg = require(`../../../../assets/img/bodyInduction-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.gateLock:
              deviceImg = require(`../../../../assets/img/gateLock-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.keyPanel:
              deviceImg = require(`../../../../assets/img/keyPanel-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.paperlessElevator:
              deviceImg = require(`../../../../assets/img/paperlessElevator-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.curtain:
              deviceImg = require(`../../../../assets/img/curtain-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.controlPad:
              deviceImg = require(`../../../../assets/img/controlPad-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.appointmentScreen:
              deviceImg = require(`../../../../assets/img/appointmentScreen-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.wirelessAP:
              deviceImg = require(`../../../../assets/img/wirelessAP-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.switch:
              deviceImg = require(`../../../../assets/img/switch-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.centralControl:
              deviceImg = require(`../../../../assets/img/subControl-${online}.svg`);
              break;
            case commonConfig.deviceTypeCode.otherSubCtr:
              deviceImg = require(`../../../../assets/img/subControl-${online}.svg`);
              break;
            default:
              break;
          }
          switch (isOnline) {
            case 'Y':
              onlineIcon = 'icon-zaixianzhuangtai-zaixian font-color-success';
              break;
            case 'N':
            default:
              onlineIcon = 'icon-zaixianzhuangtai-lixian font-color-danger';
              break;
          }
          switch (alarmStatus) {
            case '1':
              alarmColor = 'font-color-warning';
              alarmImg = require('../../../../assets/img/icon-alarm.png');
              break;
            case '0':
            default:
              alarmColor = 'font-gray-10';
              alarmImg = require('../../../../assets/img/icon-normal.png');
              break;
          }
          return {deviceImg, onlineIcon, alarmImg, alarmColor};
        }

        function getDeviceBgColor(device = {}) {
          if (device.alarmStatus === commonString.monitorStatus.alarm.value) {
            return '#FFF8EB';
          }
          if (device.isOnline === commonString.connectionStatus.offline.value) {
            return '#F5F5F5';
          }
          return '#FFFFFF';
        }

        function getDeviceBorderColor(device = {}) {
          if (device.alarmStatus === commonString.monitorStatus.alarm.value) {
            return '#FACC14';
          }
          return '#E0E0E0';
        }

        function getPointByEdge(cfg = {}) {
          let point = {};
          const {source = '', target = ''} = cfg;
          const sourceNode = self.graphData.nodes.find(d => d.id === source) || {};
          const targetNode = self.graphData.nodes.find(d => d.id === target) || {};
          if (sourceNode.isOnline === commonString.connectionStatus.offline.value ||
            targetNode.isOnline === commonString.connectionStatus.offline.value) {
            return point;
          } else {
            if (sourceNode.alarmStatus === commonString.monitorStatus.alarm.value ||
              targetNode.alarmStatus === commonString.monitorStatus.alarm.value) {
              point = {show: true, color: '#E0E0E0'};
            } else {
              point = {show: true, color: '#E0E0E0'};
            }
          }
          return point;
        }

        // 根据 dom 节点获取 node 数据源
        function getNodeModel(node = {}) {
          const nodeItem = self.graph.findById(node.id);
          if (!nodeItem) return {};
          const {_cfg = {}} = nodeItem;
          const {model = {}} = _cfg;
          return model;
        }

        // 更新 tooltip 坐标
        function updateTooltipOffset(node) {
          if (!node) return;
          const nodeRect = node.getBoundingClientRect();
          if (!nodeRect) return;
          const {x, y} = nodeRect;
          const model = getNodeModel(node);
          self.nodeTooltip = {
            show: true,
            top: y - self.nodeToolTipSize.height,
            left: x,
            data: model
          };
        }

        // 为节点绑定事件回调
        function nodeBindEvent() {
          let currentNode = null;
          const events = ['mouseenter', 'mousemove', 'wheel'];
          const nodeTooltip = document.getElementById(self.nodeTooltipId);
          if (nodeTooltip) {
            events.forEach(event => {
              nodeTooltip.addEventListener(event, () => {
                updateTooltipOffset(currentNode);
              });
            });
            nodeTooltip.addEventListener('mouseleave', () => {
              self.nodeTooltip.show = false;
            });
          }
          const domNodes = document.getElementsByClassName('device-node-container');
          Array.from(domNodes).forEach(node => {
            if (node) {
              if (node.id !== self.subCtrInfo.id) {
                events.forEach(event => {
                  node.addEventListener(event, () => {
                    currentNode = node;
                    updateTooltipOffset(node);
                  });
                });
                node.addEventListener('mouseleave', () => {
                  self.nodeTooltip.show = false;
                });
              }
              node.addEventListener('click', () => {
                const model = getNodeModel(node);
                self.$emit('showMonitorDevice', {...model, id: model.dataId});
              });
            }
          });
        }

        // 组装 graph 结构，并计算宽高
        assembleGraphData();
        calculateGraphSize();

        G6.registerNode('card-node', {
          draw(cfg, group) {
            const {deviceImg, onlineIcon, alarmImg, alarmColor} = getDeviceClass(cfg);
            return group.addShape('dom', {
              attrs: {
                width: 190,
                height: 56,
                html: `
                  <div class="device-node-container" id="${cfg.id}"
                   style="
                     background: ${getDeviceBgColor(cfg)};
                     border-color: ${getDeviceBorderColor(cfg)};">
                    <img class="device-type-img" src="${deviceImg}" />
                    <div class="device-node-info-container">
                      <div id="deviceName-${cfg.id}" class="device-name limited-text ${alarmColor}">${cfg.name || commonString.unknown}</div>
                      <div class="device-icon-container">
                          <i id="deviceOnlineIcon-${cfg.id}" class="iconfont device-online-icon ${onlineIcon}"></i>
                          <img id="deviceAlarmImg-${cfg.id}" class="device-alarm-img" src="${alarmImg}" />
                        </div>
                      <div id="deviceDetail-${cfg.id}" class="device-detail ${alarmColor}">${cfg.subtitle}</div>
                    </div>
                  </div>
                `
              }
            });
          },
          update: function update(cfg, item) {
            const {onlineIcon, alarmImg, alarmColor} = getDeviceClass(cfg);
            const container = document.getElementById(`${cfg.id}`);
            const name = document.getElementById(`deviceName-${cfg.id}`);
            const detail = document.getElementById(`deviceDetail-${cfg.id}`);
            const online = document.getElementById(`deviceOnlineIcon-${cfg.id}`);
            const alarm = document.getElementById(`deviceAlarmImg-${cfg.id}`);
            if (container) {
              container.style.setProperty('background', getDeviceBgColor(cfg));
              container.style.setProperty('border-color', getDeviceBorderColor(cfg));
            }
            name && name.setAttribute('class', `device-name limited-text ${alarmColor}`);
            detail && detail.setAttribute('class', `device-detail ${alarmColor}`);
            online && online.setAttribute('class', `iconfont device-online-icon ${onlineIcon}`);
            alarm && alarm.setAttribute('src', alarmImg);
          },
          getAnchorPoints: function getAnchorPoints() {
            return [[0, 0.5], [1, 0.5]];
          }
        }, 'single-node');

        G6.registerEdge('polyline', {
          draw: (cfg, group) => {
            const startPoint = cfg.startPoint;
            const endPoint = cfg.endPoint;
            const yDiff = endPoint.y - startPoint.y;
            let path = [
              ['M', startPoint.x, startPoint.y],
              ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
              ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
              ['L', endPoint.x, endPoint.y]
            ];
            if (yDiff === 0) {
              path = [
                ['M', startPoint.x, startPoint.y],
                ['L', endPoint.x, endPoint.y]
              ];
            }
            return group.addShape('path', {
              attrs: {
                path,
                stroke: '#E0E0E0',
                lineWidth: 1.0,
                endArrow: true
              },
              name: 'path-shape'
            });
          },
          afterDraw(cfg, group) {
            const shape = group.get('children')[0];
            const startPoint = shape.getPoint(0);
            const point = getPointByEdge(cfg);
            if (!point.show) return;
            const circle = group.addShape('circle', {
              attrs: {
                x: startPoint.x,
                y: startPoint.y,
                fill: point.color,
                r: 3
              },
              name: 'circle-shape'
            });
            circle.animate(
              ratio => {
                const tmpPoint = shape.getPoint(ratio);
                return {
                  x: tmpPoint.x,
                  y: tmpPoint.y
                };
              },
              {
                repeat: true,
                duration: 2500
              },
            );
          }
        });

        try {
          const graph = new G6.Graph({
            container: self.linkGraphContainer,
            width: self.graphSize.width,
            height: self.graphSize.height,
            renderer: 'svg',
            fitView: true,
            layout: {
              type: 'dagre',
              rankdir: 'LR',
              nodesep: 10,
              ranksep: 80
            },
            modes: {
              default: ['canvas']
            },
            defaultNode: {
              type: 'card-node'
            },
            defaultEdge: {
              type: 'polyline'
            },
            nodeStateStyles: {
              hover: {
                'main-rect': {
                  fill: 'rgba(10, 191, 137, 0.05)'
                }
              }
            }
          });
          // graph 上、右、下、左 间距
          graph.fitView([0]);
          graph.data(self.graphData);
          graph.render();

          nodeBindEvent();
          graph.on('afterupdateitem', e => {
            nodeBindEvent();
          });
          self.graph = graph;
        } catch (e) {
          console.log('##### graph err #####', e);
        }
      },
      destroyLinkGraph() {
        $(`#${this.linkGraphContainer}`).empty();
        this.graph = null;
      },
      switchToListMode() {
        this.$emit('switchToListMode');
      }
    }
  };
</script>

<style scoped lang="less">

  .device-link-graph-container {
    overflow: auto;
    text-align: center;
    padding: 20px;

    .view-switch-btn {
      position: absolute;
      top: 0;
      right: 0;
      text-align: center;
      font-size: @sizeMedium;
      padding: @paddingSecond !important;
      border: none !important;
      margin-left: @paddingSecond !important;
    }

    .view-switch-btn:hover {
      background: @colorBlackAlpha05 !important;
      color: @colorPrimary !important;
    }

  }

  .device-node-tooltip-container {
    position: fixed;
    width: 191px;
    background: @colorBlackAlpha8;
    border-radius: @borderRadiusLarge;
    box-shadow: 0 2px 4px 0 @colorBlackAlpha2;
    z-index: 2000;

    .device-node-tooltip-content {
      padding: @paddingMedium;

      .device-node-tooltip-title {
        font-size: @sizeMain;
        font-weight: bold;
        color: @colorWhite;
      }

      .device-node-tooltip-detail {
        font-size: @sizeSecond;
        color: @colorWhite;
      }
    }
  }

</style>
