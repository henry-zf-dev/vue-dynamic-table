<template>
  <div>
    <div :style="{height: '60px'}" class="head-container">
      <div class="color-gray-20 head-content">
        <i
          :class="menuCollapsed ? 'iconfont icon-zujiantubiao-xinxijiegou-xiangyou' : 'iconfont icon-nav-shouqi'"
          class="header-collapse-icon cursor-pointer font-size-20 font-gray-70"
          @click="collapseChanged"></i>
        <img class="header-logo" src="../assets/img/logo-green.png">
        <div class="header-right-container">
          <!--          <img class="user-thumbnail" src="../assets/img/one-authority.png"/>-->
          <!--          todo 目前后台还没有传姓名过来，先用账号代替-->
          <TableCircle :size="28" :title="userInfo.username" color="color-primary"></TableCircle>
          <el-dropdown trigger="hover" class="cursor-pointer pad-lft-10" @command="headerMoreOptCommand">
            <span class="el-dropdown-link font-size-main font-gray-90">
              {{ userInfo.username }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu>
              <el-dropdown-item disabled class="body-role" command="modifyPwd">
                <span class="role-size">{{ userInfo.userRole.name || commonString.unknown }}</span>
              </el-dropdown-item>
              <el-dropdown-item disabled class="body-user">
                <el-row>
                  <el-col :span="24">
                    <span class="user-name-size">{{ userInfo.username }}</span>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="24">
                    <span class="email-size">{{ userInfo.userEmail?(userInfo.userEmail.length>18?userInfo.userEmail.substring(0,15)+'...':userInfo.userEmail):'' }}</span>
                  </el-col>
                </el-row>
              </el-dropdown-item>
              <el-divider></el-divider>
              <el-dropdown-item command="modifyPwd">修改密码</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div
      v-loading="menuLoading"
      :style="{top: '60px', width: menuCollapsed ? '64px' : '250px'}"
      class="color-bg-dark aside-container"
      element-loading-background="rgba(0, 0, 0, 0.4)">
      <el-menu
        :collapse="menuCollapsed"
        :collapse-transition="false"
        :default-openeds="submenuOpenKey"
        @open="submenuOpen"
        @close="submenuClose">
        <div v-for="(router, idx) in menuData" :key="idx">
          <el-submenu :index="`${router.name}`">
            <template slot="title">
              <i
                :class="[router.meta.icon, {'active-submenu-icon' : judgeIconActive(router, true)}]"
                class="iconfont"></i>
              <span v-if="!menuCollapsed">
                <span slot="title" class="mar-lft-10">{{ router.meta.label }}</span>
                <i
                  :class="[submenuOpenKey.includes(router.name) ? 'collapse-icon-inactive' : 'collapse-icon-active']"
                  class="iconfont submenu-collapse-icon icon-zujiantubiao-xinxijiegou-xiangxia"
                ></i>
              </span>
            </template>
            <el-menu-item
              v-for="(subRouter, idx) in router.children"
              :key="idx"
              :class="{'active-menu-item' : judgeIconActive(subRouter), 'menu-item-collapse': menuCollapsed}">
              <router-link :to="subRouter.path">
                <span class="mar-rgt">{{ subRouter.meta.label }}</span>
              </router-link>
            </el-menu-item>
          </el-submenu>
        </div>
      </el-menu>
      <div v-if="!menuCollapsed" class="version_div color-bg-dark">
        <span>版本号: {{ version }}</span>
      </div>
    </div>
    <div
      :style="{top: '60px', bottom: 0, left: menuCollapsed ? '65px' : '251px', right: 0}"
      class="root-container">
      <router-view></router-view>
    </div>
    <el-dialog :visible.sync="showModifyPwdDialog" title="修改密码" width="500px" @close="modifyPwdCancel">
      <el-form :model="modifyPwdForm" :ref="modifyRef" :rules="modifyPwdFormRule" size="medium" label-width="100px">
        <el-form-item prop="oldPwd" label="原密码">
          <el-input v-model="modifyPwdForm.oldPwd" type="password" placeholder="请输入原密码"></el-input>
        </el-form-item>
        <el-form-item prop="newPwd" label="新密码">
          <el-input v-model="modifyPwdForm.newPwd" type="password" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPwd" label="确认密码">
          <el-input v-model="modifyPwdForm.confirmPwd" type="password" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
        <FormOptBtn
          :is-in-dialog="true"
          @formCancel="modifyPwdCancel"
          @formSubmit="modifyPwdSubmit"></FormOptBtn>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import {commonString, msgCode, msgContent} from '../config/string';
  import {clearStorage, getStorage, StorageKey} from '../config/sessions';
  import {checkRespCorrect, getUserInfo, messageHandle} from '../utils';
  import store from '../store/index';
  import {routerMeta} from '../router/routerMeta';
  import FormOptBtn from '../components/FormOptBtn';
  import {mapState} from 'vuex';
  import {clearUrlParam, getUrlParam, setUrlParam, updateRouteParamState} from '../modules/urlParamStoreHdl';
  import TableCircle from '../components/table/TableCircle.vue';

  export default {
    components: {
      FormOptBtn, TableCircle
    },
    data() {
      return {
        commonString: commonString,
        userInfo: getUserInfo(),
        menuLoading: true,
        menuCollapsed: false,
        submenuOpenKey: [], // 记录所有展开了的子菜单
        menuData: [],
        showModifyPwdDialog: false,
        systemSetting: false,
        modifyRef: 'modifyRef',
        modifyPwdForm: {},
        modifyPwdFormRule: {
          oldPwd: [
            {required: true, message: '请输入原密码', trigger: 'blur'}
          ],
          newPwd: [
            {required: true, message: '请输入新密码', trigger: 'blur'},
            {
              validator: (rule, value, callback) => {
                const {confirmPwd = ''} = this.modifyPwdForm;
                if (confirmPwd && value !== confirmPwd) {
                  callback(new Error('两次新密码输入不一致，请重新输入'));
                } else {
                  callback();
                }
              },
              trigger: 'blur'
            }
          ],
          confirmPwd: [
            {required: true, message: '请再次输入新密码', trigger: 'blur'},
            {
              validator: (rule, value, callback) => {
                const {newPwd = ''} = this.modifyPwdForm;
                if (newPwd && value !== newPwd) {
                  callback(new Error('两次新密码输入不一致，请重新输入'));
                } else {
                  callback();
                }
              },
              trigger: 'blur'
            }
          ]
        },
        version: 'v1.0.1'
      };
    },
    computed: {
      ...mapState([
        'routeParamState', 'clientWidth', 'clientHeight'
      ])
    },
    watch: {
      $route(to = {}, from = {}) {
        this.setUrlParamFromState();
        this.refreshStore(from, to);
      },
      clientWidth: {
        handler() {
          this.menuWidth();
        },
        immediate: true
      },
      menuCollapsed: {
        handler(val) {
          this.$store.commit('updateAsideMenuCollapsed', val);
        },
        immediate: true
      },
      routeParamState() {
        this.setUrlParamFromState();
      }
    },
    created() {
      this.initModifyPwdForm();
      this.initTableState();
      this.initRouteParamState();
      this.setParamStateFromUrl();
    },
    mounted() {
      // 监听窗口大小
      window.onresize = () => {
        return (() => {
          this.menuWidth();
        })();
      };
    },
    methods: {
      // ===== 页面逻辑处理相关 =====//
      menuWidth() {
        // eslint-disable-next-line no-unreachable
        if (document.body.clientWidth < 1360) {
          this.menuCollapsed = false;
          this.collapseChanged();
        } else {
          this.menuCollapsed = true;
          this.collapseChanged();
        }
      },
      collapseChanged() {
        this.menuCollapsed = !this.menuCollapsed;
        // 强制把所有子菜单都打开
        this.submenuOpenKey = __.pluck(this.menuData, 'name');
      },
      submenuOpen(key) {
        !this.submenuOpenKey.includes(key) && this.submenuOpenKey.push(key);
      },
      submenuClose(key) {
        const idx = this.submenuOpenKey.indexOf(key);
        !!~idx && this.submenuOpenKey.splice(idx, 1);
      },
      judgeIconActive(router, judgeCollapse) {
        const result = router.name.includes(this.$route.name) || this.$route.name.includes(router.name);
        return judgeCollapse ? result && this.menuCollapsed : result;
      },

      // 初始化table组件属性
      initTableState() {
        store.commit('initTableState');
      },
      // 初始化 routeParamState
      initRouteParamState() {
        store.commit('initRouteParamState');
      },
      // 将 URL 中的参数存储到 routeParamState
      setParamStateFromUrl() {
        const params = getUrlParam();
        Object.keys(params).forEach(key => {
          updateRouteParamState(this.$route.name, {[key]: params[key]});
        });
      },
      // 在 routeParamState 中取参数，赋值给 URL
      setUrlParamFromState() {
        const state = this.routeParamState[this.$route.name] || {};
        if (__.isEmpty(state)) {
          clearUrlParam();
        } else {
          Object.keys(state).forEach(key => {
            if (key !== 'route') {
              setUrlParam(key, state[key]);
            }
          });
        }
      },
      // 路由变换时，判断是否要清空 store 中的 tableState/routeParamState
      refreshStore(from, to) {
        const commit = (name, param) => {
          this.$store.commit(name, param);
        };
        const initState = (routeTable = [], routeName = '') => {
          routeTable.forEach(t => {
            commit('initTableState', t);
          });
          commit('initRouteParamState', routeName);
        };
        if (from.name.includes(to.name)) {
          const {table = []} = from.meta || {};
          initState(table, from.name);
        } else if (to.name.includes(from.name)) {
          const {table = []} = to.meta || {};
          initState(table, to.name);
        } else {
          // 如果 from 和 to 没有父子层级关系，则在 mete.extraParent 中判断，是否有配置
          // 标志额外添加的父子关系，比如：房间监控详情中告警、日志与监控在路由中没有直接关系
          // withExtraParent：用于路由跳转时，标志需要判断路由中配置的 extraParent
          // Henry 2020-06-16 12:09:42
          const {withExtraParent: fromWithExtraParent = false} = from.params || {};
          const {withExtraParent: toWithExtraParent = false} = to.params || {};
          const {extraParent: fromExtraParent = [], fromTable = []} = from.meta || {};
          const {extraParent: toExtraParent = [], toTable = []} = to.meta || {};
          if (fromWithExtraParent && fromExtraParent.includes(to.name)) {
            initState(fromTable, from.name);
          } else if (toWithExtraParent && toExtraParent.includes(from.name)) {
            initState(toTable, to.name);
          } else {
            commit('initTableState');
            commit('initRouteParamState');
          }
        }
      },

      // ===== Header 操作相关 =====//
      initModifyPwdForm() {
        this.modifyPwdForm = {
          oldPwd: '',
          newPwd: '',
          confirmPwd: ''
        };
      },
      headerMoreOptCommand(command) {
        switch (command) {
          case 'modifyPwd':
            this.showModifyPwdDialog = true;
            break;
          case 'logout':
            this.logout();
            break;
          default:
            break;
        }
      },
      logout() {
        this.$confirm('确定退出系统吗?', '退出登录', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.user.logout().then(resp => {
            if (checkRespCorrect(resp)) {
              clearStorage();
              this.closeWebsocket();
              store.commit('clearStore'); // 清空 store
              this.$router.push({name: routerMeta.login.name, query: {redirect: location.hostname}});
              this.$notify({
                title: '成功',
                message: '退出登录成功！',
                type: 'success',
                duration: 1000
              });
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.MUTATION});
          });
        }).catch(() => {
        });
      },
      modifyPwdSubmit() { // 修改密码
        this.$refs[this.modifyRef].validate((valid) => {
          if (!valid) return;
          const modifyPwdReq = {
            userId: getStorage(StorageKey.userId),
            oldPwd: this.modifyPwdForm.oldPwd,
            newPwd: this.modifyPwdForm.newPwd
          };
          API.user.userModifyPwd(modifyPwdReq).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.HAS_SAVE, msg: '密码修改成功'});
              clearStorage();
              this.$router.push({name: routerMeta.login.name, query: {redirect: location.hostname}});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        });
      },
      modifyPwdCancel() {
        this.showModifyPwdDialog = false;
      }

    }
  };
