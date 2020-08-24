<template>
  <div :style="{paddingTop: !showTableOnly ? '60px' : '0'}" class="alarm-page">
    <Breadcrumb v-if="!showTableOnly" :opt-data="breadcrumbOpts"></Breadcrumb>
    <div :class="{'page-container': !showTableOnly}">
      <div :class="{'table-container': !showTableOnly}">
        <EZTable
          v-loading="tableLoading"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="recordData"
          @filterChange="getDeviceAlarmLogList"
          @pageChanged="getDeviceAlarmLogList"
          @sizeChanged="getDeviceAlarmLogList"
          @sortChanged="getDeviceAlarmLogList">
        </EZTable>
      </div>
    </div>
    <el-dialog
      v-loading="recoveryAlarmLoading"
      v-if="isRecoveryAlarm"
      :visible.sync="isRecoveryAlarm"
      title="手动恢复告警"
      width="500px">
      <el-form
        :model="recoveryAlarmForm"
        :rules="recoveryAlarmRules"
        :ref="recoveryAlarmFormRef"
        class="mar-lft-10"
        size="medium"
        label-width="90px">
        <el-form-item prop="remark" label="备注">
          <el-input v-model="recoveryAlarmForm.remark" type="textarea" placeholder="请输入恢复告警备注"></el-input>
        </el-form-item>
      </el-form>
      <FormOptBtn
        :is-in-dialog="true"
        @formCancel="recoveryAlarmCancel"
        @formSubmit="recoveryAlarmSubmit"></FormOptBtn>
    </el-dialog>
  </div>
</template>

<script>
import {
  assembleTableOptBtn,
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  judgePermission,
  messageHandle,
  momentTimeToString,
  updateTableState
} from '../../utils';
import { routerMeta } from '../../router/routerMeta';
import { commonConfig, tableIdConfig, tableOptBtnConfig } from '../../config/common';
import { commonString, msgCode, msgContent } from '../../config/string';
import { permissionConfig } from '../../config/permission';
import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
import EZTable from '../../components/table/EZTable';
import EmptyContent from '../../components/EmptyContent';
import FormOptBtn from '../../components/FormOptBtn';

export default {
  name: 'AlarmDeviceRecord',
  components: {
    Breadcrumb, EZTable, EmptyContent, FormOptBtn
  },
  props: {
    // 是否只显示 table
    showTableOnly: {
      type: Boolean,
      default: false
    },
    alarmDeviceId: {
      type: String,
      default: ''
    },
    ignoreColumn: {
      type: Array,
      default: () => {
        return [];
      }
    },
    ignoreFilter: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      tableId: tableIdConfig.alarmRecord,
      isRecoveryAlarm: false,
      recoveryAlarmLoading: false,
      recoveryAlarmForm: {}, // 手动恢复告警备注
      recoveryAlarmFormRef: 'recoveryAlarmFormRef',
      recoveryAlarmRules: {
        remark: [
          { required: true, message: '请输入恢复告警备注', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '备注不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ]
      },
      deviceId: '',
      columnConfig: [],
      filters: [],
      recordData: [],
      tableLoading: true
    };
  },
  computed: {
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '查看告警规则',
          icon: 'icon-shuoming',
          perm: permissionConfig.system,
          callback: () => {
            this.getAlarmRule();
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
      this.deviceId = this.$route.params.did || this.alarmDeviceId || '';
      this.initTableConfig();
      this.getDeviceAlarmLogList();
    },
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.getAlarmDetail(data.id);
              break;
            case tableOptBtnConfig.recovery.type:
              this.recoveryAlarm(data);
              break;
            default:
              break;
          }
        });
      };
      assembleConfig(
        getTableCfgFromStorage(this.tableId, this.ignoreColumn, this.ignoreFilter)
      );
      getTableConfig(this.tableId, this.ignoreColumn, this.ignoreFilter)
        .then((config) => {
          assembleConfig(config);
        }).catch(err => {
        });
    },
    getDeviceAlarmLogList() {
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const parMar = {
        pageNo, pageSize,
        filters, sort,
        deviceId: this.deviceId
      };
      this.tableLoading = true;
      API.alarm.deviceAlarmLogList(parMar).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          this.dataProcessing(resp);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.tableLoading = false;
        messageHandle({ code: msgContent.SYSTEM });
      });
    },
    // 数据处理方法
    dataProcessing(resp) {
      const { items, pageInfo = {} } = resp.data || {};
      const values = Object.values(commonString.alarmPriority);
      this.recordData = (items || []).map(item => {
        const alarmPriority = values.find(s => {
          return s.value === item.level;
        }) || {};
        const { solution = {}, checkList = [] } = item;
        return {
          ...item,
          createdTime: momentTimeToString(item.createdTime),
          invalidTime: momentTimeToString(item.invalidTime),
          levelText: alarmPriority.label,
          levelType: alarmPriority.type,
          solutionContent: solution.description || '',
          restoreSourceText: item.restoreSource ? (item.restoreSource === 1 ? '系统恢复' : '手动恢复') : '',
          ipContent: checkList.map(deviceItem => {
            const content = __.pluck(deviceItem.ipParam || [], 'remoteIP').join('、');
            return content ? (deviceItem.deviceName || '') + ' IP:' + content : '';
          }).filter(val => {
            return val && val.trim();
          }).join('；'),
          isBtnArr: item.invalidTime && ([tableOptBtnConfig.recovery.type]) || [],
          alarmText: checkList.map(check => {
            return check.checkName + '触发';
          }).join('，')
        };
      });
      updateTableState(this.tableId, { total: pageInfo.total || 0 });
    },
    // 手动恢复告警
    recoveryAlarm(row) {
      this.recoveryAlarmForm.id = row.id;
      this.isRecoveryAlarm = true;
    },
    recoveryAlarmCancel() {
      this.isRecoveryAlarm = false;
      this.recoveryAlarmForm.remark = '';
    },
    recoveryAlarmSubmit() {
      this.$refs[this.recoveryAlarmFormRef].validate((valid) => {
        if (!valid) return;
        this.recoveryAlarmLoading = true;
        API.alarm.recoveryAlarmById({
          id: this.recoveryAlarmForm.id,
          remark: this.recoveryAlarmForm.remark
        }).then(resp => {
          this.recoveryAlarmLoading = false;
          if (checkRespCorrect(resp)) {
            this.getDeviceAlarmLogList();
            this.isRecoveryAlarm = false;
            this.recoveryAlarmForm.remark = '';
            messageHandle({ code: msgCode.ADD_SAVE, msg: '告警恢复成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          this.recoveryAlarmLoading = false;
          messageHandle({ code: msgCode.SYSTEM });
        });
      });
    },
    getAlarmDetail(id) { // 告警详情界面
      const params = { did: this.deviceId, aid: id };
      // withExtraParent：标志在路由跳转后，需要判断路由中配置的 extraParent
      this.showTableOnly && (params['withExtraParent'] = true);
      this.$router.push({
        name: routerMeta.alarmDeviceRecordDetail.name,
        params: params
      });
    },
    getAlarmRule() {
      this.$router.push({
        name: routerMeta.systemAlarmRule.name
      });
    }
  }
};
</script>

<style scoped lang="less">
  .cursor-pointer:hover {
    color: @colorPrimary;
    text-decoration: underline;
  }
</style>
