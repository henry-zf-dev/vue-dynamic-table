<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="roomTitle"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="position-relative">
        <div class="aside-menu-container">
          <RoomStatusHeader :room-info="roomDetail"></RoomStatusHeader>
          <AsideMenuComp
            v-model="asideMenuWidth"
            :menu-data="asideMenuData"
            :current-menu-key="activeAsideMenu"
            @asideMenuClick="asideMenuClick">
          </AsideMenuComp>
        </div>
        <div
          :style="{marginLeft: asideMenuCollapsed ? '0' : `${asideMenuWidth + 8}px`}"
          class="position-relative page-content-with-menu">
          <RoomManagementDetail
            v-if="activeAsideMenu === 'roomInfo'"
            :hide-breadcrumb="true"></RoomManagementDetail>
          <div v-else class="table-container">
            <div v-if="activeAsideMenu === tableIdConfig.monitorRoomDevice">
              <keep-alive>
                <RoomDeviceList
                  v-if="viewMode === 'list'"
                  :room-info="roomDetail"
                  @switchToGraphMode="viewMode = 'graph'"
                  @showMonitorDevice="showMonitorDevice"></RoomDeviceList>
              </keep-alive>
              <keep-alive>
                <RoomDeviceLinkGraph
                  v-if="viewMode === 'graph'"
                  v-model="viewMode"
                  :room-info="roomDetail"
                  @switchToListMode="viewMode = 'list'"
                  @showMonitorDevice="showMonitorDevice"></RoomDeviceLinkGraph>
              </keep-alive>
            </div>
            <keep-alive>
              <AlarmDevice
                v-if="activeAsideMenu === tableIdConfig.alarmDevice"
                :show-table-only="true"
                :room-id="roomId"
                :ignore-column="['房间']"
                :ignore-filter="['roomName', 'location']"
                @tableOptClick="showDeviceAlarmRecord"></AlarmDevice>
            </keep-alive>
            <div v-if="activeAsideMenu === tableIdConfig.alarmRecord">
              <keep-alive>
                <AlarmDeviceRecord
                  v-if="alarmDeviceId"
                  :show-table-only="true"
                  :alarm-device-id="alarmDeviceId"
                  :ignore-column="['房间']"
                  :ignore-filter="['roomName', 'location']"></AlarmDeviceRecord>
              </keep-alive>
              <keep-alive>
                <RoomAlarmRecord
                  v-if="!alarmDeviceId"
                  :show-table-only="true"
                  :room-id="roomId"
                  :ignore-column="['房间']"
                  :ignore-filter="['roomName', 'location']"></RoomAlarmRecord>
              </keep-alive>
            </div>
            <keep-alive>
              <RoomReport
                v-if="activeAsideMenu === tableIdConfig.monitorRoomReport"
                :room-id="roomId"></RoomReport>
            </keep-alive>
            <keep-alive>
              <RoomDeviceLog
                v-if="activeAsideMenu === tableIdConfig.monitorDeviceLog"
                :room-id="roomId"
                :ignore-column="['房间名称']"
                :ignore-filter="['roomName', 'location']"></RoomDeviceLog>
            </keep-alive>
            <keep-alive>
              <RoomLog
                v-if="activeAsideMenu === tableIdConfig.monitorRoomLog"
                :room-id="roomId"
                :ignore-column="['名称']"
                :ignore-filter="['roomName', 'location']"></RoomLog>
            </keep-alive>
            <keep-alive>
              <RoomSelfCheckLog
                v-if="activeAsideMenu === tableIdConfig.monitorSelfCheckLog"
                :room-id="roomId"
                :ignore-column="['房间']"></RoomSelfCheckLog>
            </keep-alive>
            <keep-alive>
              <GlobalAlarmRule
                v-if="activeAsideMenu === tableIdConfig.monitorGlobalAlarmRule"
                :show-table-only="true"></GlobalAlarmRule>
            </keep-alive>
            <keep-alive>
              <RoomAlarmRule
                v-if="activeAsideMenu === tableIdConfig.monitorRoomAlarmRule"
                :show-table-only="true"></RoomAlarmRule>
            </keep-alive>
            <keep-alive>
              <RoomSelfCheckRule
                v-if="activeAsideMenu === tableIdConfig.monitorRoomSelfCheckRule"
                :show-table-only="true"></RoomSelfCheckRule>
            </keep-alive>
            <keep-alive>
              <RoomJointCheckRule
                v-if="activeAsideMenu === tableIdConfig.monitorRoomJointCheckRule"
                :show-table-only="true"></RoomJointCheckRule>
            </keep-alive>
          </div>
          <AsideMenuCollapseIcon v-model="asideMenuCollapsed"></AsideMenuCollapseIcon>
        </div>
      </div>

      <el-dialog :visible.sync="modifyRoomDialog" title="修改房间状态" width="500px">
        <el-form size="medium" label-width="80px">
          <el-form-item prop="faultRemark" label="故障备注">
            <el-input v-model="faultRemark" type="textarea"></el-input>
          </el-form-item>
          <FormOptBtn
            :is-in-dialog="true"
            @formCancel="modifyRoomStatusCancel"
            @formSubmit="modifyRoomStatusSubmit"></FormOptBtn>
        </el-form>
      </el-dialog>
      <el-dialog
        :title="roomOperationReportName"
        :visible.sync="isRoomOperationReport"
        :show-close="false"
        :close-on-press-escape="false"
        width="500px">
        <div>
          <div class="mar-top-10 mar-lft-10 mar-btm-30">
            <span class="mar-rgt-10 font-size-main font-weight-bold">生成时间：</span>
            <el-date-picker
              v-model="operationReportTime"
              :picker-options="pickerOptions"
              :clearable="false"
              class="width-100"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择报告日期">
            </el-date-picker>
          </div>
        </div>
        <FormOptBtn
          :is-in-dialog="true"
          @formCancel="reportCanceled"
          @formSubmit="reportSubmit"></FormOptBtn>
      </el-dialog>
      <DeviceMonitor
        ref="deviceDialogRef"
        v-model="deviceMonitorDialog"
        :device-info="monitorDeviceInfo"
        @closeMonitorDialog="closeMonitorDialog"></DeviceMonitor>
    </div>
  </div>