</script>

<style lang="less">

  .head-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2000;
  }

  .head-content {
    height: 60px;
    padding: 0 20px;
    position: relative;

    .header-collapse-icon {
      position: absolute;
      top: 17px;
    }

    .header-logo {
      width: 90px;
      height: 60px;
      object-fit: none;
      margin-left: 40px;
    }

    .header-right-container {
      float: right;
      position: relative;
      padding-right: 20px;
      line-height: 60px;

      .user-thumbnail {
        width: 32px;
        height: 32px;
        position: absolute;
        top: 14px;
        left: -45px;
      }
    }
  }

  .body-role {
    width: 170px;
    height: 24px;
    line-height: 24px !important;
    background: @colorBgWhite;
  }

  .user-name-size {
    font-size: 14px;
    font-weight: bold;
    height: 16px;
    color: @colorGray20;
    float: left
  }

  .role-size {
    width: 36px;
    height: 12px;
    font-size: 12px;
    font-weight: 400;
    color: @colorGray60;
    line-height: 12px;
  }

  .email-size {
    font-size: 12px;
    color: @colorGray60;
    height: 12px;
    float: left;
    margin-bottom: 20px;
  }

  .body-user {
    width: 170px;
    height: 56px;
    background: @colorBgWhite;
  }

  .aside-container {
    position: fixed;
    bottom: 0;
    left: 0;
    padding-top: 10px;
    padding-bottom: 50px;
    overflow: auto;
  }

  .root-container {
    padding: 0;
    background: @colorGray96;
    box-shadow: -1px 0 0 @colorGray90;
    position: absolute;
    overflow: auto;
  }

  .active-submenu-icon {
    color: @colorPrimary !important;
    font-weight: bold !important;
  }

  .version_div {
    position: fixed;
    bottom: 0;
    height: 35px;
    width: 250px;
    border-top: 1px solid @colorGray40;
    text-align: center;
    line-height: 35px;
    color: @colorGray90;
    font-size: 12px;
  }

</style>
