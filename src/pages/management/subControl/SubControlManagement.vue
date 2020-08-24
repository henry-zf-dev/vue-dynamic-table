<template>
  <div class="subCtr-management-page" style="padding-top: 60px">
    <Breadcrumb :opt-data="breadcrumbOpts"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="subCtrData"
          @filterChange="getSubCtrList"
          @pageChanged="getSubCtrList"
          @sizeChanged="getSubCtrList"
          @sortChanged="getSubCtrList">
          <div slot="empty">
            <EmptyContent :opt-data="subCtrEmptyBtn"></EmptyContent>
          </div>
        </EZTable>
      </div>
      <el-dialog
        v-loading="subCtrFormLoading"
        :visible.sync="showSubCtrDialog"
        :title="isEditSubCtr ? '编辑分控' : '新增分控'"
        width="500px">
        <el-form :model="subCtrForm" :ref="subCtrFormRef" :rules="subCtrFormRules" size="medium" label-width="80px">
          <el-form-item prop="name" label="名称">
            <el-input v-model="subCtrForm.name" type="text"></el-input>
          </el-form-item>
          <el-form-item prop="deviceEsn" label="ESN">
            <el-input v-model="subCtrForm.deviceEsn" type="text"></el-input>
          </el-form-item>
          <el-form-item prop="centralControlUrl" label="地址">
            <el-input v-model="subCtrForm.centralControlUrl" type="text"></el-input>
          </el-form-item>
          <!--          <el-form-item prop="port" label="端口">-->
          <!--            <el-input type="text" v-model="subCtrForm.port"></el-input>-->
          <!--          </el-form-item>-->
          <el-form-item prop="deviceToken" label="Token">
            <el-input :disabled="true" v-model="subCtrForm.deviceToken"></el-input>
          </el-form-item>
          <el-form-item prop="remark" label="备注">
            <el-input v-model="subCtrForm.remark" type="textarea"></el-input>
          </el-form-item>
        </el-form>
        <FormOptBtn
          :is-in-dialog="true"
          @formCancel="subCtrFormCanceled"
          @formSubmit="subCtrFormSubmitted"></FormOptBtn>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  checkRespCorrect,
  messageHandle,
  judgePermission,
  paramsTrim,
  getTableState,
  updateTableState,
  assembleTableOptBtn, getTableConfig, momentTimeToString, subControlToken, getTableCfgFromStorage
} from '../../../utils';
import { rulesEsn } from '../../../utils/validate';
import { momentFormat, commonConfig, tableIdConfig, tableOptBtnConfig } from '../../../config/common';
import { commonString, msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import FormOptBtn from '../../../components/FormOptBtn';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import { routerMeta } from '../../../router/routerMeta';
import EmptyContent from '../../../components/EmptyContent';
import EZTable from '../../../components/table/EZTable';
import { updateRouteParamState } from '../../../modules/urlParamStoreHdl';

export default {
  name: 'SubControlManagement',
  components: {
    FormOptBtn, Breadcrumb, EZTable, EmptyContent
  },
  data() {
    return {
      tableId: tableIdConfig.managerSubControl,
      columnConfig: [],
      filters: [],
      columns: [],
      subCtrEmptyBtn: [
        {
          type: 'btn',
          label: '新增分控',
          icon: 'icon-tianjia',
          perm: permissionConfig.managementSubControl,
          callback: () => {
            this.addSubCtr();
          }
        }
      ],
      tableLoading: true, // 列表加载圈
      showSubCtrDialog: false, // 控制dialog
      subCtrFormLoading: false, // 新增编辑加载圈
      subCtrData: [], // 数据源
      subCtrFormRules: {
        name: [{
          max: commonConfig.formMaxLength.inputMax,
          message: '名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
          trigger: 'blur'
        }],
        centralControlUrl: [{ required: true, message: '请输入ip地址', trigger: 'blur' }],
        port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
        deviceEsn: [
          { required: true, message: '请输入esn', trigger: 'blur' },
          {
            min: 5,
            message: 'esn必须大于4个字符',
            trigger: 'blur'
          },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: 'esn不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }, {
            validator: rulesEsn,
            trigger: 'blur'
          }
        ],
        remark: [{
          max: commonConfig.formMaxLength.textareaMax,
          message: '备注不能超过' + commonConfig.formMaxLength.textareaMax + '个字符',
          trigger: 'blur'
        }]
      },
      subCtrForm: {}, // 新增编辑存放数据
      subCtrFormRef: 'subCtrFormRef',
      isEditSubCtr: false
    };
  },
  computed: {
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '新增分控',
          icon: 'icon-tianjia',
          perm: permissionConfig.managementSubControl,
          callback: () => {
            this.addSubCtr();
          }
        }
      ];
    }
  },
  activated() {
    this.initTableConfig();
    this.getSubCtrList();
  },
  methods: {
    judgePerm: judgePermission,
    initTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.columnConfig = columns;
        this.filters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.subCtrDetail(data.id);
              break;
            case tableOptBtnConfig.edit.type:
              this.editSubCtr(data);
              break;
            case tableOptBtnConfig.enable.type:
              this.modifyEnableStatus(data, commonString.configEnable.enable);
              break;
            case tableOptBtnConfig.forbidden.type:
              this.modifyEnableStatus(data, commonString.configEnable.forbidden);
              break;
            case tableOptBtnConfig.jump.type:
              this.jumpSubCtr(data);
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
    getSubCtrList() { // 查询分控列表
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const parMar = {
        pageNo, pageSize, filters, sort
      };
      API.subControl.subControlList(parMar).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items, pageInfo = {} } = resp.data || {};
          this.subCtrData = (items || []).map(item => {
            return {
              ...item,
              createdTime: momentTimeToString(item.createdTime),
              lastActiveTime: momentTimeToString(item.lastActiveTime),
              nameContent: item.name,
              ipText: item.centralControlUrl ? item.centralControlUrl : '未知',
              roomLimitTxt: item.roomLimit ? '最大容量：' + item.roomLimit : '未知',
              roomCountTxt: item.roomCount ? '已用容量：' + item.roomCount : '未知',
              deviceLimitTxt: item.deviceLimit ? '最大数量：' + item.deviceLimit : '未知',
              deviceCountTxt: item.deviceCount ? '已有数量：' + item.deviceCount : '未知'
            };
          });
          updateTableState(this.tableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.tableLoading = false;
        messageHandle({ code: msgContent.SYSTEM });
      });
    },
    jumpSubCtr(row) { // 跳转
      if (!row.centralControlUrl) return '';
      subControlToken(row.centralControlUrl);
    },
    subCtrDetail(id) { // 详情
      this.$router.push({
        name: routerMeta.managementSubControlDetail.name,
        params: {
          sid: id
        }
      });
    },
    // 修改启用/禁用状态
    modifyEnableStatus(row, enableConfig = {}) {
      this.$confirm('确认要' + enableConfig.label + '分控' + row.deviceEsn + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          id: row.id
        };
        API.subControl.subControlDelete(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '分控' + enableConfig.label + '成功' });
            this.getSubCtrList();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    addSubCtr() { // 新增
      this.showSubCtrDialog = true;
      this.isEditSubCtr = false;
      this.subCtrForm = {};
    },
    editSubCtr(row) { // 编辑
      this.showSubCtrDialog = true;
      this.isEditSubCtr = true;
      const subCtr = JSON.parse(JSON.stringify(row));
      this.subCtrForm = {
        ...subCtr
      };
      updateRouteParamState(this.$route.name, { subCtr: row.id });
    },
    subCtrFormCanceled() { // 取消弹出框
      this.showSubCtrDialog = false;
      updateRouteParamState(this.$route.name, { subCtr: '' });
    },
    subCtrFormSubmitted() { // 提交数据
      this.$refs[this.subCtrFormRef].validate((valid) => {
        if (!valid) return;
        this.subCtrFormLoading = true;
        const subCtr = {
          ...this.subCtrForm,
          centralControlUrl: ~this.subCtrForm.centralControlUrl.indexOf('http') ? this.subCtrForm.centralControlUrl : 'http://' + this.subCtrForm.centralControlUrl
        };
        paramsTrim(subCtr);
        if (!this.isEditSubCtr) {
          API.subControl.subControlAdd(subCtr).then(resp => {
            this.subCtrFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '分控新增成功' });
              this.subCtrFormCanceled();
              this.getSubCtrList();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.subCtrFormLoading = false;
            messageHandle({ code: msgContent.SYSTEM });
          });
        } else {
          const subCtrEdit = {
            ...subCtr,
            id: this.subCtrForm.id
          };
          API.subControl.subControlEdit(subCtrEdit).then(resp => {
            this.subCtrFormLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.HAS_SAVE, msg: '分控编辑成功' });
              this.subCtrFormCanceled();
              this.getSubCtrList();
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.subCtrFormLoading = false;
            messageHandle({ code: msgContent.SYSTEM });
          });
        }
      });
    }
  }
};
</script>

<style scoped>

</style>