</template>

<script>
  import {
    checkRespCorrect,
    deepCopyWithJson,
    judgePermission,
    judgeStrEqual,
    messageHandle,
    paramsTrim,
    subControlToken
  } from '../../../utils';
  import {
    batchControl,
    commonConfig,
    momentFormat,
    pageTabConfig,
    tableIdConfig,
    websocketType
  } from '../../../config/common';
  import {permissionConfig} from '../../../config/permission';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import FormOptBtn from '../../../components/FormOptBtn';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import AsideMenuComp from '../../../components/AsideMenuComp';
  import AsideMenuCollapseIcon from '../../../components/AsideMenuCollapseIcon';
  import RoomStatusHeader from './partial/RoomStatusHeader';
  import RoomDeviceList from './partial/RoomDeviceList';
  import RoomDeviceLinkGraph from './partial/RoomDeviceLinkGraph';
  import DeviceMonitor from '../../../components/DeviceMonitor';
  import AlarmDevice from '../../alarm/AlarmDevice';
  import AlarmDeviceRecord from '../../alarm/AlarmDeviceRecord';
  import RoomAlarmRecord from '../../alarm/AlarmRecord';
  import RoomReport from '../devOpsReport/roomReport/RoomReport';
  import RoomDeviceLog from '../systemLog/DeviceLog';
  import RoomLog from '../systemLog/RoomLog';
  import RoomSelfCheckLog from '../systemLog/SelfCheckLog';
  import RoomAlarmRule from './alarmRule/MonitorRoomAlarmRule';
  import GlobalAlarmRule from './alarmRule/MonitorGlobalAlarmRule';
  import RoomSelfCheckRule from './selfCheckRule/MonitorRoomSelfCheckRule';
  import RoomJointCheckRule from './jointCheckRule/MonitorRoomJointCheckRule';
  import RoomManagementDetail from '../../management/area/RoomDetail';
  import {routerMeta} from '../../../router/routerMeta';
  import {mapState} from 'vuex';
  import {getUrlParam, updateRouteParamState} from '../../../modules/urlParamStoreHdl';

  export default {
    name: 'RoomDetail',
    components: {
      FormOptBtn,
      Breadcrumb,
      AsideMenuComp,
      AsideMenuCollapseIcon,
      RoomStatusHeader,
      RoomDeviceList,
      RoomDeviceLinkGraph,
      DeviceMonitor,
      AlarmDevice,
      AlarmDeviceRecord,
      RoomAlarmRecord,
      RoomReport,
      RoomDeviceLog,
      RoomLog,
      RoomSelfCheckLog,
      RoomAlarmRule,
      GlobalAlarmRule,
      RoomSelfCheckRule,
      RoomJointCheckRule,
      RoomManagementDetail
    },
    data() {
      return {
        commonConfig: commonConfig,
        commonString: commonString,
        tableIdConfig: tableIdConfig,

        // 面包屑高度决定 container 的 padding-top
        breadcrumbHeight: 0,

        // 侧边导航相关
        asideMenuData: [
          {
            label: '房间设备',
            icon: 'icon-fangjianjiankong-shebeiguanli',
            value: tableIdConfig.monitorRoomDevice,
            perm: permissionConfig.monitorRoomManage
          },
          {
            label: '正在告警',
            icon: 'icon-fangjianjiankong-yunweibaogao',
            value: tableIdConfig.alarmDevice,
            badge: 0,
            perm: permissionConfig.alarm
          },
          {
            label: '告警记录',
            icon: 'icon-fangjianjiankong-yunweibaogao',
            value: tableIdConfig.alarmRecord,
            perm: permissionConfig.alarm
          },
          {
            label: '日志',
            icon: 'icon-fangjianjiankong-rizhi',
            children: [
              {
                label: '设备日志',
                value: tableIdConfig.monitorDeviceLog,
                perm: permissionConfig.monitorAllSystemLog
              },
              {
                label: '房间日志',
                value: tableIdConfig.monitorRoomLog,
                perm: permissionConfig.monitorAllSystemLog
              }
              // {
              //   label: '自检日志',
              //   value: tableIdConfig.monitorSelfCheckLog,
              //   perm: permissionConfig.monitorAllSystemLog
              // }
            ]
          },
          // {
          //   label: '运维报告',
          //   icon: 'icon-fangjianjiankong-yunweibaogao',
          //   value: tableIdConfig.monitorRoomReport,
          //   perm: permissionConfig.monitorAllDevOpsReport
          // },
          {
            label: '房间规则',
            icon: 'icon-fangjianjiankong-fangjianguize',
            children: [
              {
                label: '全局告警规则',
                value: tableIdConfig.monitorGlobalAlarmRule,
                perm: permissionConfig.monitorRoomAlarm
              },
              {
                label: '房间告警规则',
                value: tableIdConfig.monitorRoomAlarmRule,
                perm: permissionConfig.monitorRoomAlarm
              },
              // {
              //   label: '自检规则',
              //   value: tableIdConfig.monitorRoomSelfCheckRule,
              //   perm: permissionConfig.monitorRoomSelfCheck
              // },
              {
                label: '联检规则',
                value: tableIdConfig.monitorRoomJointCheckRule,
                perm: permissionConfig.monitorRoomJointCheckRule
              }
            ]
          },
          {
            label: '房间信息',
            icon: 'icon-fangjianjiankong-fangjianxinxi',
            value: 'roomInfo',
            perm: permissionConfig.managementAreaManage
          }
        ],
        asideMenuWidth: 250,
        asideMenuCollapsed: false,
        activeAsideMenu: tableIdConfig.monitorRoomDevice,
        // 记录当前查看的当前告警 id
        alarmDeviceId: '',

        pageLoading: true,
        roomId: '',
        roomDetail: {},
        roomScore: 100,
        roomAlarmCount: 0,

        // 更多操作相关
        sceneData: [], // 情景数据源

        modifyRoomDialog: false, // 会议室状态更改对话框 标为故障/标为正常
        faultRemark: '', // 故障备注
        isRoomOperationReport: false, // 是否显示生成房间运营报告dialog
        roomOperationReportName: '', // 房间运营报告dialog 的title
        pickerOptions: {
          disabledDate(time) { // 时间控件只能选择今天之前的日期
            return time.getTime() > Date.now() - 8.64e7;
          }
        },
        operationReportTime: moment().subtract(1, 'days').format(momentFormat.date), // 获取当前时间的前一天
        roomTitle: '',

        // 设备监控相关
        viewMode: 'graph', // 设备显示方式：图表/列表
        deviceMonitorDialog: false, // 显示隐藏设备控制
        monitorDeviceInfo: {} // 当前选中监控设备信息

      };
    },
    computed: {
      ...mapState([
        'roomAlarmMsg', 'roomScoreMsg', 'roomUsageStateMsg',
        'deviceOnlineMsg', 'deviceAlarmMsg', 'routeParamState'
      ]),
      subtitle() {
        const {roomType = '', capacity = 0, locationManagerList = []} = this.roomDetail;
        const admins = [];
        const uniqArr = [];
        locationManagerList.forEach(m => {
          if (uniqArr.includes(m.username)) return;
          uniqArr.push(m.username);
          const {name = '', actualName = '', nickname = '', tel = '', email = ''} = m;
          const main = actualName || nickname || name;
          const extra = tel || email ? `-${tel || email}` : '';
          admins.push(`${main}${extra}`);
        });
        const adminStr = admins.length ? admins.join('/') : commonString.none;
        return {
          show: true,
          text: `类型：${roomType || commonString.unknown}；容量：${capacity}人；管理员：${adminStr}`
        };
      },
      breadcrumbOpts() {
        return [
          {
            type: 'dropdown',
            label: '会议控制',
            icon: 'icon-huiyimoshi-kongzhitai',
            items: this.sceneData.map(scene => {
              return {
                label: scene.name,
                icon: scene.icon,
                command: scene
              };
            }),
            callback: (command) => {
              this.sceneCommand(command);
            }
          },
          // {
          //   type: 'btn',
          //   label: '生成运维报告',
          //   icon: 'icon-fangjianjiankong-yunweibaogao',
          //   command: pageTabConfig.devOpsReport.roomReport,
          //   perm: permissionConfig.monitorRoomCreateDevOpsReport,
          //   callback: () => {
          //     this.dropdownCommand(pageTabConfig.devOpsReport.roomReport);
          //   }
          // },
          {
            type: 'btn',
            label: '跳转至分控',
            icon: 'icon-shangxian',
            perm: permissionConfig.monitorRoomJumpToSubControl,
            callback: () => {
              const {centralControl = {}} = this.roomDetail;
              const {centralControlUrl = ''} = centralControl;
              if (!centralControlUrl) return;
              subControlToken(centralControlUrl, this.roomDetail.id);
            }
          },
          {
            // type: 'dropdown',
            label: '更多操作',
            icon: 'icon-gengduocaozuo',
            items: [
              {
                label: '自检规则',
                icon: 'icon-nav-quanjuzijian',
                perm: permissionConfig.monitorRoomSelfCheck,
                command: pageTabConfig.selfCheckRule.roomSelfCheckRule
              },
              {
                label: '联检规则',
                icon: 'icon-lianjian',
                perm: permissionConfig.monitorRoomJointCheckRule,
                command: pageTabConfig.selfCheckRule.roomJointCheckRule
              },
              {
                label: '告警规则',
                icon: 'icon-tongzhi',
                perm: permissionConfig.monitorRoomAlarm,
                command: pageTabConfig.alarmRule.roomAlarmRule
              }
            ],
            callback: (command) => {
              this.dropdownCommand(command);
            }
          }
        ];
      }
    },
    watch: {
      roomAlarmMsg() {
        const msg = this.$store.state.roomAlarmMsg;
        if (!msg || !judgeStrEqual(msg['roomId'], this.roomId)) return;
        this.updateRoomStatus(websocketType.roomAlarm, msg);
      },
      roomScoreMsg() {
        const msg = this.$store.state.roomScoreMsg;
        if (!msg || !judgeStrEqual(msg['roomId'], this.roomId)) return;
        this.updateRoomStatus(websocketType.roomScore, msg);
      },
      roomUsageStateMsg() {
        const msg = this.$store.state.roomUsageStateMsg;
        if (!msg || !judgeStrEqual(msg['roomId'], this.roomId)) return;
        this.updateRoomStatus(websocketType.roomUsageState, msg);
      },
      roomAlarmCount(val) {
        this.asideMenuData.forEach(menu => {
          if (menu.value === tableIdConfig.alarmDevice) {
            menu.badge = val || 0;
          }
        });
      }
    },
    mounted() {
      this.roomId = this.$route.params.rid;
      this.initAsideMenu();
      this.getRoomDetail();
      this.getSceneList();
    },
    methods: {
      judgePerm: judgePermission,
      initAsideMenu() {
        updateRouteParamState(this.$route.name, {menu: getUrlParam('menu')});
        const {menu} = this.routeParamState[this.$route.name] || {};
        this.activeAsideMenu = menu || tableIdConfig.monitorRoomDevice;
      },
      asideMenuClick(menu) {
        this.activeAsideMenu = menu;
        // tab 切换后清空 tableState
        updateRouteParamState(this.$route.name, {menu: menu, pageNo: '', pageSize: '', sort: ''});

        // 如果不是切换到告警记录 tab，则清空当前设备告警 id
        if (menu !== tableIdConfig.alarmRecord) {
          this.alarmDeviceId = '';
        }
      },
      // 当前告警查看详情时，将 asideMenu 切换到 alarmRecord 并传入参数
      showDeviceAlarmRecord(id) {
        this.alarmDeviceId = id;
        this.asideMenuClick(tableIdConfig.alarmRecord);
      },

      // 有会议室告警、分数、使用状态、设备告警、在线/离线 推送后更新相关页面
      updateRoomStatus(type, msg) {
        if (!msg) return;
        switch (type) {
          case websocketType.roomAlarm:
            if (msg.hasOwnProperty('deviceAlarmCount')) {
              this.roomAlarmCount = msg.deviceAlarmCount || 0;
            }
            break;
          case websocketType.roomScore:
            if (msg.hasOwnProperty('score')) {
              this.roomScore = msg.score || 0;
            }
            break;
          case websocketType.roomUsageState:
            const roomDetail = this.roomDetail;
            // 有人无人、情景ID、自动共享、开关系统状态
            const {occupied, curGroupCmd, autoSharing, systemOn} = msg;
            // 循环原始房间状态数组，根据ws推送过来的数据进行修改
            (roomDetail.roomStatusDto || []).forEach(status => {
              if (msg.hasOwnProperty('systemOn') && status.en === 'systemOn') {
                status.v = (systemOn === 'on' ? '开启系统' : '关闭系统');
                status.show = msg.show;
              }
              // if (msg.hasOwnProperty('curGroupCmd') && status.en === 'curGroupCmd') {
              //   status.v = curGroupCmd;
              //   status.show = msg.show;
              // }
              if (msg.hasOwnProperty('autoSharing') && status.en === 'autoSharing') {
                status.v = (autoSharing === 'on' ? '共享开启' : '共享关闭');
                status.show = msg.show;
              }
              if (msg.hasOwnProperty('occupied') && status.en === 'occupied') {
                status.v = (occupied === 'true' ? '有人' : '无人');
                status.show = msg.show;
              }
            });
            if (roomDetail.roomStatusDto.length <= 0) {
              roomDetail.roomStatusContent = '';
            } else {
              roomDetail.roomStatusContent = item.roomStatusDto.map(item => {
                if (!item.show) return '';
                return item.v;
              }).filter(value => value).join('、');
            }
            this.roomDetail = {
              ...this.roomDetail,
              ...roomDetail
            };
            break;
          default:
            break;
        }
      },
      // 根据ID查询房间详情
      getRoomDetail() {
        this.pageLoading = true;
        API.area.roomDetail({id: this.roomId}).then(resp => {
          this.pageLoading = false;

          function roomStatusHandle(data = []) {
            if (data.length <= 0) return;
            return data.map(item => {
              if (!item.show) return '';
              return item.v;
            }).filter(value => value).join('、');
          }

          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            this.roomTitle = data.roomLocationName ? data.roomLocationName + '-' + (data.name || '') : data.name || '';
            this.roomDetail = {
              ...data,
              roomStatusDto: [
                {en: 'systemOn', show: false, v: ''},
                {en: 'curGroupCmd', show: false, v: ''},
                {en: 'autoSharing', show: false, v: ''},
                {en: 'occupied', show: false, v: ''}],
              roomStatusContent: roomStatusHandle(data.statusDto || [])
            };
            this.roomScore = data.score || 0;
            this.roomAlarmCount = data['deviceAlarmCount'] || 0;
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.pageLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 运维报告相关
      reportSubmit() {
        const params = {
          roomId: this.roomId,
          generationTime: this.operationReportTime
        };
        API.devOpsReport.roomReportAdd(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.reportCanceled();
            messageHandle({code: msgCode.ADD_SAVE, msg: '房间运维报告生成成功'});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      reportCanceled() {
        this.isRoomOperationReport = false;
      },
      // 情景相关
      getSceneList() { // 根据房间ID获取情景
        API.room.roomSceneAll({roomId: this.roomId}).then(resp => {
          if (checkRespCorrect(resp)) {
            this.sceneData = resp.data || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      sceneCommand(scene = {}) {
        // return;
        // eslint-disable-next-line no-unreachable
        this.$confirm(`确定要执行情景：${scene.name}`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const param = {
            deviceId: scene.centralControlId || '',
            roomId: scene.roomId || '',
            method: batchControl.scene.method || '',
            params: {
              profileNum: scene.sceneId || '',
              generalRoomId: scene.roomId || ''
            }
          };
          API.room.roomTriggerScene(param).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.HAS_SAVE, msg: '情景触发成功'});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgContent.SYSTEM});
          });
        }).catch(err => {
        });
      },
      // 更多操作处理
      dropdownCommand(command) {
        switch (command) {
          case pageTabConfig.devOpsReport.roomReport:
            this.isRoomOperationReport = true;
            this.roomOperationReportName = `生成 ${this.roomDetail.name} 运维报告`;
            break;
          case pageTabConfig.selfCheckRule.roomSelfCheckRule:
            this.$router.push({
              name: routerMeta.monitorRoomSelfCheck.name,
              params: this.$route.params
            });
            break;
          case pageTabConfig.alarmRule.roomAlarmRule:
            this.$router.push({
              name: routerMeta.monitorRoomAlarm.name,
              params: this.$route.params
            });
            break;
          case pageTabConfig.selfCheckRule.roomJointCheckRule:
            this.$router.push({
              name: routerMeta.monitorRoomJointCheckRule.name,
              params: this.$route.params
            });
            break;
          default:
            break;
        }
      },
      // 修改房间状态相关
      modifyRoomStatus() {
        // 改为故障需要填备注，改为正常不需要，直接调用接口
        if (this.roomDetail.roomStatus === commonString.availableStatus.breakdown.value) {
          this.modifyRoomStatusSubmit(commonString.availableStatus.online.value);
        } else {
          this.modifyRoomDialog = true;
        }
      },
      modifyRoomStatusCancel() {
        this.modifyRoomDialog = false;
      },
      modifyRoomStatusSubmit(status = '') {
        const parMar = {
          id: this.roomId,
          status: status || commonString.availableStatus.breakdown.value,
          remark: this.faultRemark
        };
        paramsTrim(parMar);
        API.room.roomModifyStatus(parMar).then(resp => {
          if (checkRespCorrect(resp)) {
            this.modifyRoomDialog = false;
            this.getRoomDetail();
            messageHandle({code: msgCode.HAS_SAVE, msg: '房间状态修改成功'});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },

      // 设备监控相关
      showMonitorDevice(row) {
        this.deviceMonitorDialog = true;
        this.monitorDeviceInfo = deepCopyWithJson(row);
        updateRouteParamState(this.$route.name, {device: row.id});
      },
      closeMonitorDialog() {
        this.deviceMonitorDialog = false;
        updateRouteParamState(this.$route.name, {device: ''});
      }
    }
  };
</script>

<style scoped lang="less">

  .room-status-container {
    min-width: 300px;

    .room-status-content {
      background-color: @colorWhite;
      border-radius: @borderRadiusMain;
      height: 100px;
      border-right: @borderRadiusSecond;
      box-shadow: 0 2px 4px 0 @colorBlackAlpha05;
      position: relative;

      img {
        object-fit: cover;
      }

      .room-status-text-container {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 0 24px;

        .room-status-title {
          padding-top: 20px;
          padding-bottom: 20px;
          color: @colorGray10;
        }

        .room-status-subtitle {
          color: @colorGray40;
          font-weight: normal;
          max-width: 300px;
        }

        .room-status-tooltip {
          float: left;
          margin-left: @paddingSecond;
          color: @colorGray70;
          cursor: pointer;
          font-size: @sizeRegular;
        }

        .alarm-refresh-btn {
          float: left;
          padding: 5px 15px;
          margin-left: @paddingSecond;
          border-radius: 12px !important;
          color: @colorGray40 !important;
        }

        .alarm-refresh-btn:hover {
          color: @colorPrimary !important;
        }
      }

      .room-status-bg {
        position: absolute;
        top: 0;
        height: 100%;
        background-repeat: no-repeat;
      }

      .bg-score-lft {
        width: 47px;
      }

      .bg-score-rgt {
        width: 107px;
      }

      .bg-use-lft {
        width: 80px;
      }

      .bg-use-rgt {
        width: 120px;
      }

      .bg-alarm-lft {
        width: 61px;
      }

      .bg-alarm-rgt {
        width: 155px;
      }

    }
  }

</style>
