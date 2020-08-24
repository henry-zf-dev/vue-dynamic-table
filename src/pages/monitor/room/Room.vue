<template>
  <div style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div class="page-container">
      <div class="position-relative">
        <div class="aside-menu-container">
          <AreaTreeComp
            v-model="areaTreeWidth"
            :show-more-opt="false"
            @currentNodeChange="currentAreaChange">
          </AreaTreeComp>
        </div>
        <div
          :style="{marginLeft: areaTreeCollapsed ? '0' : `${areaTreeWidth + 8}px`}"
          class="position-relative page-content-with-menu">
          <div class="table-container">
            <div v-if="selectData.length > 0" class="mar-btm-10">
              <span class="room-select-text">已选择 <span
                class="font-color-primary ">{{ selectData.length }}</span> 条</span>
              <el-button
                class="room-opt-btn room-opt-btn-open mar-lft-20"
                type="primary"
                size="small"
                @click="openSystem">开启系统
              </el-button>
              <el-button class="room-opt-btn room-opt-btn-close" type="info" size="small" @click="closeSystem">关闭系统
              </el-button>
              <el-button class="room-opt-btn room-opt-btn-cancel" type="info" size="small" @click="selectCanceled">取消
              </el-button>
            </div>
            <EZTable
              v-loading="tableLoading"
              :table-id="tableId"
              :filters="filters"
              :columns="columnConfig"
              :rows="roomData"
              :selection-data="selectData"
              :selection="true"
              @filterChange="getRoomTableData"
              @pageChanged="getRoomTableData"
              @sizeChanged="getRoomTableData"
              @sortChanged="getRoomTableData"
              @selectionChanged="selectionChanged"
              @listClickJump="listClickJump"
            ></EZTable>
          </div>
          <AsideMenuCollapseIcon v-model="areaTreeCollapsed"></AsideMenuCollapseIcon>
        </div>
      </div>

      <el-dialog v-loading="switchSystemLoading" :visible.sync="showOpenSysDialog" title="开启选中的房间系统？" width="500px">
        <span>将为您开启所选房间系统，已经开启的房间不受影响。</span>
        <div class="text-align-right mar-top-40">
          <el-button type="info" @click="clickError">取消</el-button>
          <el-button type="primary" @click="operationSystem('on')">确定</el-button>
        </div>
      </el-dialog>
      <el-dialog v-loading="switchSystemLoading" :visible.sync="showCloseSysDialog" title="关闭系统？" width="500px">
        <span>请确认房间已无人使用</span>
        <div class="text-align-right mar-top-40">
          <el-button type="info" @click="clickError">取消</el-button>
          <el-button type="primary" @click="operationSystem('off')">确定</el-button>
        </div>
      </el-dialog>
    </div>
    <div v-if="showBatchControlDrawer">
      <el-drawer
        :visible.sync="showBatchControlDrawer"
        title="批量控制结果"
        direction="rtl"
        size="20%">
        <div class="mar-lft-20">
          <div class="header3">总共{{ batchControlResult.count||0 }}间</div>
          <div class="header6 mar-top mar-btm">下发成功：
            <span class="font-color-success">{{ batchControlResult.success||0 }}间</span>
          </div>
          <div class="header6 mar-top mar-btm">下发失败：
            <span class="font-color-danger">{{ batchControlResult.fail||0 }}间</span>
          </div>
          <el-divider></el-divider>
          <div v-for="(err,index) in (batchControlResult.errorDataList||[])" :key="index">
            <div class="header6 mar-top font-color-danger pad-btm-5">{{ err.errorType||'' }}
              ({{ err.errorEntityList.length||0 }})
              ：
            </div>
            <div v-for="(code,index) in (err.errorEntityList||[])" :key="index">
              <div><span class="header6">{{ code.roomName||'' }}</span> - <span
                class="font-size-14">{{ code.errorMsg||'' }}</span></div>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
  import {
    websocketType,
    tableIdConfig, tableOptBtnConfig, batchControl
  } from '../../../config/common';
  import {
    checkRespCorrect,
    messageHandle,
    judgePermission,
    getTableState,
    updateTableState,
    getGeneralStatus,
    assembleTableOptBtn,
    getTableConfig, judgeStrEqual, deepCopyWithJson, getTableCfgFromStorage
  } from '../../../utils';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import {routerMeta} from '../../../router/routerMeta';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import RoomTypeSelect from '../../../components/RoomTypeSelect';
  import AreaTreeComp from '../../../components/AreaTreeComp';
  import AsideMenuCollapseIcon from '../../../components/AsideMenuCollapseIcon';
  import EZTable from '../../../components/table/EZTable';
  import {mapState} from 'vuex';
  import {updateRouteParamState} from '../../../modules/urlParamStoreHdl';

  export default {
    name: 'Room',
    components: {
      Breadcrumb, AreaTreeComp, AsideMenuCollapseIcon, RoomTypeSelect, EZTable
    },
    data() {
      return {
        commonString: commonString,
        showBatchControlDrawer: false,
        // ========== 区域相关 ==========//
        areaTreeWidth: 250, // 初始值为默认最小宽度
        areaTreeCollapsed: false,
        currentAreaId: 0, // 标志当前进行操作的区域 id

        // ========== 房间相关 ==========//
        tableLoading: true, // 房间加载圈
        tableId: tableIdConfig.monitorRoom,
        filters: [],
        columnConfig: [],
        roomData: [], // 房间数据源
        alarmStatusData: [
          {
            'id': 1,
            'name': '正常',
            'value': 1
          },
          {
            'id': 2,
            'name': '告警',
            'value': 2
          },
          {
            'id': 3,
            'name': '故障',
            'value': 3
          }
        ],
        selectData: [],
        showOpenSysDialog: false,
        showCloseSysDialog: false,
        switchSystemLoading: false,
        batchControlResult: {}
      };
    },
    computed: {
      ...mapState(['roomAlarmMsg', 'roomUsageStateMsg'])
    },
    watch: {
      roomAlarmMsg() {
        const msg = this.$store.state.roomAlarmMsg || {};
        this.updateRoomStatus(websocketType.roomAlarm, msg);
      },
      roomUsageStateMsg() {
        const msg = this.$store.state.roomUsageStateMsg || {};
        this.updateRoomStatus(websocketType.roomUsageState, msg);
      }
    },
    activated() {
      this.initTableConfig();
      this.getRoomTableData();
    },
    methods: {
      judgePerm: judgePermission,
      // ========== 区域相关 ==========//
      currentAreaChange(val, clear = false) {
        if (this.currentAreaId !== val) {
          this.currentAreaId = val;
          this.getRoomTableData(clear);
        }
      },

      // ========== 房间相关 ==========//
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.roomDetail(data);
                break;
              default:
                break;
            }
          });
        };
        assembleConfig(getTableCfgFromStorage(this.tableId));
        getTableConfig(this.tableId).then((config) => {
          assembleConfig(config);
        }).catch(err => {
        });
      },
      selectionChanged(selection) {
        this.selectData = selection;
      },
      roomDetail(room = {}, type = tableIdConfig.monitorRoomDevice) {
        updateRouteParamState(routerMeta.monitorRoomDetail.name, {menu: type});
        this.$router.push({
          name: routerMeta.monitorRoomDetail.name,
          params: {rid: room.id}
        });
      },
      // 列表点击跳转集合
      listClickJump(type, data) {
        switch (type) {
          case 'roomStatusIcon':
          case 'roomStatusText':
            this.roomDetail(data, tableIdConfig.alarmDevice);
            break;
          default:
            break;
        }
      },
      // 获取房间基础状态信息
      // 查询会议室列表
      getRoomTableData(clearTable = false) {
        if (clearTable) {
          // 清空 tableState 和 routeParamState 中的 pageNo 参数
          updateTableState(this.tableId, {pageNo: 1});
          updateRouteParamState(this.$route.name, {pageNo: ''});
        }
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters = [], sort} = getTableState(this.tableId);
        const pageParam = {
          pageNo, pageSize, filters, sort,
          req: {}
        };
        pageParam.req['locationId'] = this.currentAreaId || 0;
        API.room.roomList(pageParam).then(resp => {
          this.tableLoading = false;

          function roomStatusHandle(data = []) {
            if (data.length <= 0) return;
            return data.map(item => {
              if (!item.show) return '';
              return item.v;
            }).filter(value => value).join('、');
          }

          if (checkRespCorrect(resp)) {
            const {items = [], pageInfo = {}} = resp.data || {};
            const connValues = Object.values(commonString.monitorStatus);

            this.roomData = items.map(room => {
              const {alarmStatus, statusDto = [], serverExt = {}} = room;
              const roomStatus = connValues.find(c => {
                return c.value === alarmStatus;
              }) || {};

              return {
                ...room,
                ...serverExt,
                capacity: `容纳${room.capacity}人`,
                roomStatusText: roomStatus.label,
                roomStatusType: roomStatus.type,
                roomStatusIcon: roomStatus.icon,
                roomStatusImg: room.roomStatus === commonString.availableStatus.breakdown.value
                  ? commonString.generalStatusImg.breakdown : '',
                roomStatusDto: [
                  {en: 'systemOn', show: false, v: ''},
                  {en: 'curGroupCmd', show: false, v: ''},
                  {en: 'autoSharing', show: false, v: ''},
                  {en: 'occupied', show: false, v: ''}],
                roomStatusContent: roomStatusHandle(statusDto)
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 有会议室告警、分数、设备告警、在线/离线 推送后更新相关页面
      updateRoomStatus(type, msg) {
        if (!msg) return;
        const roomData = deepCopyWithJson(this.roomData);
        switch (type) {
          case websocketType.roomAlarm:
            (roomData || []).forEach(r => {
              if (judgeStrEqual(msg.roomId, r.id)) {
                r.alarmStatus = msg.alarmStatus;
                const roomStatus = getGeneralStatus(r);
                r.roomStatusText = roomStatus.label;
                r.roomStatusType = roomStatus.type;
                r.roomStatusIcon = roomStatus.icon || '';
              }
            });
            this.roomData = roomData;
            break;
          case websocketType.roomUsageState:
            (roomData || []).forEach(item => {
              if (judgeStrEqual(msg.roomId, item.id)) {
                // 有人无人、情景ID、自动共享、开关系统状态
                const {occupied, curGroupCmd, autoSharing, systemOn} = msg;
                // 循环原始房间状态数组，根据ws推送过来的数据进行修改
                (item.roomStatusDto || []).forEach(status => {
                  if (msg.hasOwnProperty('systemOn') && status.en === 'systemOn') {
                    status.v = (systemOn === 'on' ? '开启系统' : '关闭系统');
                    status.show = msg.show;
                  }
                  if (msg.hasOwnProperty('curGroupCmd') && status.en === 'curGroupCmd') {
                    status.v = curGroupCmd;
                    status.show = msg.show;
                  }
                  if (msg.hasOwnProperty('autoSharing') && status.en === 'autoSharing') {
                    status.v = (autoSharing === 'on' ? '共享开启' : '共享关闭');
                    status.show = msg.show;
                  }
                  if (msg.hasOwnProperty('occupied') && status.en === 'occupied') {
                    status.v = (occupied === 'true' ? '有人' : '无人');
                    status.show = msg.show;
                  }
                });
                if (item.roomStatusDto.length <= 0) {
                  item.roomStatusContent = '';
                } else {
                  item.roomStatusContent = item.roomStatusDto.map(item => {
                    if (!item.show) return '';
                    return item.v;
                  }).filter(value => value).join('、');
                }
              }
            });
            this.roomData = roomData;
            break;
          default:
            break;
        }
      },
      // 批量操作相关
      openSystem() {
        this.showOpenSysDialog = true;
      },
      closeSystem() {
        this.showCloseSysDialog = true;
      },
      operationSystem(power) {
        const params = (this.selectData || []).map(item => {
          return {
            deviceId: item.gatewayId || '',
            roomId: item.id,
            method: batchControl.scene.method || '',
            params: {
              profileNum: power === 'on' ? '10001' : '10002', // todo 目前前端先写死开启和关闭系统的ID
              generalRoomId: item.id || ''
            }
          };
        });
        this.switchSystemLoading = true;
        const mess = power === 'on' ? '开启' : '关闭';
        API.room.roomBatchControl(params).then(resp => {
          this.switchSystemLoading = false;
          if (checkRespCorrect(resp)) {
            this.showBatchControlDrawer = true;
            this.batchControlResult = {
              ...resp.data
            };
            // messageHandle({code: msgCode.EDIT_SAVE, msg: mess + '系统成功'});
            this.clickError();
            this.getRoomTableData();
          } else {
            this.clickError();
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          this.switchSystemLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      selectCanceled() {
        this.selectData = [];
      },
      clickError() {
        this.showOpenSysDialog = false;
        this.showCloseSysDialog = false;
      }
    }
  };
</script>

<style lang="less">

  .room-select-text {
    font-size: 16px;
    font-weight: bold;
    color: @colorGray20;
    letter-spacing: 0;
    line-height: 16px;
  }

  .open-sys-dialog-span {
    font-size: 20px;
    color: @colorGray40;
    letter-spacing: 0;
    line-height: 30px;
  }

  .open-sys-btn {
    border-radius: 12px;
    height: 48px;
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    line-height: 20px;
  }

  label {
    margin-bottom: 0 !important;
  }

</style>
