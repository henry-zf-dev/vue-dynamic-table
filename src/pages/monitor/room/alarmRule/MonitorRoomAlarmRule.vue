<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-if="!showTableOnly"
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="roomName"></Breadcrumb>
    <div :class="{'page-container': !showTableOnly}">
      <div :class="{'table-container': !showTableOnly}">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="roomAlarmData"
          @filterChange="getRoomAlarmList"
          @pageChanged="getRoomAlarmList"
          @sizeChanged="getRoomAlarmList"
          @sortChanged="getRoomAlarmList">
          <div slot="empty">
            <EmptyContent :opt-data="alarmEmptyBtn"></EmptyContent>
          </div>
          <div v-if="showTableOnly" slot="customOpts">
            <el-tooltip :open-delay="300" content="新增房间告警规则" placement="top">
              <el-button
                class="iconfont icon-tianjia table-filter-opt-btn table-filter-opt-text-btn"
                @click="roomAlarmAdd">&nbsp;添加规则
              </el-button>
            </el-tooltip>
          </div>
        </EZTable>
      </div>
    </div>
    <el-dialog
      v-if="showSelectRoomDialog"
      :visible.sync="showSelectRoomDialog"
      class="rule-template-apply-dialog"
      title="应用至房间"
      width="1100px"
      top="60px">
      <SelectRoom
        @applyClick="applyToRoom"
        @cancelClick="cancelApply"></SelectRoom>
    </el-dialog>
  </div>
</template>

