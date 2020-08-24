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
          :rows="jointCheckRuleData"
          @filterChange="getRoomJointCheckRule"
          @pageChanged="getRoomJointCheckRule"
          @sizeChanged="getRoomJointCheckRule"
          @sortChanged="getRoomJointCheckRule">
          <div slot="empty">
            <EmptyContent :opt-data="jointCheckRuleEmptyBtn"></EmptyContent>
          </div>
          <div v-if="showTableOnly" slot="customOpts">
            <el-tooltip :open-delay="300" content="新增房间联检规则" placement="top">
              <el-button
                class="iconfont icon-tianjia table-filter-opt-btn table-filter-opt-text-btn"
                @click="JointCheckRuleAdd">&nbsp;添加规则
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
import { permissionConfig } from '../../../../config/permission';
import { momentFormat, tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import EmptyContent from '../../../../components/EmptyContent';
import EZTable from '../../../../components/table/EZTable';
import {
  assembleTableOptBtn,
  checkRespCorrect, getRoomByIdDetail, getTableCfgFromStorage, getTableConfig,
  getTableState,
  judgePermission,
  messageHandle, momentTimeToString, updatePageNo,
  updateTableState
} from '../../../../utils';
import { routerMeta } from '../../../../router/routerMeta';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import SelectRoom from '../../../../components/SelectRoom';

export default {
  name: 'MonitorRoomJointCheckRule',
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
      permConfig: permissionConfig,
      tableId: tableIdConfig.monitorRoomJointCheckRule,
      breadcrumbHeight: 0,
      showSelectRoomDialog: false,
      columnConfig: [],
      filters: [],
      jointCheckRuleData: [],
      tableLoading: true,
      roomId: '',
      roomName: '',
      jointForm: {},
      jointCheckRuleEmptyBtn: [
        {
          type: 'btn',
          label: '添加联检',
          icon: 'icon-tianjia',
          perm: permissionConfig.monitorRoomJointCheckRuleManage,
          callback: () => {
            this.JointCheckRuleAdd();
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
          label: '新增联检',
          icon: 'icon-tianjia',
          perm: permissionConfig.monitorRoomJointCheckRuleManage,
          callback: () => {
            this.JointCheckRuleAdd();
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
      this.getRoomJointCheckRule();
    },
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.jointCheckRuleDetail(data);
              break;
            case tableOptBtnConfig.edit.type:
              this.jointCheckRuleEdit(data);
              break;
            case tableOptBtnConfig.enable.type:
              this.jointCheckRuleEnables(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.jointCheckRuleEnables(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.delete.type:
              this.jointCheckRuleDeletes(data);
              break;
            case tableOptBtnConfig.implementJoint.type:
              this.jointCheckRuleImplement(data);
              break;
            case tableOptBtnConfig.applyToRoom.type:
              this.jointForm = data;
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
    getRoomJointCheckRule() { // 房间联检列表
      const { pageNo = 1, pageSize = 10, filters = [], sort = [] } = getTableState(this.tableId);
      const parMar = {
        pageNo, pageSize, filters, sort,
        roomId: this.roomId
      };
      this.tableLoading = true;
      API.jointCheckRule.roomJointCheckRuleListByRoomId(parMar).then(resp => {
        this.tableLoading = false;
        function getOperatorsText(rules) {
          if (!rules) return '';
          let html = '';
          (rules || []).forEach(item => {
            html += `<span>${item.deviceName || ''}</span><span>${item.stateName || ''}</span><span class="font-color-success">${item.operatorsName || ''}${item.expectedValueName || ''} </span>`;
          });
          return html + ` 等<span  class="font-color-success">${rules.length}项</span>`;
        }
        function getScene(delay) {
          return `<span>延迟</span><span class="font-color-success">${delay}s</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.jointCheckRuleData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              sceneHtml: getScene(item.delay),
              timeoutContent: Math.floor(item.timeout / 60) + '分钟' + (item.timeout - Math.floor(item.timeout / 60) * 60) + '秒',
              timeSettingContent: '每天' + momentTimeToString(item.timeSetting, momentFormat.times),
              operatorsHtml: getOperatorsText(item.rules)
            };
          });
          updateTableState(this.tableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.tableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    JointCheckRuleAdd() { // 房间联检新增
      this.$router.push({
        name: routerMeta.monitorRoomJointCheckRuleAdd.name,
        params: {
          rid: this.roomId
        }
      });
    },
    jointCheckRuleEdit(row) { // 房间联检编辑
      this.$router.push({
        name: routerMeta.monitorRoomJointCheckRuleEdit.name,
        params: {
          rid: this.roomId,
          jid: row.id
        }
      });
    },
    jointCheckRuleDetail(row) { // 房间联检查看
      this.$router.push({
        name: routerMeta.monitorRoomJointCheckRuleDetail.name,
        params: {
          rid: this.roomId,
          jid: row.id
        }
      });
    },
    jointCheckRuleEnables(row, enableConfig) { // 房间联检禁用/启用
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          id: row.id,
          roomId: this.roomId
        };
        API.jointCheckRule.jointCheckRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomJointCheckRule();
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '房间联检规则' + enableConfig.label + '成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    jointCheckRuleImplement(row) { // 执行联检
      this.$confirm('确认要执行房间联检:' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.jointCheckRule.jointCheckRuleExecute({ id: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomJointCheckRule();
            messageHandle({ code: msgCode.DEL_SAVE, msg: `房间联检执行成功,等待${row.timeoutContent || ''}可查看联检报告` });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    jointCheckRuleDeletes(row) {
      this.$confirm('确认要删除房间联检规则' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.jointCheckRule.jointCheckRuleDelete({ id: row.id, roomId: row.roomId }).then(resp => {
          if (checkRespCorrect(resp)) {
            updatePageNo(this.tableId);
            this.getRoomJointCheckRule();
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间联检规则删除成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    // 应用至房间
    applyToRoom(data) {
      this.$confirm(`若选中的${data.length}个房间下存在同名联检则原联检将被覆盖，若不存在则复制！`, '应用至房间', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          roomIdList: __.pluck(data || [], 'id'),
          id: this.jointForm.id
        };
        API.jointCheckRule.jointCheckRuleCopy(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '联检规则应用至房间成功' });
            this.cancelApply();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    // 取消应用至房间
    cancelApply() {
      this.showSelectRoomDialog = false;
    }
  }
};
</script>

<style scoped>

</style>
