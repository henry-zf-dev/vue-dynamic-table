<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="userDetailForm.username"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="userInfo-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="baseInfoTableData">
                <el-table-column
                  prop="title"
                  width="320"
                  label="key">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <span class="header7 font-gray-40">{{ scope.row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </DetailPageLayout>
      </div>
    </div>
    <el-dialog
      :visible.sync="showUserDialog"
      width="500px"
      title="编辑用户"
      @close="userFormCancel">
      <UserOperation
        :user-form="userForm"
        :is-edit="true"
        @userFormCancel="userFormCancel"
        @userFormSubmit="getUserDetail"></UserOperation>
    </el-dialog>
  </div>
</template>

<script>
import { routerMeta } from '../../../router/routerMeta';
import { checkRespCorrect, judgePermission, messageHandle, momentTimeToString } from '../../../utils';
import { commonString, msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import UserOperation from './partial/UserOperation';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import DetailPageLayout from '../../../components/DetailPageLayout';

export default {
  name: 'UserDetail',
  components: {
    UserOperation, Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'userInfo-tab',
          label: '用户信息'
        }
      ],
      showUserDialog: false,
      userDetailForm: {},
      userId: '',
      userForm: {},
      baseInfoTableData: [
        {
          title: '账户',
          key: 'username',
          value: ''
        },
        {
          title: '姓名',
          key: 'actualName',
          value: ''
        },
        {
          title: '别名',
          key: 'nickname',
          value: ''
        },
        {
          title: '电话号码',
          key: 'tel',
          value: ''
        },
        {
          title: '邮箱',
          key: 'email',
          value: ''
        },
        {
          title: '工号',
          key: 'employeeId',
          value: ''
        },
        {
          title: '角色',
          key: 'roleName',
          value: ''
        }, {
          title: '管理区域',
          key: 'locationName',
          value: ''
        }
      ]
    };
  },
  computed: {
    subtitle() {
      return {
        ...this.userDetailForm,
        title: '用户',
        show: true
      };
    },
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '重设密码',
          icon: 'icon-zhongshemima',
          perm: permissionConfig.personnelUserManage,
          callback: () => {
            this.resetPWD();
          }
        },
        {
          type: 'btn',
          label: '编辑',
          icon: 'icon-bianji',
          perm: permissionConfig.personnelUserManage,
          callback: () => {
            this.editUser();
          }
        },
        {
          type: 'btn',
          label: '删除',
          icon: 'icon-shanchu',
          perm: permissionConfig.personnelUserDelete,
          callback: () => {
            this.deleteUser();
          }
        }
      ];
    }
  },
  created() {
    this.userId = this.$route.params.uid;
    this.getUserDetail();
  },
  methods: {
    judgePerm: judgePermission,
    goBack() {
      this.$router.push({
        name: routerMeta.personnelUser.name
      });
    },
    userFormCancel() {
      this.showUserDialog = false;
    },
    editUser() { // 编辑时给用户赋值
      this.showUserDialog = true;
      const ros = JSON.parse(JSON.stringify(this.userDetailForm));
      this.userForm = {
        ...ros, roleNames: ros.role.id
      };
    },
    getUserDetail() { // 根据ID查询用户详情
      this.pageLoading = true;
      this.showUserDialog = false;
      API.user.userDetail({ id: this.userId }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { role = {}, createdTime, updatedTime, locationList = [] } = resp.data;
          this.userDetailForm = {
            ...resp.data,
            isShow: true,
            roleName: role.name || commonString.unknown,
            createdTime: momentTimeToString(createdTime),
            updatedTime: momentTimeToString(updatedTime),
            locationName: locationList.join('、'),
            titleName: resp.data.username || ''
          };
          this.baseInfoTableData.forEach(item => {
            item.value = this.userDetailForm[item.key] || '';
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    resetPWD() { // 重置密码
      this.$confirm('确认要重置用户' + this.userDetailForm.username + '的登录密码吗?', '提示', {}).then(() => {
        API.user.userResetPwd({ id: this.userDetailForm.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.RESET_SAVE, msg: '用户密码重置成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    deleteUser() { // 删除用户
      this.$confirm('确认要删除用户' + this.userDetailForm.username + '吗?', '提示', {}).then(() => {
        API.user.userDelete({ id: this.userDetailForm.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '用户删除成功' });
            this.goBack();
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
