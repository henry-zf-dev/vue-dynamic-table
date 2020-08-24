<template>
  <div class="user-management-page" style="padding-top: 60px">
    <Breadcrumb :opt-data="breadcrumbOpts"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="userData"
          @filterChange="getUserList"
          @sortChanged="getUserList"
          @pageChanged="getUserList"
          @sizeChanged="getUserList">
          <div slot="empty">
            <EmptyContent :opt-data="userEmptyBtn"></EmptyContent>
          </div>
        </EZTable>
      </div>
      <el-dialog
        :visible.sync="showUserDialog"
        :title="isEditUser ? '编辑用户' : '新增用户'"
        width="500px"
        @close="userFormCancel">
        <UserOperation
          :user-form="userForm"
          :is-edit="isEditUser"
          @userFormCancel="userFormCancel"
          @userFormSubmit="getUserList"></UserOperation>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  checkRespCorrect,
  messageHandle,
  judgePermission,
  getTableState,
  updateTableState,
  assembleTableOptBtn, updatePageNo, getTableConfig, getTableCfgFromStorage
} from '../../../utils';
import { commonConfig, statusColorConfig, tableIdConfig, tableOptBtnConfig } from '../../../config/common';
import { msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import FormOptBtn from '../../../components/FormOptBtn';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import EmptyContent from '../../../components/EmptyContent';
import EZTable from '../../../components/table/EZTable';
import { routerMeta } from '../../../router/routerMeta';
import UserOperation from './partial/UserOperation';
import { updateRouteParamState } from '../../../modules/urlParamStoreHdl';

export default {
  name: 'UserManagement',
  components: {
    FormOptBtn,
    UserOperation,
    EmptyContent,
    Breadcrumb,
    EZTable
  },
  data() {
    return {
      userEmptyBtn: [
        // todo 新增用户按钮隐屏蔽
        {
          type: 'btn',
          label: '新增用户',
          icon: 'icon-tianjia',
          perm: permissionConfig.personnelUserManage,
          callback: () => {
            this.addUser();
          }
        }
      ],
      showUserDialog: false,
      isEditUser: false,
      tableId: tableIdConfig.user,
      filters: [],
      columnConfig: [],
      userData: [], // 用户列表数据源
      tableLoading: true, // 列表加载圈控制
      userFormRef: 'userFormRef', // 表单名字
      userFormRules: { // 非空验证
        username: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        roleNames: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        tel: [{ required: true, message: '请输入手机号码', trigger: 'blur' }]
      },
      userForm: {} // 新增编辑数据源
    };
  },
  computed: {
    breadcrumbOpts() {
      return [
        // todo 新增用户按钮隐屏蔽
        {
          type: 'btn',
          label: '新增用户',
          icon: 'icon-tianjia',
          perm: permissionConfig.personnelUserManage,
          callback: () => {
            this.addUser();
          }
        }
        // {
        //   type: 'btn',
        //   label: '用户导入',
        //   icon: 'icon-bendidaoru',
        //   perm: permissionConfig.personnelUserManage,
        //   callback: () => {}
        // }
      ];
    }
  },
  activated() {
    this.initTableConfig();
    this.getUserList();
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
              this.userDetail(data.id);
              break;
            case tableOptBtnConfig.edit.type:
              this.editUser(data);
              break;
            case tableOptBtnConfig.resetPwd.type:
              this.resetPWD(data);
              break;
            case tableOptBtnConfig.delete.type:
              this.deleteUser(data);
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
    userDetail(id) { // 跳转到详情界面
      this.$router.push({
        name: routerMeta.personnelUserDetail.name,
        params: {
          uid: id
        }
      });
    },
    getUserList() {
      this.tableLoading = true;
      this.showUserDialog = false;
      const { pageNo = 1, pageSize = 10, filters, sort } = getTableState(this.tableId);
      const params = {
        pageNo, pageSize, filters, sort
      };
      API.user.userList(params).then(resp => {
        this.tableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items, pageInfo = {} } = resp.data || {};
          this.userData = (items || []).map(item => {
            return {
              ...item,
              roleText: item.role ? item.role.name : '', // __.pluck((item.roles || []), 'name').join('、'),
              locationText: (item.locationList || []).join('、')
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
    userFormCancel() {
      this.showUserDialog = false;
      updateRouteParamState(this.$route.name, { role: '' });
    },
    addUser() { // 弹出新增界面
      this.showUserDialog = true;
      this.isEditUser = false;
      this.userForm = {
        roleNames: 0
      };
    },
    editUser(row) { // 编辑时传值给编辑界面
      this.showUserDialog = true;
      this.isEditUser = true;
      const ros = JSON.parse(JSON.stringify(row));
      this.userForm = {
        ...ros, roleNames: row.role ? row.role.id : 0
      };
      updateRouteParamState(this.$route.name, { role: row.id });
    },
    resetPWD(row) { // 重置密码
      this.$confirm('确认要重置用户' + row.username + '的登录密码吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.user.userResetPwd({ id: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.RESET_SAVE, msg: '用户密码重置成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(() => {
      });
    },
    deleteUser(row) { // 删除用户
      this.$confirm('确认要删除用户' + row.username + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.user.userDelete({ id: row.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '用户删除成功' });
            updatePageNo(this.tableId);
            this.initTableConfig();
            this.getUserList();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(() => {
      });
    }
  }
};
</script>

<style scoped lang="less">

</style>
