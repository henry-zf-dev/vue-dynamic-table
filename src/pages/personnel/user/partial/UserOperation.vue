<template>
  <el-form
    v-loading="userFromLoading"
    :ref="userFormRef"
    :model="userForm"
    :rules="userFormRules"
    size="medium"
    label-width="80px">
    <el-form-item label="账号" prop="username">
      <el-input :disabled="isEdit" v-model="userForm.username" type="text"></el-input>
    </el-form-item>
    <el-form-item label="姓名" prop="actualName">
      <el-input v-model="userForm.actualName" type="text"></el-input>
    </el-form-item>
    <el-form-item label="别名" prop="nickname">
      <el-input v-model="userForm.nickname" type="text"></el-input>
    </el-form-item>
    <el-form-item label="角色" prop="roleNames">
      <el-select v-model="userForm.roleNames" class="width-100" placeholder="请选择">
        <el-option
          v-for="item in roleData"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item prop="tel" label="手机">
      <el-input v-model="userForm.tel" type="text" placeholder="请输入手机"></el-input>
    </el-form-item>
    <el-form-item prop="email" label="邮箱">
      <el-input
        v-model="userForm.email"
        type="text"
        placeholder="输入邮箱"></el-input>
    </el-form-item>
    <FormOptBtn
      :is-in-dialog="true"
      @formCancel="closeDialog"
      @formSubmit="userSubmit"></FormOptBtn>
  </el-form>
</template>

<script>
import FormOptBtn from '../../../../components/FormOptBtn';
import {
  checkRespCorrect,
  messageHandle, paramsTrim
} from '../../../../utils';
import { rulesEmail, rulesTel } from '../../../../utils/validate';
import { commonConfig } from '../../../../config/common';
import { msgCode, msgContent } from '../../../../config/string';

export default {
  name: 'UserOperation',
  components: {
    FormOptBtn
  },
  props: {
    userForm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      roleData: [], // 角色数据源
      userFormRef: 'userFormRef', // 表单名字
      userFromLoading: false, // 新增编辑加载圈控制
      userFormRules: { // 非空验证
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '账号不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ],
        actualName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '姓名不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ],
        nickname: [
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '别名不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ],
        roleNames: [{ required: true, message: '请选择角色', trigger: 'change' }],
        tel: [{ required: true, message: '请输入手机', trigger: 'blur' }, {
          validator: rulesTel,
          trigger: 'blur'
        }],
        email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, {
          validator: rulesEmail,
          trigger: 'blur'
        }]
      }
    };
  },
  created() {
    this.roleAllLists();
  },
  methods: {
    closeDialog() { // 关闭新增编辑页面
      this.$emit('userFormCancel');
    },
    roleAllLists() { // 获取角色列表
      API.role.roleAll().then(resp => {
        if (checkRespCorrect(resp)) {
          // 新增时默认绑定基础角色
          if (resp.data.length > 0 && this.userForm.roleNames === 0) {
            this.userForm.roleNames = resp.data[0].id;
          }
          this.roleData = (resp.data || []).map(item => {
            return {
              value: item.id,
              label: item.name
            };
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    userSubmit() { // 确认新增编辑
      this.$refs[this.userFormRef].validate((valid) => {
        if (!valid) return;
        this.userFromLoading = true;
        const parMar = {
          username: this.userForm.username,
          tel: this.userForm.tel,
          nickname: this.userForm.nickname,
          roleId: this.userForm.roleNames,
          email: this.userForm.email,
          actualName: this.userForm.actualName
        };
        paramsTrim(parMar);
        if (!this.userForm.id && this.userForm.id !== 0) {
          API.user.userAdd(parMar).then(resp => {
            this.userFromLoading = false;
            if (checkRespCorrect(resp)) {
              this.$emit('userFormSubmit');
              messageHandle({ code: msgCode.ADD_SAVE, msg: '用户新增成功' });
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.userFromLoading = false;
            messageHandle({ code: msgContent.SYSTEM });
          });
        } else {
          const editParMar = {
            ...parMar,
            id: this.userForm.id
          };
          API.user.userEdit(editParMar).then(resp => {
            this.userFromLoading = false;
            if (checkRespCorrect(resp)) {
              messageHandle({ code: msgCode.HAS_SAVE, msg: '用户编辑成功' });
              this.$emit('userFormSubmit');
            } else {
              messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
            }
          }).catch(err => {
            this.userFromLoading = false;
            messageHandle({ code: msgCode.SYSTEM });
          });
        }
      });
    }
  }
};
</script>

<style scoped>

</style>
