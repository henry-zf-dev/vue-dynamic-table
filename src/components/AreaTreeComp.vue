<template>
  <div ref="asideMenuCompRef" class="aside-menu-comp">
    <div class="area-tree-header display-none" @click="clickHeader">
      <span class="area-tree-header-label mar-lft-5">{{ tenantConfig[tenant] }}</span>
      <div v-show="showMoreOpt" class="area-tree-header-more-icon">
        <el-dropdown trigger="click" @command="nodeMoreOptCommand">
          <i class="iconfont icon-gengduocaozuo"></i>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="item in headerMoreOptMenu"
              v-if="judgePerm(item.perm)"
              :class="item.class"
              :key="item.label"
              :command="item.value">
              <i :class="item.icon" class="font-size-second iconfont"></i>
              <span :class="item.color">{{ item.label }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="area-tree-header-container">
      <!--      <el-input-->
      <!--        v-model="areaSearchText"-->
      <!--        suffix-icon="iconfont icon-sousuo"-->
      <!--        placeholder="搜索区域（空格分割）"-->
      <!--      ></el-input>-->
      <div class="header3 font-color-primary">{{ tenantConfig[tenant] }}</div>
      <el-tooltip v-if="showMoreOpt" :open-delay="300" content="新增一级区域" placement="top">
        <el-button
          class="area-tree-header-btn iconfont icon-tianjia"
          @click="addRootArea">
        </el-button>
      </el-tooltip>
      <div class="area-tree-header-divider"></div>
    </div>
    <div class="aside-menu-content mar-top-5">
      <el-tree
        v-loading="areaTreeLoading"
        v-if="showAreaTree"
        :ref="areaTreeRef"
        :props="{label: 'name', isLeaf: 'leaf'}"
        :load="loadNode"
        :default-expanded-keys="expandedKey"
        :expand-on-click-node="true"
        :auto-expand-parent="true"
        :draggable="draggable"
        :highlight-current="true"
        lazy
        accordion
        node-key="id"
        @node-click="clickNode"
        @node-expand="clickNode">
        <span slot-scope="{node, data}" class="aside-menu-tree-node">
          <span class="iconfont icon-wenjianjia aside-menu-tree-node-icon"></span>
          <el-tooltip :content="node.label" :open-delay="800" placement="top-start">
            <div slot="content">
              <!--            &nbsp;&nbsp;({{node.data.roomCount || 0}})-->
              <span>{{ node.label }}</span>
            </div>
            <!--          ({{node.data.roomCount || 0}})-->
            <span class="aside-menu-tree-node-label mar-lft-5">{{ node.label }}</span>
          </el-tooltip>
          <div v-show="showMoreOpt" class="aside-menu-tree-more-icon">
            <el-dropdown trigger="click" @command="nodeMoreOptCommand">
              <div @click.stop="() => clickNode(data, node)">
                <span class="iconfont icon-zujiantubiao-gengduo"></span>
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  v-for="item in moreOptMenu"
                  v-if="judgePerm(item.perm)"
                  :class="item.class"
                  :key="item.label"
                  :command="item.value">
                  <i :class="item.icon" class="font-size-second iconfont"></i>
                  <span :class="item.color">{{ item.label }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </span>
      </el-tree>
    </div>

    <el-dialog
      :title="isEditArea ? '编辑区域' : '新增区域'"
      :visible.sync="showAreaDialog"
      width="500px">
      <el-form v-loading="areaFormLoading" :ref="areaFormRef" :model="areaForm" :rules="areaFormRules" size="medium">
        <el-form-item prop="name">
          <el-input v-model="areaForm.name" placeholder="输入名称"></el-input>
        </el-form-item>
        <div class="mar-top text-align-right">
          <el-button type="info" @click="areaFormCancel">取消</el-button>
          <el-button type="primary" @click="areaFormSubmit">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
    <el-dialog :visible.sync="showAreaAdminDialog" title="设置管理员" width="710px">
      <el-transfer
        v-model="selectAreaAdmin"
        :data="userData"
        :props="{key: 'id'}"
        :titles="['所有人员', '已选管理员']"
        :button-texts="['解除管理权限', '设置为管理员']">
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
        @formCancel="areaAdminFormCancel"
        @formSubmit="areaAdminFormSubmit"></FormOptBtn>
    </el-dialog>
  </div>
</template>

<script>
  import {tenant} from '../config/env';
  import {checkRespCorrect, deepCopyWithJson, judgePermission, messageHandle} from '../utils';
  import {commonConfig, tenantConfig} from '../config/common';
  import {permissionConfig} from '../config/permission';
  import {routerMeta} from '../router/routerMeta';
  import FormOptBtn from './FormOptBtn';
  import {msgCode, msgContent} from '../config/string';
  import {updateRouteParamState} from '../modules/urlParamStoreHdl';
  import {mapState} from 'vuex';

  const elementResizeDetectorMaker = require('element-resize-detector');

  export default {
    name: 'AreaTreeComp',
    components: {
      FormOptBtn
    },
    model: {
      event: 'change'
    },
    props: {
      draggable: {
        type: Boolean,
        default: false
      },
      showMoreOpt: {
        type: Boolean,
        default: true
      },
      // 当 area 更改后是否更新 routeParam 全局状态
      ignoreRouteCtr: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        tenant: tenant,
        tenantConfig: tenantConfig,
        permConfig: permissionConfig,
        userData: [],
        areaTreeLoading: false,
        headerMoreOptMenu: [
          {
            label: '导出房间',
            value: 'roomExport',
            icon: 'iconfont icon-xiazaimoban',
            perm: permissionConfig.managementAreaExportRoom
          },
          {
            label: '导入房间',
            value: 'roomImport',
            icon: 'iconfont icon-bendidaoru',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '下载房间模板',
            value: 'roomTempDownload',
            class: 'border-bottom-96',
            icon: 'iconfont icon-xiazaimoban',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '新增子层',
            value: 'addSubArea',
            icon: 'iconfont icon-xinzengziceng',
            perm: permissionConfig.managementAreaManage
          }
        ],
        moreOptMenu: [
          {
            label: '新增子层',
            value: 'addSubArea',
            icon: 'icon-xinzengziceng',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '新增房间',
            value: 'addRoom',
            icon: 'icon-tianjia',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '设置管理员',
            value: 'setAdmin',
            icon: 'icon-nav-yonghuliebiao',
            class: 'border-bottom-96',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '重命名',
            value: 'rename',
            icon: '',
            perm: permissionConfig.managementAreaManage
          },
          {
            label: '删除',
            value: 'delete',
            icon: '',
            color: 'font-color-danger',
            perm: permissionConfig.managementAreaDelete
          }
        ],

        // el-tree 组件数据源
        showAreaTree: true, // 用于<keep-alive>组件重新请求数据
        areaTreeRef: 'areaTreeRef',
        areaSearchText: '',
        areaTreeData: [],
        expandedKey: [],
        currentNodeData: {}, // 当前选中的节点数据
        currentNode: {}, // 当前选中的节点对象，用于懒加载前提下的 tree 数据更新
        rootNode: null, // 用于在根节点新增子节点后，懒加载方法重新执行
        treeLoadResolve: null,
        hasAreaInUrl: false, // 标志 URL 上是否存有区域信息，用于判断是否要默认展开
        lastAreaInUrl: 0, // 记录 URL 上最后一级区域 id

        // 新增/编辑区域
        showAreaDialog: false,
        areaFormLoading: false,
        isEditArea: false,
        areaForm: {},
        areaFormRef: 'areaFormRef',
        areaFormRules: {
          name: [{required: true, message: '请输入区域名称', trigger: 'blur'},
            {
              max: commonConfig.formMaxLength.inputMax,
              message: '区域名称不能超过' + commonConfig.formMaxLength.inputMax + '个字符',
              trigger: 'blur'
            }]
        },

        // 设置管理员
        showAreaAdminDialog: false,
        selectAreaAdmin: []
      };
    },
    computed: {
      ...mapState(['routeParamState'])
    },
    activated() {
      this.showAreaTree = true;
      this.initAreaForm();
      this.getCurrentNodeFromState();
    },
    deactivated() {
      this.showAreaTree = false;
    },
    mounted() {
      const areaTreeComp = this.$refs['asideMenuCompRef'];
      if (!areaTreeComp) return;
      const erd = elementResizeDetectorMaker();
      erd.listenTo(areaTreeComp, (element) => {
        this.$emit('change', element.offsetWidth, element.offsetHeight);
      });
    },
    methods: {
      judgePerm: judgePermission,
      getUserData() {
        API.user.userAll().then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = []} = resp;
            this.userData = data.map(u => {
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
      // 从 routeParamState 中取当前选择的区域
      getCurrentNodeFromState() {
        if (this.ignoreRouteCtr) return;
        this.expandedKey = [];
        const {areaPath = ''} = this.routeParamState[this.$route.name] || {};
        const path = areaPath.split('/') || [];
        if (!areaPath || !path.length) {
          // 如果 URL 中没有区域参数，则回调区域默认值：0，查询所有会议室
          this.setCurrentNode(null);
        } else {
          path.forEach(p => {
            this.expandedKey.push(parseInt(p));
          });
          this.hasAreaInUrl = true;
          this.lastAreaInUrl = parseInt(__.last(path));
        }
      },

      // 主动设置当前选中的 node
      setCurrentNode(id, clear = false) {
        if (!this.$refs[this.areaTreeRef]) return;
        this.$refs[this.areaTreeRef].setCurrentKey(id);
        this.$emit('currentNodeChange', id || 0, clear);
      },
      // 在唯一标志为 key 的父节点下新增一个节点
      appendNode(data, key) {
        if (key === 0) {
          this.reloadNode();
        } else {
          if (!this.$refs[this.areaTreeRef]) return;
          this.$refs[this.areaTreeRef].append({...data, leaf: true}, key);
        }
      },
      // 删除唯一标志为 key 的节点
      removeNode(key) {
        if (!this.$refs[this.areaTreeRef]) return;
        this.$refs[this.areaTreeRef].remove(key);
      },
      // currentNodeData 判空
      judgeCurrentNode() {
        if (!this.currentNodeData || !this.currentNodeData.id) {
          this.$notify({
            message: '请先选则区域！',
            type: 'warning',
            duration: 3000
          });
          return false;
        }
        return true;
      },
      getAreaByPid(pid) {
        const self = this;
        return new Promise(function(resolve, reject) {
          self.areaTreeLoading = true;
          API.area.areaByPid({pid: pid || 0}).then(resp => {
            self.areaTreeLoading = false;
            if (checkRespCorrect(resp)) {
              resolve(resp.data || []);
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
              reject();
            }
          }).catch(err => {
            self.areaTreeLoading = false;
            messageHandle({code: msgCode.SYSTEM});
            reject();
          });
        });
      },
      loadNode(node, resolve) {
        const {level = 0, data = {}} = node;
        this.getAreaByPid(data.id).then((area = []) => {
          if (level === 0) {
            this.rootNode = node;
            this.treeLoadResolve = resolve;
          }
          if (this.hasAreaInUrl) {
            if (this.lastAreaInUrl === data.id) {
              // 只有在当前加载的区域节点是 URL 中的最后一级，才设置当前选中的节点
              // 非手动触发，自动绑定，不清空 tableState Henry 2020-06-16 11:38:50
              this.setCurrentNode(data.id, false);
            }
          } else {
            if (level === 0) {
              // 如果当前没有默认展开项，则默认展开第一层级的节点
              this.expandedKey = __.pluck(area, 'id');
              this.currentNodeData = {id: 0};
              this.setCurrentNode(null);
            }
          }
          resolve(area.map(a => {
            return {
              ...a,
              leaf: a.hasChild === 'N'
            };
          }));
        }).catch(err => {
          resolve([]);
        });
      },
      reloadNode() {
        if (!this.rootNode) return;
        this.rootNode.childNodes = [];
        this.loadNode(this.rootNode, this.treeLoadResolve);
      },
      clickNode(nodeData, node) {
        this.currentNode = node;
        this.currentNodeData = nodeData;
        this.setCurrentNode(nodeData.id, true);
        const {locationIds = []} = nodeData;
        const destPath = [];
        locationIds.forEach(sp => {
          if (parseInt(sp) > 0) {
            destPath.push(parseInt(sp));
          }
        });
        destPath.push(nodeData.id);
        !this.ignoreRouteCtr && updateRouteParamState(this.$route.name, {areaPath: destPath.join('/')});
      },

      // 区域更多操作相关
      clickHeader() {
        this.currentNodeData = {id: 0};
        // 手动触发，清空 tableState Henry 2020-06-16 11:38:50
        this.setCurrentNode(null, true);
        !this.ignoreRouteCtr && updateRouteParamState(this.$route.name, {areaPath: ''});
      },
      addRootArea() {
        this.resetAreaForm();
        this.showAreaDialog = true;
        this.isEditArea = false;
        this.currentNodeData = {id: 0};
      },
      nodeMoreOptCommand(command) {
        const area = deepCopyWithJson(this.currentNodeData);
        const {id, name = '', userIds = []} = area;
        switch (command) {
          case 'rename':
            this.showAreaDialog = true;
            this.areaForm = area;
            this.isEditArea = true;
            break;
          case 'delete':
            this.$confirm(`删除${name}后将清空该层级下所有的子层及房间，请谨慎操作！`, '确认删除?', {
              confirmButtonText: '确定',
              cancelButtonText: '取消'
            }).then(() => {
              API.area.areaDelete({id: id}).then((resp) => {
                if (checkRespCorrect(resp)) {
                  messageHandle({code: msgCode.DEL_SAVE, msg: '区域删除成功'});
                  // 删除区域成功后 currentNodeData 置空
                  this.currentNodeData = {id: 0};
                  this.setCurrentNode(null);
                  !this.ignoreRouteCtr && updateRouteParamState(this.$route.name, {areaPath: ''});
                  this.removeNode(id);
                } else {
                  messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
                }
              }).catch(err => {
                messageHandle({code: msgCode.SYSTEM});
              });
            }).catch(() => {
            });
            break;
          case 'addSubArea':
            this.resetAreaForm();
            this.showAreaDialog = true;
            this.isEditArea = false;
            break;
          case 'addRoom':
            this.$router.push({name: routerMeta.managementRoomAdd.name, params: {lid: this.currentNodeData.id || 0}});
            break;
          case 'roomExport':
            this.$emit('roomExport');
            break;
          case 'roomImport':
            this.$emit('roomImport');
            break;
          case 'roomTempDownload':
            this.$emit('roomTempDownload');
            break;
          case 'setAdmin':
            this.getUserData();
            this.selectAreaAdmin = userIds;
            this.showAreaAdminDialog = true;
            break;
          default:
            break;
        }
      },

      // 新增/编辑区域
      initAreaForm() {
        this.areaForm = {
          id: '',
          pid: '',
          name: '',
          roleIds: [],
          remark: '',
          userIds: []
        };
      },
      resetAreaForm() {
        this.initAreaForm();
        this.$refs[this.areaFormRef] && (this.$refs[this.areaFormRef].resetFields());
      },
      areaFormCancel() {
        this.showAreaDialog = false;
      },
      areaFormSubmit() {
        this.$refs[this.areaFormRef].validate((valid) => {
          if (valid) {
            if (!this.isEditArea) {
              const parMer = {
                pid: this.currentNodeData.id || 0,
                name: this.areaForm.name
              };
              API.area.areaAdd(parMer).then((resp) => {
                if (checkRespCorrect(resp)) {
                  this.showAreaDialog = false;
                  this.resetAreaForm();
                  this.appendNode(resp.data, parMer.pid);
                  messageHandle({code: msgCode.ADD_SAVE, msg: '区域新增成功'});
                } else {
                  messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
                }
              }).catch(err => {
                messageHandle({code: msgCode.SYSTEM});
              });
            } else {
              const editParam = {
                id: this.areaForm.id,
                pid: this.areaForm.pid,
                name: this.areaForm.name
              };
              this.areaApiHandle(editParam, '区域编辑成功');
            }
          }
        });
      },

      // 设置管理员
      areaAdminFormCancel() {
        this.showAreaAdminDialog = false;
      },
      areaAdminFormSubmit() {
        if (!this.judgeCurrentNode()) return;
        const {id, pid, name = ''} = this.currentNodeData;
        const editParam = {
          id, pid, name,
          userIds: this.selectAreaAdmin
        };
        API.area.areaSetAdmin(editParam).then((resp) => {
          if (checkRespCorrect(resp)) {
            this.showAreaAdminDialog = false;
            // 更改当前选中的节点对象的数据源，让页面动态更改
            this.currentNode.data = {
              ...this.currentNode.data,
              ...editParam
            };
            messageHandle({code: msgCode.EDIT_SAVE, msg: `${name} 区域设置管理员成功`});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },

      // 区域新增/编辑统一接口
      areaApiHandle(editParam, msg) {
        API.area.areaEdit(editParam).then((resp) => {
          if (checkRespCorrect(resp)) {
            this.showAreaDialog = false;
            this.showAreaAdminDialog = false;
            // 更改当前选中的节点对象的数据源，让页面动态更改
            this.currentNode.data = {
              ...this.currentNode.data,
              ...editParam
            };
            messageHandle({code: msgCode.EDIT_SAVE, msg: msg});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      }
    }
  };
</script>

<style scoped>

</style>
