<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="roleInfo.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="rolePerm-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="roleInfo.permListTree">
                <el-table-column
                  prop="label"
                  width="320"
                  label="label">
                  <template slot-scope="scope">
                    <i class="iconfont icon-jiancexiang font-gray-60"></i>
                    <span class="mar-lft-5">{{ scope.row.label }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <span class="header7 font-gray-40">{{ scope.row.childrenName }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div slot="roleMember-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="baseInfoTableData">
                <el-table-column
                  prop="title"
                  width="320"
                  label="key">
                  <template slot-scope="scope">
                    <i class="iconfont icon-nav-yonghuliebiao font-gray-60"></i>
                    <span class="mar-lft-5">{{ scope.row.title }}</span>
                  </template>
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
      v-loading="roleFormLoading"
      :title="isEditRole ? '编辑角色' : '新增角色'"
      :visible.sync="showRoleDialog"
      width="500px">
      <el-form
        :model="roleForm"
        :rules="roleFormRules"
        :ref="roleFormRef"
        size="medium"
        label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请填写角色名称"></el-input>
        </el-form-item>
        <MultipleSelector
          :is-tree="true"
          :show-required="true"
          :src-data="permData"
          :select-data="selectPerm"
          title="角色权限"
          unit="项"></MultipleSelector>
      </el-form>
      <FormOptBtn
        :is-in-dialog="true"
        class="mar-top-20"
        @formCancel="roleFormCanceled"
        @formSubmit="roleFormSubmitted"></FormOptBtn>
    </el-dialog>
  </div>
</template>

<script>
import { routerMeta } from '../../../router/routerMeta';
import {
  checkRespCorrect,
  messageHandle,
  judgePermission,
  assembleTreeFromArray,
  deepCopyWithJson, momentTimeToString
} from '../../../utils';
import { momentFormat, commonConfig } from '../../../config/common';
import { msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import MultipleSelector from '../../../components/MultipleSelector';
import FormOptBtn from '../../../components/FormOptBtn';
import DetailPageLayout from '../../../components/DetailPageLayout';

export default {
  name: 'RoleDetail',
  components: {
    Breadcrumb,
    MultipleSelector,
    FormOptBtn,
    DetailPageLayout
  },
  data() {
    return {
      commonConfig: commonConfig,
      breadcrumbHeight: 0,
      pageLoading: true,
      pageTabs: [
        {
          value: 'rolePerm-tab',
          label: '角色权限'
        },
        {
          value: 'roleMember-tab',
          label: '角色成员'
        }
      ],
      baseInfoTableData: [
        {
          title: '成员',
          key: 'userList',
          value: ''
        }
      ],
      roleInfo: {},
      roleDetailForm: {},
      roleId: '',
      selPerms: [],
      selUsers: [],
      selAreas: [],

      // 角色基础新增/编辑相关
      showRoleDialog: false,
      roleFormLoading: false,
      isEditRole: false,
      roleFormRef: 'roleFormRef',
      roleFormRules: {
        name: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          {
            max: commonConfig.formMaxLength.inputMax,
            message: '角色名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
            trigger: 'blur'
          }
        ]
      },
      roleForm: {},
      permData: [],
      selectPerm: []

    };
  },
  computed: {
    subtitle() {
      return {
        ...this.roleInfo,
        title: '角色',
        show: true
      };
    },
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '编辑',
          icon: 'icon-bianji',
          perm: permissionConfig.personnelRoleManage,
          callback: () => {
            this.editRole();
          }
        },
        {
          type: 'btn',
          label: '删除',
          icon: 'icon-shanchu',
          perm: permissionConfig.personnelRoleDelete,
          callback: () => {
            this.deleteRole();
          }
        }
      ];
    }
  },
  created() {
    this.roleId = this.$route.params.rid;
    this.getAllPermission();
    this.getRoleDetail();
  },
  methods: {
    judgePerm: judgePermission,
    goBack() { // 返回上一页
      this.$router.push({
        name: routerMeta.personnelRole.name
      });
    },
    getRoleDetail() {
      this.pageLoading = true;
      API.role.roleDetail({ id: this.roleId }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.roleInfo = {
            ...data,
            createdTime: momentTimeToString(resp.data.createdTime),
            updatedTime: momentTimeToString(resp.data.updatedTime)
          };
          // todo 详情的权限先显示两层 2020-05-13 19:55:30
          const permListTree = assembleTreeFromArray({
            srcData: data.permList || []
          }) || [];
          this.roleInfo.permListTree = permListTree.map(item => {
            return {
              ...item,
              childrenName: __.pluck((item.children || []), 'name').join('、')
            };
          });
          // todo 详情的角色只显示名称
          this.baseInfoTableData.forEach(item => {
            item.value = __.pluck((this.roleInfo.userList || []), 'actualName').join('、');
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    editRole() {
      const role = deepCopyWithJson(this.roleInfo);
      this.isEditRole = true;
      this.roleForm = role;
      this.showRoleDialog = true;
      this.selectPerm = role.permList || [];
    },
    deleteRole() {
      this.$confirm(`确定要删除角色：${this.roleInfo.name}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.role.roleDelete({ id: this.roleInfo.roleId }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '角色删除成功' });
            this.goBack();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(() => {
      });
    },

    // 依赖数据源
    getAllPermission() {
      API.role.permissionAll().then(resp => {
        if (checkRespCorrect(resp)) {
          this.permData = resp.data || [];
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 角色基础新增/编辑相关
    initRoleForm() {
      this.roleForm = {
        name: ''
      };
      this.selectPerm = [];
    },
    resetRoleForm() {
      this.initRoleForm();
      this.$refs[this.roleFormRef] && (this.$refs[this.roleFormRef].resetFields());
    },
    addRole() {
      if (this.isEditRole) {
        this.resetRoleForm();
      }
      this.showRoleDialog = true;
      this.isEditRole = false;
    },
    roleFormCanceled() {
      this.showRoleDialog = false;
      this.resetRoleForm();
    },
    roleFormSubmitted() {
      this.$refs[this.roleFormRef].validate((valid) => {
        if (!valid) return;
        const params = {
          id: this.roleId,
          name: this.roleForm.name,
          permList: this.selectPerm || []
        };
        this.roleFormLoading = true;
        API.role.roleEdit(params).then(resp => {
          this.roleFormLoading = false;
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '角色编辑成功' });
            this.showRoleDialog = false;
            this.initRoleForm();
            this.getRoleDetail();
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          this.roleFormLoading = false;
          messageHandle({ code: msgCode.SYSTEM });
        });
      });
    }

  }
};
</script>

<style scoped>

</style>
