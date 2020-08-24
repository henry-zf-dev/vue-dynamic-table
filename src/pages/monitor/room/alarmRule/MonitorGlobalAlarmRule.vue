<template>
  <div>
    <div :class="{'page-container': !showTableOnly}">
      <div :class="{'table-container': !showTableOnly}">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="globalAlarmData"
          @filterChange="getGlobalAlarmList"
          @pageChanged="getGlobalAlarmList"
          @sizeChanged="getGlobalAlarmList"
          @sortChanged="getGlobalAlarmList">
        </EZTable>
      </div>
    </div>
  </div>
</template>

<script>
  import EZTable from '../../../../components/table/EZTable';
  import {tableIdConfig, tableOptBtnConfig} from '../../../../config/common';
  import {
    assembleTableOptBtn, checkRespCorrect,
    getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    judgePermission, messageHandle, momentTimeToString, updateTableState
  } from '../../../../utils';
  import {commonString, msgCode, msgContent} from '../../../../config/string';

  export default {
    name: 'MonitorGlobalAlarmRule',
    components: {
      EZTable
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
        tableId: tableIdConfig.monitorGlobalAlarmRule,
        columnConfig: [],
        filters: [],
        tableLoading: true,
        globalAlarmData: [],
        roomId: ''
      };
    },
    activated() {
      this.initData();
    },
    methods: {
      judgePerm: judgePermission,
      initData() {
        this.roomId = this.$route.params.rid || '';
        this.initTableConfig();
        this.getGlobalAlarmList();
      },
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.apply.type:
                this.modifyApplyStatus(data, commonString.configApply.apply);
                break;
              case tableOptBtnConfig.cancel.type:
                this.modifyApplyStatus(data, commonString.configApply.cancel);
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
      getGlobalAlarmList() { // 查询全局告警规则列表
        const {pageNo = 1, pageSize = 10, filters = [], sort = []} = getTableState(this.tableId);
        const parMar = {
          pageNo, pageSize, filters, sort,
          roomId: this.roomId
        };
        this.tableLoading = true;
        API.room.roomGlobalAlarmRuleList(parMar).then(resp => {
          this.tableLoading = false;

          function getAlarmText(item) {
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
            this.globalAlarmData = (items || []).map(item => {
              return {
                ...item,
                updatedTime: momentTimeToString(item.updatedTime),
                alarmText: getAlarmText(item),
                isEnableContent: item.isApply === 'Y' ? '应用' : '取消应用'
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
      // 修改应用/取消应用状态
      modifyApplyStatus(row, applyConfig = {}) {
        this.$confirm('确认要' + applyConfig.label + '' + row.name + '吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            apply: applyConfig.value,
            id: row.id,
            roomId: this.roomId
          };
          API.room.roomGlobalAlarmRuleApply(params).then(resp => {
            if (checkRespCorrect(resp)) {
              this.getGlobalAlarmList();
              messageHandle({code: msgCode.EDIT_SAVE, msg: '房间告警规则' + applyConfig.label + '成功'});
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
