<template>
  <div>
    <div
      v-loading="menuLoading"
      :style="{top: '0', width: menuCollapsed ? '64px' : '250px'}"
      class="aside-container"
      element-loading-background="rgba(0, 0, 0, 0.4)">
      <div class="menu-header-container">
        <i
          :class="menuCollapsed ? 'iconfont icon-zujiantubiao-xinxijiegou-xiangyou' : 'iconfont icon-nav-shouqi'"
          class="header-collapse-icon cursor-pointer"
          @click="collapseChanged"></i>
        <div v-if="!menuCollapsed">
          <div class="divider-vertical"></div>
          <img
            class="header-logo"
            src="../assets/img/logo-ezpro1.png"
            @click="jumpToHomePage">
        </div>
        <div class="divider-horizontal"></div>
      </div>
      <el-menu
        :collapse="menuCollapsed"
        :collapse-transition="false"
        :default-openeds="submenuOpenKey"
        @open="submenuOpen"
        @close="submenuClose">
        <div v-for="(router, idx) in menuData" :key="idx">
          <el-submenu :index="`${router.name}`">
            <template slot="title">
              <div :class="{'active-submenu' : judgeIconActive(router, true)}">
                <i :class="router.meta.icon" class="iconfont"></i>
                <span v-if="!menuCollapsed">
                  <span slot="title" class="mar-lft-10">{{ router.meta.label }}</span>
                  <i class="iconfont submenu-collapse-icon icon-zujiantubiao-xinxijiegou-xiangxia"></i>
                </span>
              </div>
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
      <el-popover
        placement="right"
        width="160"
        class="display-none"
        trigger="click">
        <div class="user-info-opt" @click="headerMoreOptCommand('modifyPwd')">修改密码</div>
        <div class="user-info-opt" @click="headerMoreOptCommand('logout')">退出登录</div>
        <div
          slot="reference"
          :style="{width: menuCollapsed ? '64px' : '250px'}"
          class="user-info-container">
          <div class="user-info-content">
            <div v-if="!menuCollapsed">
              <div class="user-name">
                <span>{{ userInfo.username }}</span>
                <i class="iconfont icon-zujiantubiao-xinxijiegou-xiangyou user-name-icon"></i>
              </div>
              <div class="user-other-info">
                <span class="user-role limited-text">{{ userInfo.userRole.name || commonString.unknown }}</span>
                <span class="user-email limited-text">{{ userInfo.userEmail }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-popover>
      <div v-if="!menuCollapsed">
        <div class="version-container">
          <span>版本号: {{ version }}</span>
        </div>
      </div>
    </div>
    <div
      :style="{
        marginTop: '0',
        marginLeft: menuCollapsed ? '65px' : '251px', right: 0,
        paddingTop: `${breadcrumbHeight}px`
      }"
      class="root-container">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive"></router-view>
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
  import {assembleTreeFromArray, checkRespCorrect, getUserInfo, messageHandle} from '../utils';
  import store from '../store/index';
  import {routerMeta} from '../router/routerMeta';
  import FormOptBtn from '../components/FormOptBtn';
  import {mapState} from 'vuex';
  import {clearUrlParam, getUrlParam, setUrlParam, updateRouteParamState} from '../modules/urlParamStoreHdl';

  export default {
    components: {FormOptBtn},
    data() {
      return {
        commonString: commonString,
        userInfo: getUserInfo(),
        menuLoading: false,
        menuCollapsed: false,
        menuForceCollapsed: false, // 用户手动点击折叠侧边栏，则不进行页面宽度监听
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
        'clientWidth', 'clientHeight',
        'routeParamState', 'breadcrumbHeight'
      ]),
      breadcrumb() {
        return this.$route.meta.breadcrumb;
      }
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
          // 强制把所有子菜单都打开
          this.submenuOpenKey = _.pluck(this.menuData, 'name');
        },
        immediate: true
      },
      routeParamState() {
        this.setUrlParamFromState();
      }
    },
    created() {
      this.initMenu();
      this.initModifyPwdForm();
      this.initTableState();
      this.initRouteParamState();
      this.setParamStateFromUrl();
    },
    methods: {
      // ===== 页面逻辑处理相关 =====//
      jumpToHomePage() {
        this.$router.push({name: routerMeta.dashboard.name});
      },
      initMenu() {
       const menuData = assembleTreeFromArray({
          srcData: Object.values(routerMeta),
          parentKey: 'relation',
          childKey: 'name'
        });
        this.menuData = [];
        _.flatten(_.pluck(menuData, 'children')).forEach(router => {
          if (router.children && router.children.length > 0) {
            this.menuData.push(router);
          }
        });
        this.submenuOpenKey = _.pluck(this.menuData, 'name');
      },
      menuWidth() {
        if (this.menuForceCollapsed) return;
        this.menuCollapsed = this.clientWidth < 1360;
      },
      collapseChanged() {
        this.menuCollapsed = !this.menuCollapsed;
        this.menuForceCollapsed = this.menuCollapsed;
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
        if (_.isEmpty(state)) {
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

  .menu-header-container {
    height: 50px;
    text-align: center;
    position: relative;

    .header-collapse-icon {
      position: absolute;
      top: 20px;
      left: 25px;
      font-size: @sizeRegular;
      color: @colorGray70;
    }

    .divider-vertical {
      position: absolute;
      top: 20px;
      left: 60px;
      height: 15px;
      width: 2px;
      background: @colorWhiteAlpha1;
    }

    .header-logo {
      width: 72px;
      height: 48px;
      object-fit: contain;
      cursor: pointer;
      position: absolute;
      top: 2px;
      left: 80px;
    }

    .divider-horizontal {
      position: absolute;
      bottom: 0;
      right: 0;
      left: 0;
      height: 1px;
      background: @colorWhiteAlpha1;
    }
  }

  .aside-container {
    position: fixed;
    bottom: 0;
    left: 0;
    padding-bottom: 50px;
    background: @colorPrimary3;
    overflow: auto;
  }

  .root-container {
    padding: 0;
    background: @colorGray96;
    box-shadow: -1px 0 0 @colorGray90;
    overflow: hidden;
  }

  .active-submenu-icon {
    font-weight: bold !important;
  }

  .active-submenu {
    background-color: @menuHoverColor !important;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding-left: 25px !important;
    box-shadow: 2px 0 0 0 @colorPrimary2 inset;

    i {
      font-weight: bold !important;
    }
  }

  .user-info-opt {
    padding: 10px;
    cursor: pointer;
  }

  .user-info-opt:hover {
    background: @colorGray96;
    color: @colorPrimary;
  }

  .user-info-container {
    position: fixed;
    bottom: 36px;
    height: 80px;
    background: @colorPrimary3;

    .user-info-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 56px;
      color: @colorWhite;
      cursor: pointer;

      .user-header {
        position: absolute;
        top: 8px;
      }

      .user-name {
        position: absolute;
        top: 8px;
        left: 80px;
        font-size: @sizeMain;
        font-weight: bold;

        .user-name-icon {
          font-size: 10px;
          font-weight: normal;
          color: @colorWhiteAlpha1;
        }
      }

      .user-other-info {
        position: absolute;
        top: 30px;
        left: 80px;
        font-size: @sizeSecond;

        .user-role {
          max-width: 60px;
          display: inline-block;
        }

        .user-email {
          max-width: 100px;
          display: inline-block;
        }

        .user-email:before {
          content: "|";
          width: 1px;
          height: 10px;
          margin-left: 5px;
          margin-right: 8px;
          color: @colorWhiteAlpha1;
        }

      }
    }

    .user-info-content:hover, .user-info-content:focus {
      background: @menuHoverColor;
    }
  }

  .version-container {
    position: fixed;
    bottom: 0;
    height: 35px;
    width: 250px;
    border-top: 1px solid @colorWhiteAlpha1;
    text-align: center;
    line-height: 35px;
    color: @colorGray90;
    font-size: 12px;
    background: @colorPrimary3;
  }

</style>
