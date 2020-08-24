<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :table-id="tableId"
      :filters="filters"
      :columns="columnConfig"
      :rows="selfCheckRuleTemplateData"
      @filterChange="getSelfCheckRuleTemplateData"
      @pageChanged="getSelfCheckRuleTemplateData"
      @sizeChanged="getSelfCheckRuleTemplateData"
      @sortChanged="getSelfCheckRuleTemplateData">
    </EZTable>
    <el-dialog
      v-if="showTemplateApplyDialog"
      :visible.sync="showTemplateApplyDialog"
      :before-close="areaFormCanceled"
      class="rule-template-apply-dialog"
      title="应用至房间"
      width="1100px"
      top="60px">
      <ApplyToRoom
        :room-form="roomForm"
        :sel="{roomData: roomData}"
        @formCanceled="areaFormCanceled"></ApplyToRoom>
    </el-dialog>

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
import { msgCode, msgContent } from '../../../../config/string';
import EZTable from '../../../../components/table/EZTable';
import ApplyToRoom from '../partial/ApplyToRoom';
import SelfCheckRuleTemplateOpt from './SelfCheckRuleTemplateOpt';

export default {
  name: 'SelfCheckRuleTemplate',
  components: {
    EZTable, ApplyToRoom, SelfCheckRuleTemplateOpt
  },
  data() {
    return {
      tableId: tableIdConfig.roomSelfCheckRuleTemplate,
      tableLoading: true,
      filters: [],
      columnConfig: [],
      tableOptBtn: [],
      selfCheckRuleTemplateData: [],
      selfTemplateRow: {},
      showTemplateApplyDialog: false,
      isApplication: false,
      roomForm: {},
      roomData: []
    };
  },
  activated() {
    this.initTableConfig();
    this.getSelfCheckRuleTemplateData();
    // TODO ApplyToRoom 组件
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
              // 跳转至模板详情
              break;
            case tableOptBtnConfig.edit.type:
              this.$router.push({
                name: routerMeta.systemSelfCheckTemplateEdit.name,
                params: { tid: data.id }
              });
              break;
            case tableOptBtnConfig.delete.type:
              this.checkRuleTemplateApply(data, false);
              break;
            case tableOptBtnConfig.applyToRoom.type:
              this.checkRuleTemplateApply(data);
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
    getSelfCheckRuleTemplateData() {
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.selfCheckRule.ruleTemplateList(params).then(resp => {
        this.tableLoading = false;
        function getOperators(item) {
          return `<span>${item.stateName ? item.stateName : ''}</span><span class="font-color-success">${item.operatorsName ? item.operatorsName : ''}${item.expectedValueName ? item.expectedValueName : ''}</span>`;
        }
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.selfCheckRuleTemplateData = items.map(item => {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime),
              operatorsHtml: getOperators(item),
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
      this.$confirm('确认要' + enableConfig.label + '' + row.roomName + '的联检规则吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          roomId: row.roomId
        };
        API.jointCheckRule.jointCheckRuleAllEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getSelfCheckRuleTemplateData();
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
    // 自检模板应用至房间
    checkRuleTemplateApply(row, isShow = true) {
      this.roomForm = row;
      this.showTemplateApplyDialog = true;
      this.isApplication = isShow;
      this.roomData = [];
    },
    // 关闭应用至房间界面
    areaFormCanceled() {
      this.showTemplateApplyDialog = false;
      if (!this.isApplication) { // 判断是否需要弹出删除提示
        this.$confirm('确认要删除自检模板' + this.roomForm.name + '吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.selfCheckRule.ruleTemplateDelete({ id: this.roomForm.id }).then(resp => {
            if (checkRespCorrect(resp)) {
              updatePageNo(getTableState(this.tableId));
              this.getSelfCheckRuleTemplateData();
              messageHandle({ code: msgCode.DEL_SAVE, msg: '自检模板删除成功' });
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
  }
};
</script>

<style scoped>

</style>
