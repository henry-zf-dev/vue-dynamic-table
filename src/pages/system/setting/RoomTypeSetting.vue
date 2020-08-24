<template>
  <div>
    <EZTable
      v-loading="tableLoading"
      :custom-empty="true"
      :hide-filter="true"
      :table-id="tableId"
      :columns="columnConfig"
      :rows="roomTypeData"
      @pageChanged="roomTypeList"
      @sizeChanged="roomTypeList"
      @sortChanged="roomTypeList">
      <div slot="header">
        <div class="pad-top-10 pad-btm-20">
          <span class="font-size-second font-gray-40 font-weight-bold">房间类型设置将对房间使用分析有非常重要的作用，请详细归纳整理</span>
          <span
            v-if="judgePerm(permConfig.system)"
            class="mar-lft-20 cursor-pointer font-size-second font-color-primary iconfont icon-tianjia font-weight-bold"
            @click="addRoomType">添加房间类型</span>
        </div>
      </div>
      <div slot="empty">
        <EmptyContent :opt-data="roomTypeEmptyBtn"></EmptyContent>
      </div>
    </EZTable>
    <el-dialog
      :title="title"
      :visible.sync="isRoomTypeDialog"
      :show-close="false"
      :close-on-press-escape="false"
      width="500px"
      @close="closeDialog">
      <el-form
        v-loading="isFromLoading"
        :ref="roomTypeFormRef"
        :model="roomTypeForm"
        :rules="roomTypeFormRules"
        size="medium"
        label-width="100px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="roomTypeForm.name" type="text" placeholder="请填写类型名称"></el-input>
        </el-form-item>
        <el-form-item prop="remark" label="备注">
          <el-input v-model="roomTypeForm.remark" class="areaClass" type="textarea" placeholder="请填写备注"></el-input>
        </el-form-item>
        <FormOptBtn
          :is-in-dialog="true"
          @formCancel="closeDialog"
          @formSubmit="roomTypeSubmit"></FormOptBtn>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {
  checkRespCorrect,
  messageHandle,
  judgePermission,
  paramsTrim,
  getTableState,
  updateTableState, assembleTableOptBtn, updatePageNo, getTableConfig, momentTimeToString, getTableCfgFromStorage
} from '../../../utils';
import { commonConfig, momentFormat, tableIdConfig, tableOptBtnConfig } from '../../../config/common';
import { msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import EmptyContent from '../../../components/EmptyContent';
import FormOptBtn from '../../../components/FormOptBtn';
import EZTable from '../../../components/table/EZTable';
import moment from 'moment';
import { updateRouteParamState } from '../../../modules/urlParamStoreHdl';

export default {
  name: 'RoomTypeSetting',
  components: {
    FormOptBtn,
    EZTable,
    EmptyContent
  },
  data() {
    return {
      tableId: tableIdConfig.systemRoomTypeConfig,
      columnConfig: [],
      permConfig: permissionConfig,
      tableLoading: true,
      isFromLoading: false,
      title: '新增房间类型',
      isRoomTypeDialog: false,
      roomTypeEmptyBtn: [
        {
          type: 'btn',
          label: '添加房间类型',
          icon: 'icon-tianjia',
          perm: permissionConfig.system,
          callback: () => {
            this.addRoomType();
          }
        }
      ],
      roomTypeData: [], // 房间类型数据源
      roomTypeFormRef: 'roomTypeFormRef', // 表单名字
      roomTypeFormRules: { // 非空验证
        name: [{ required: true, message: '请输入类型名称', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '类型名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }],
        remark: [{
          max: commonConfig.formMaxLength.textareaMax,
          message: '备注不能超过' + commonConfig.formMaxLength.textareaMax + '个字符',
          trigger: 'blur'
        }]
      },
      roomTypeForm: {} // 新增编辑数据源
    };
  },
  activated() {
    this.initTableConfig();
    this.roomTypeList();
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
            case tableOptBtnConfig.edit.type:
              this.editRoomType(data);
              break;
            case tableOptBtnConfig.delete.type:
              this.deleteRoomType(data);
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
    roomTypeList() { // 查询列表
      this.tableLoading = true;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const parMar = {
        pageNo, pageSize, filters, sort
      };
      API.setting.roomTypeList(parMar).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { pageInfo = {} } = resp.data || {};
          this.roomTypeData = (resp.data.items || []).map(function(item) {
            return {
              ...item,
              updatedTime: momentTimeToString(item.updatedTime)
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
    addRoomType() { // 弹出新增
      this.isRoomTypeDialog = true;
      this.roomTypeForm = {};
    },
    editRoomType(row) { // 编辑
      this.isRoomTypeDialog = true;
      const ros = JSON.parse(JSON.stringify(row));
      this.roomTypeForm = {
        ...ros
      };
      updateRouteParamState(this.$route.name, { roomType: row.id });
    },
    roomTypeSubmit() { // 提交
      this.$refs[this.roomTypeFormRef].validate((valid) => {
        if (!valid) return;
        this.roomTypeLoading = true;
        const parMar = {
          ...this.roomTypeForm
        };
        paramsTrim(parMar);
        if (!this.roomTypeForm.id) {
          API.setting.roomTypeAdd(parMar).then(resp => {
            this.roomTypeLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.ADD_SAVE, msg: '房间类型新增成功' });
              this.roomTypeList();
              this.isRoomTypeDialog = false;
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.roomTypeLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        } else {
          API.setting.roomTypeEdit(parMar).then(resp => {
            this.roomTypeLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.HAS_SAVE, msg: '房间类型编辑成功' });
              this.roomTypeList();
              this.isRoomTypeDialog = false;
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.roomTypeLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        }
      });
    },
    closeDialog() { // 关闭新增编辑页面
      this.isRoomTypeDialog = false;
      this.roomTypeForm = {};
      updateRouteParamState(this.$route.name, { roomType: '' });
    },
    deleteRoomType(row) {
      this.$confirm('确认要删除房间类型' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.setting.roomTypeDelete({ id: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间类型删除成功' });
            updatePageNo(this.tableId);
            this.roomTypeList();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {});
    }
  }
};
</script>

<style scoped>

</style>
