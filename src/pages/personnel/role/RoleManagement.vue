<template>
  <div class="role-management-page" style="padding-top: 60px">
    <Breadcrumb :opt-data="breadcrumbOpts"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="roleTableData"
          :custom-empty="true"
          @filterChange="getRoleList"
          @pageChanged="getRoleList"
          @sizeChanged="getRoleList">
          <div slot="empty">
            <EmptyContent :opt-data="roleEmptyBtn"></EmptyContent>
          </div>
        </EZTable>
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
            id="roleMultipleSelect"
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
      <el-dialog
        v-loading="roleAssignLoading"
        :visible.sync="showRoleAssignDialog"
        title="分配人员"
        width="682px">
        <div class="font-color-danger mar-btm-10">* 对于已有角色的用户，用户原角色会被当前角色替换！</div>
        <el-transfer
          v-model="selectUser"
          :data="userData"
          :props="{key: 'id'}"
          :titles="['所有人员', '已分配人员']"
          :button-texts="['取消分配', '分配人员']">
          <el-tooltip
            slot-scope="{ option }"
            :open-delay="800"
            :visible-arrow="false"
            placement="top-start">
            <div slot="content">
              <span>{{ option.actualName || '--' }} {{ option.employeeId || '--' }} {{ option.roleName || '--' }}</span>
            </div>
            <div>
              <span>{{ option.actualName || '--' }}</span>
              <span>{{ option.employeeId || '--' }}</span>
              <span>{{ option.roleName || '--' }}</span>
            </div>
          </el-tooltip>
        </el-transfer>
        <FormOptBtn
          :is-in-dialog="true"
          class="mar-top-20"
          @formCancel="roleAssignFormCanceled"
          @formSubmit="roleAssignFormSubmitted"></FormOptBtn>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import {_} from 'vue-underscore';
  import {
    checkRespCorrect,
    deepCopyWithJson,
    messageHandle,
    getTableState,
    updateTableState,
    updatePageNo,
    assembleTableOptBtn, getTableConfig, paramsTrim, getTableCfgFromStorage
  } from '../../../utils';
  import {commonConfig, tableIdConfig, tableOptBtnConfig} from '../../../config/common';
  import {msgCode, msgContent} from '../../../config/string';
  import {permissionConfig} from '../../../config/permission';
  import {judgePermission} from '../../../utils';
  import {routerMeta} from '../../../router/routerMeta';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import EmptyContent from '../../../components/EmptyContent';
  import MultipleSelector from '../../../components/MultipleSelector';
  import FormOptBtn from '../../../components/FormOptBtn';
  import EZTable from '../../../components/table/EZTable';
  import {updateRouteParamState} from '../../../modules/urlParamStoreHdl';

  export default {
    name: 'RoleManagement',
    components: {
      MultipleSelector, FormOptBtn,
      Breadcrumb, EZTable, EmptyContent
    },
    data() {
      return {
        commonConfig: commonConfig,
        roleEmptyBtn: [
          {
            type: 'btn',
            label: '新增角色',
            icon: 'icon-tianjia',
            perm: permissionConfig.personnelRoleManage,
            callback: () => {
              this.addRole();
            }
          }
        ],
        // 依赖数据源
        permData: [],
        userData: [],

        // table 相关
        tableId: tableIdConfig.role,
        filters: [],
        columnConfig: [],
        tableOptBtn: [],
        tableLoading: true,
        roleTableData: [],

        // 角色基础新增/编辑相关
        showRoleDialog: false,
        roleFormLoading: false,
        isEditRole: false,
        roleFormRef: 'roleFormRef',
        roleFormRules: {
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '角色名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }
          ]
        },
        roleForm: {},
        selectPerm: [],

        // 角色分配人员
        showRoleAssignDialog: false,
        roleAssignLoading: false,
        selectUser: [],
        tooltipOptions: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [10, 10]
              }
            },
            {
              name: 'computeStyles',
              options: {
                gpuAcceleration: false
              }
            }
          ]
        }
      };
    },
    computed: {
      breadcrumbOpts() {
        return [
          {
            type: 'btn',
            label: '新增角色',
            icon: 'icon-tianjia',
            perm: permissionConfig.personnelRoleManage,
            callback: (command) => {
              this.addRole(command);
            }
          }
        ];
      }
    },
    activated() {
      this.initTableConfig();
      this.initRoleForm();
      this.getRoleList();
    },
    methods: {
      judgePerm: judgePermission,
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
      getAllUserData() {
        API.user.userAll().then(resp => {
          if (checkRespCorrect(resp)) {
            this.userData = (resp.data || []).map(u => {
              const {role = {}} = u;
              return {...u, roleName: role.name};
            });
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },

      // table 相关
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.clickOperateBtn('detail', data);
                break;
              case tableOptBtnConfig.edit.type:
                this.clickOperateBtn('edit', data);
                break;
              case tableOptBtnConfig.allocate.type:
                this.clickOperateBtn('assign', data);
                break;
              case tableOptBtnConfig.delete.type:
                this.clickOperateBtn('delete', data);
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
      getRoleList() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort
        };
        API.role.roleList(params).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {data = {pageInfo: {}}} = resp;
            this.roleTableData = (data.items || []).map(item => {
              return {
                ...item,
                permNameText: __.pluck(item.permList, 'name').join('、'),
                userNameText: __.pluck(item.userList, 'actualName').join('、')
              };
            });
            updateTableState(this.tableId, {total: data.pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      clickOperateBtn(operation, row) {
        const role = deepCopyWithJson(row);
        updateRouteParamState(this.$route.name, {role: role.id});
        switch (operation) {
          case 'detail':
            this.showRoleDetail(role);
            break;
          case 'edit':
            this.getAllPermission();
            // 弹出编辑窗体及赋值
            this.showRoleDialog = true;
            this.isEditRole = true;
            this.roleForm = role;
            this.selectPerm = role.permList || [];
            console.log('##### selectPerm #####', this.selectPerm);
            break;
          case 'assign':
            this.getAllUserData();
            // 弹出分配人员窗体及赋值
            this.showRoleAssignDialog = true;
            this.roleForm = role;
            this.selectUser = __.pluck(role.userList, 'id') || [];
            break;
          case 'delete':
            this.$confirm(`确定要删除角色：${role.name}?`, '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              API.role.roleDelete({id: role.id}).then(resp => {
                if (checkRespCorrect(resp)) {
                  messageHandle({code: msgCode.DEL_SAVE, msg: '角色删除成功'});
                  updatePageNo(this.tableId);
                  this.initTableConfig();
                  this.getRoleList();
                  this.resetRoleForm();
                } else {
                  messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
                }
              }).catch(err => {
                messageHandle({code: msgCode.SYSTEM});
              });
            }).catch(() => {
            });
            break;
          default:
            break;
        }
      },
      showRoleDetail(row) { // 角色详情
        updateRouteParamState(this.$route.name, {role: ''});
        this.$router.push({
          name: routerMeta.personnelRoleDetail.name,
          params: {
            rid: row.id
          }
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
        this.getAllPermission();
        if (this.isEditRole) {
          this.resetRoleForm();
        }
        this.showRoleDialog = true;
        this.isEditRole = false;
      },
      roleFormCanceled() {
        this.showRoleDialog = false;
        this.resetRoleForm();
        updateRouteParamState(this.$route.name, {role: ''});
      },
      roleFormSubmitted() {
        this.$refs[this.roleFormRef].validate((valid) => {
          if (!valid) return;
          const params = {
            id: this.roleForm.id,
            name: this.roleForm.name,
            permList: this.selectPerm || []
          };
          this.roleFormLoading = true;
          paramsTrim(params);
          if (!this.isEditRole) {
            API.role.roleAdd(params).then(resp => {
              this.roleFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.ADD_SAVE, msg: '角色新增成功'});
                this.showRoleDialog = false;
                this.initRoleForm();
                this.getRoleList();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.roleFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
            });
          } else {
            API.role.roleEdit(params).then(resp => {
              this.roleFormLoading = false;
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.EDIT_SAVE, msg: '角色编辑成功'});
                this.showRoleDialog = false;
                this.initRoleForm();
                this.getRoleList();
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              this.roleFormLoading = false;
              messageHandle({code: msgCode.SYSTEM});
            });
          }
        });
      },

      // 角色分配人员
      selectChange(node) {
        const {id, role = {}} = node;
        if (role.hasOwnProperty('id')) {
          const idx = this.selectUser.indexOf(id);
          if (this.roleForm.id !== role.id) {
            this.$confirm(`当前用户已分配角色:${role.name}，确认要重新分配吗?`, '角色分配提示', {
              btn: ['确定', '取消']
            }).then(() => {
            }).catch(err => {
              this.selectUser.splice(idx, 1);
            });
          }
        }
      },
      roleAssignFormCanceled() {
        updateRouteParamState(this.$route.name, {role: ''});
        this.showRoleAssignDialog = false;
        this.selectUser = [];
      },
      roleAssignFormSubmitted() {
        const params = {
          id: this.roleForm.id,
          users: this.selectUser || []
        };
        this.roleAssignLoading = true;
        API.role.roleAssign(params).then(resp => {
          this.roleAssignLoading = false;
          if (checkRespCorrect(resp)) {
            messageHandle({code: msgCode.EDIT_SAVE, msg: '角色分配人员成功'});
            this.showRoleAssignDialog = false;
            this.getRoleList();
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          this.roleAssignLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      }

    }
  };
</script>

<style scoped lang="less">

</style>
