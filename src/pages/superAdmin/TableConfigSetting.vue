<template>
  <div style="padding: 50px 100px 100px 100px">
    <div class="header3">表格配置信息</div>
    <el-input v-model="tableId" class="mar-top-20" placeholder="请输入 tableId" clearable>
      <el-button slot="append" icon="el-icon-delete" type="danger" class="font-color-danger" @click="deleteConfig">删除</el-button>
    </el-input>
    <el-row class="mar-top-20">
      <el-col :span="8" class="pad-rgt-10">
        <el-input v-model="oldTableId" placeholder="请输入 oldTableId" clearable></el-input>
      </el-col>
      <el-col :span="8" class="pad-rgt-10">
        <el-input v-model="newTableId" placeholder="请输入 newTableId" clearable></el-input>
      </el-col>
      <el-col :span="8" class="pad-rgt-10">
        <el-input v-model="tableName" placeholder="请输入 tableName" clearable></el-input>
      </el-col>
    </el-row>
    <el-input :rows="30" v-model="tableColumnConfig" class="mar-top-10" type="textarea" placeholder="请填写表格配置信息"></el-input>
    <div class="text-align-center mar-top-20">
      <el-button type="info" class="width-30" @click="configSubmitCanceled">取消</el-button>
      <el-button type="primary" class="width-30" @click="configSubmit">提交</el-button>
    </div>
  </div>
</template>

<script>
import { checkRespCorrect, messageHandle } from '../../utils';
import { msgCode, msgContent } from '../../config/string';
import FormOptBtn from '../../components/FormOptBtn';

export default {
  name: 'TableConfigSetting',
  components: {
    FormOptBtn
  },
  data() {
    return {
      tableColumnConfigRef: 'tableColumnConfigRef',
      configForm: {
        // label: '',
        // width: 0,
        // minWidth: 0,
        // visible: 0,
        // disabled: false,
        // isCheck: true,
        // horizontal: false,
        // opt: false,
      },
      tableColumnConfig: '',
      tableId: '',
      oldTableId: '',
      newTableId: '',
      tableName: ''
    };
  },
  methods: {
    configSubmit() {
      if (!this.oldTableId || !this.newTableId || !this.tableName || !this.tableColumnConfig) return;
      this.$confirm(`确定要更改 table 配置：${this.oldTableId}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const config = JSON.parse(this.tableColumnConfig);
        const params = {
          oldId: this.oldTableId,
          newId: this.newTableId,
          name: this.tableName,
          data: config
        };
        API.setting.tableConfigEdit(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    configSubmitCanceled() {

    },
    deleteConfig() {
      if (!this.tableId) return;
      this.$confirm(`确定要删除 table 配置：${this.tableId}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.setting.tableConfigDelete({ id: this.tableId }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE });
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
