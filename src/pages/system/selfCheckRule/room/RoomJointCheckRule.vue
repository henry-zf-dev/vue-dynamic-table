<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="roomJointCheckRuleData"
      @filterChange="getRoomJointCheckRuleData"
      @pageChanged="getRoomJointCheckRuleData"
      @sizeChanged="getRoomJointCheckRuleData"
      @sortChanged="getRoomJointCheckRuleData">
    </EZTable>
  </div>
</template>

<script>
import { tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import { routerMeta } from '../../../../router/routerMeta';
import {
  assembleTableOptBtn,
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState,
  messageHandle,
  momentTimeToString,
  updatePageNo,
  updateTableState
} from '../../../../utils';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';

export default {
  name: 'RoomJointCheckRule',
  components: {
    EZTable
  },
  data() {
    return {
      tableId: tableIdConfig.roomJointCheckRule,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      roomJointCheckRuleData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getRoomJointCheckRuleData();
  },
  methods: {
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.$router.push({
                name: routerMeta.systemRoomJointCheckRuleList.name,
                params: { rid: data.id }
              });
              break;
            case tableOptBtnConfig.enable.type:
              this.modifyEnableStatus(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.modifyEnableStatus(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.delete.type:
              this.roomJointCheckRuleDelete(data);
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
    getRoomJointCheckRuleData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.jointCheckRule.roomAllJointCheckRuleList(params).then(resp => {
        this.tableLoading = false;
        function getOperators(jointInspections = []) {
          if (jointInspections.length < 0) return '';
          return `<span>${__.pluck(jointInspections, 'name').join('、')} 共</span><span class="font-color-success">${jointInspections.length}项</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.roomJointCheckRuleData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              operatorsHtml: getOperators(item.jointInspections),
              durationContent: item.duration > 0 ? `持续异常${item.duration}分钟` : '只要有异常'
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
    // 修改启用/禁用状态
    modifyEnableStatus(row, enableConfig = {}) {
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '的联检规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          roomId: row.id
        };
        API.jointCheckRule.jointCheckRuleAllEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getRoomJointCheckRuleData();
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
    roomJointCheckRuleDelete(row) {
      this.$confirm('确认要删除' + row.name + ' 的联检规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.jointCheckRule.jointCheckRuleAllDelete({ roomId: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            updatePageNo(getTableState(this.tableId));
            this.getRoomJointCheckRuleData();
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间联检规则删除成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    }
  }
};
</script>

<style scoped>

</style>
