<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :custom-empty="true"
      :filters="filters"
      :columns="columnConfig"
      :rows="globalAlarmRuleData"
      @filterChange="getGlobalAlarmRuleData"
      @pageChanged="getGlobalAlarmRuleData"
      @sizeChanged="getGlobalAlarmRuleData"
      @sortChanged="getGlobalAlarmRuleData">
      <div slot="empty">
        <EmptyContent :opt-data="globalAlarmRuleEmptyBtn"></EmptyContent>
      </div>
    </EZTable>
  </div>
</template>

<script>
  import EmptyContent from '../../../../components/EmptyContent';
  import {tableIdConfig, tableOptBtnConfig} from '../../../../config/common';
  import {routerMeta} from '../../../../router/routerMeta';
  import {
    assembleTableOptBtn,
    checkRespCorrect, getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    judgePermission,
    messageHandle,
    momentTimeToString,
    updateTableState
  } from '../../../../utils';
  import {commonString, msgCode, msgContent} from '../../../../config/string';
  import EZTable from '../../../../components/table/EZTable';
  import {permissionConfig} from '../../../../config/permission';

  export default {
    name: 'GlobalAlarmRule',
    components: {
      EZTable, EmptyContent
    },
    data() {
      return {
        tableId: tableIdConfig.globalAlarmRule,
        tableLoading: true,
        filters: [],
        columnConfig: [],
        tableOptBtn: [],
        globalAlarmRuleData: [],
        globalAlarmRuleEmptyBtn: [
          {
            type: 'btn',
            label: '新增告警规则',
            icon: 'icon-tianjia',
            perm: permissionConfig.system,
            callback: () => {
              this.globalAlarmRuleAdd();
            }
          }
        ]
      };
    },
    activated() {
      this.initTableConfig();
      this.getGlobalAlarmRuleData();
    },
    methods: {
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.edit.type:
                this.$router.push({
                  name: routerMeta.systemGlobalAlarmEdit.name,
                  params: {aid: data.id}
                });
                break;
              case tableOptBtnConfig.enable.type:
                this.modifyEnableStatus(data, commonString.configEnable.enable);
                break;
              case tableOptBtnConfig.forbidden.type:
                this.modifyEnableStatus(data, commonString.configEnable.forbidden);
                break;
              case tableOptBtnConfig.recovery.type:
                this.recoveryAlarm(data);
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
      getGlobalAlarmRuleData() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort
        };
        API.alarmRule.globalAlarmRuleList(params).then(resp => {
          this.tableLoading = false;

          function getAlarmText(item) {
            // const device = __.pluck((item.ruleList || []), 'name').join('、');
            // const ruleNum = item.ruleList ? item.ruleList.length : 0;
            // const trigger = (item.triggerConditions === 'and' ? '全部异常' : '任意一项异常');
            const {detection = {}} = item;
            const interval = item.silenceCycle || commonString.unknown;
            const notification = (item.notificationWay || []).map(item => {
              return item === 'sms' ? '短信' : (item === 'email' ? '邮件' : 'TT');
            }).join('+');
            return `<span><span>${detection.brandName || ''} ${detection.categoryName || ''} ${detection.stateName || ''} ${detection.operatorsName || ''} ${detection.expectedValueName || ''}，
                  </span><span class="font-color-success">${item.duration <= 0 ? '只要有异常' : `持续异常${item.duration || ''}分钟`}</span>则触发告警，每<span class="font-color-success">${interval}分钟${notification}</span>通知一次</span>`;
          }

          if (checkRespCorrect(resp)) {
            const {items = [], pageInfo = {}} = resp.data || {};
            this.globalAlarmRuleData = items.map(item => {
              return {
                ...item,
                updatedTime: momentTimeToString(item.updatedTime),
                alarmText: getAlarmText(item)
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
      globalAlarmRuleAdd() {
        this.$router.push({
          name: routerMeta.systemGlobalAlarmAdd.name
        });
      },
      // 手动恢复该告警规则下所有告警
      recoveryAlarm(row) {
        this.$confirm(`确定要恢复【${row.name}】下所有的告警记录吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            id: row.id
          };
          API.alarmRule.globalAlarmRuleRecovery(params).then(resp => {
            if (checkRespCorrect(resp)) {
              this.getGlobalAlarmRuleData();
              messageHandle({code: msgCode.EDIT_SAVE, msg: '告警规则手动恢复成功'});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
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
              this.getGlobalAlarmRuleData();
              messageHandle({code: msgCode.EDIT_SAVE, msg: '告警规则' + enableConfig.label + '成功'});
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