<script>
  import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
  import {tableIdConfig, tableOptBtnConfig} from '../../../../config/common';
  import {
    assembleTableOptBtn,
    checkRespCorrect, getRoomByIdDetail, getTableCfgFromStorage, getTableConfig,
    getTableState,
    judgePermission,
    messageHandle, momentTimeToString, updatePageNo,
    updateTableState
  } from '../../../../utils';
  import {commonString, msgCode, msgContent} from '../../../../config/string';
  import EZTable from '../../../../components/table/EZTable';
  import EmptyContent from '../../../../components/EmptyContent';
  import {routerMeta} from '../../../../router/routerMeta';
  import {permissionConfig} from '../../../../config/permission';
  import SelectRoom from '../../../../components/SelectRoom';

  export default {
    name: 'MonitorRoomAlarmRule',
    components: {
      Breadcrumb, EZTable, EmptyContent, SelectRoom
    },
    props: {
      // 是否只显示 table
      showTableOnly: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        breadcrumbHeight: 0,
        showSelectRoomDialog: false,
        tableId: tableIdConfig.monitorRoomAlarmRule,
        columnConfig: [],
        filters: [],
        tableLoading: true,
        roomAlarmData: [],
        roomId: '',
        roomName: '',
        roomAlarmForm: {},
        alarmEmptyBtn: [
          {
            type: 'btn',
            label: '添加告警',
            icon: 'icon-tianjia',
            perm: permissionConfig.monitorRoomAlarmManage,
            callback: () => {
              this.roomAlarmAdd();
            }
          }
        ]
      };
    },
    computed: {
      breadcrumbOpts() {
        return [
          {
            type: 'btn',
            label: '新增告警',
            icon: 'icon-tianjia',
            perm: permissionConfig.monitorRoomAlarmManage,
            callback: () => {
              this.roomAlarmAdd();
            }
          }
        ];
      }
    },
    activated() {
      this.initData();
    },
    methods: {
      judgePerm: judgePermission,
      initData() {
        this.roomId = this.$route.params.rid || '';
        getRoomByIdDetail(this.roomId).then(item => {
          this.roomName = item || '';
        });
        this.initTableConfig();
        this.getRoomAlarmList();
      },
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.roomAlarmDetail(data);
                break;
              case tableOptBtnConfig.edit.type:
                this.roomAlarmEdit(data);
                break;
              case tableOptBtnConfig.enable.type:
                this.modifyEnableStatus(data, commonString.configEnable.enable);
                break;
              case tableOptBtnConfig.forbidden.type:
                this.modifyEnableStatus(data, commonString.configEnable.forbidden);
                break;
              case tableOptBtnConfig.delete.type:
                this.roomAlarmDelete(data);
                break;
              case tableOptBtnConfig.applyToRoom.type:
                this.roomAlarmForm = data;
                this.showSelectRoomDialog = true;
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
      getRoomAlarmList() { // 查询房间告警规则列表
        const {pageNo = 1, pageSize = 10, filters = [], sort = []} = getTableState(this.tableId);
        const parMar = {
          pageNo, pageSize, filters, sort,
          roomId: this.roomId
        };
        this.tableLoading = true;
        API.alarmRule.roomAlarmRuleListByRoomId(parMar).then(resp => {
          this.tableLoading = false;

          function getAlarmText(item) {
            // const device = __.pluck((item.ruleList || []), 'name').join('、');
            // const ruleNum = item.ruleList.length;
            // const trigger = (item.triggerConditions === 'and' ? '全部异常' : '任意一项异常');
            const {detection = {}} = item;
            const interval = item.silenceCycle || commonString.unknown;
            const notification = (item.notificationWay || []).map(item => {
              return item === 'sms' ? '短信' : (item === 'email' ? '邮件' : 'TT');
            }).join('+');
            return `<span><span> ${detection.deviceName || ''} ${detection.stateName || ''} ${detection.operatorsName || ''} ${detection.expectedValueName || ''}，
                  </span><span class="font-color-success">${item.duration <= 0 ? '只要有异常' : `持续异常${item.duration || ''}分钟`}</span>则触发告警，每<span class="font-color-success">${interval}分钟${notification}</span>通知一次</span>`;
          }

          if (checkRespCorrect(resp)) {
            const {items, pageInfo = {}} = resp.data || {};
            this.roomAlarmData = (items || []).map(item => {
              return {
                ...item,
                updatedTime: momentTimeToString(item.updatedTime),
                alarmText: getAlarmText(item),
                isEnableContent: item.isEnable === 'Y' ? '启用' : '禁用'
                // isBtnArr: !item.roomId && ([tableOptBtnConfig.detail.type, tableOptBtnConfig.edit.type, tableOptBtnConfig.delete.type]) || []
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      roomAlarmDelete(row) { // 房间告警删除
        this.$confirm(`确定要删除告警规则：${row.name}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.alarmRule.roomAlarmRuleDeleteById({id: row.id, roomId: row.roomId}).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.DEL_SAVE, msg: '房间告警规则删除成功'});
              updatePageNo(this.tableId);
              this.getRoomAlarmList();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      },
      roomAlarmAdd() { // 房间告警新增
        this.$router.push({
          name: routerMeta.monitorRoomAlarmAdd.name,
          params: {
            rid: this.roomId
          }
        });
      },
      roomAlarmDetail(row) { // 房间告警详情
        this.$router.push({
          name: routerMeta.monitorRoomAlarmDetail.name,
          params: {
            aid: row.id,
            rid: this.roomId
          }
        });
      },
      roomAlarmEdit(row) { // 编辑
        this.$router.push({
          name: routerMeta.monitorRoomAlarmEdit.name,
          params: {
            aid: row.id,
            rid: this.roomId
          }
        });
      },
      // 应用至房间
      applyToRoom(data) {
        this.$confirm(`若选中的${data.length}个房间下存在同名告警则原告警将被覆盖，若不存在则复制！`, '应用至房间', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            roomIdList: __.pluck(data || [], 'id'),
            id: this.roomAlarmForm.id
          };
          API.alarmRule.roomAlarmRuleCopy(params).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.EDIT_SAVE, msg: '告警规则应用至房间成功'});
              this.cancelApply();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      },
      // 取消应用至房间
      cancelApply() {
        this.showSelectRoomDialog = false;
      },
      // 修改启用/禁用状态
      modifyEnableStatus(row, enableConfig = {}) {
        this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            isEnable: enableConfig.value,
            id: row.id
          };
          API.alarmRule.alarmRuleEnable(params).then(resp => {
            if (checkRespCorrect(resp)) {
              this.getRoomAlarmList();
              messageHandle({code: msgCode.EDIT_SAVE, msg: '房间告警规则' + enableConfig.label + '成功'});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      }
    }
  };
</script>

<style scoped>

</style>
