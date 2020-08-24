<template>
  <div>
    <div :style="{height: headerHeight}" class="head-container">
      <div v-if="browserSuggest" class="global-notification">
        推荐使用chrome浏览器，以获得更好的使用体验。
        <span class="cursor-pointer text-underline" @click="openChrome">下载chrome浏览器</span>。
        <i
          class="iconfont icon-zujiantubiao-guanbi float-right cursor-pointer mar-rgt-20"
          @click="closeBrowserSuggest"></i>
      </div>
      <div v-if="wsReconnecting" class="global-notification color-danger">
        重新与后台建立实时通讯中（告警信息、设备状态接收将受到影响）。
        <span class="cursor-pointer text-underline" @click="reloadPage">点击这里进行强制重连</span>。
      </div>
      <div class="color-gray-20 head-content">
        <i
          :class="menuCollapsed ? 'iconfont icon-zujiantubiao-xinxijiegou-xiangyou' : 'iconfont icon-nav-shouqi'"
          class="header-collapse-icon cursor-pointer font-size-20 font-gray-70"
          @click="collapseChanged"></i>
        <img
          v-if="tenant === tenantConfig.OPPO"
          class="header-logo"
          src="../assets/img/logo.png">
        <img
          v-if="tenant === tenantConfig.EZPRO"
          class="header-logo"
          src="../assets/img/logo-green.png">
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
      :style="{top: headerHeight, width: menuCollapsed ? '64px' : '250px'}"
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

      <audio ref="alarmAudio" muted>
        <source src="../assets/img/alarm-ring.mp3">
      </audio>
      <audio ref="restoreAlarmAudio" muted>
        <source src="../assets/img/alarm-restore.mp3">
      </audio>
      <span id="alarmAudio" class="display-none" @click="triggerAlarmAudio">告警提示音</span>
      <span id="restoreAlarmAudio" class="display-none" @click="triggerRestoreAlarmAudio">恢复提示音</span>
    </div>
    <div
      :style="{top: headerHeight, bottom: 0, left: menuCollapsed ? '65px' : '251px', right: 0}"
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
  import {tenant} from '../config/env';
  import {freshenToken, tenantConfig} from '../config/common';
  import {commonString, msgCode, msgContent} from '../config/string';
  import {clearStorage, getStorage, setStorage, StorageKey} from '../config/sessions';
  import {checkRespCorrect, getUserInfo, messageHandle} from '../utils';
  import store from '../store/index';
  import {routerMeta} from '../router/routerMeta';
  import FormOptBtn from '../components/FormOptBtn';
  import {RealTimeMsgHandle} from '../modules/realTimeMsgHdl';
  import {mapState} from 'vuex';
  import {assembleRouterPermission, handleDefaultRoute, initMenuData} from '../modules/routePermHdl';
  import {clearUrlParam, getUrlParam, setUrlParam, updateRouteParamState} from '../modules/urlParamStoreHdl';
  import TableCircle from '../components/table/TableCircle.vue';

  export default {
    components: {
      FormOptBtn, TableCircle
    },
    data() {
      return {
        tenant: tenant,
        tenantConfig: tenantConfig,
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
        version: '',
        notifyInstance: '',
        interval: '',
        timeOut: '',
        currentTime: new Date(),
        setCurrentTime: ''
      };
    },
    computed: {
      ...mapState([
        'deviceAlarmMsg', 'roomAlarmMsg',
        'routeParamState', 'clientWidth', 'clientHeight',
        'browserSuggest', 'wsReconnecting'
      ]),
      breadcrumb() {
        return this.$route.meta.breadcrumb;
      },
      headerHeight() {
        let height = 60;
        this.browserSuggest && (height += 30);
        this.wsReconnecting && (height += 30);
        return `${height}px`;
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
        },
        immediate: true
      },
      roomAlarmMsg() {
        // todo 用来存放其他状态的推送（包含房间告警，房间分数，设备告警，设备在线状态）
        const msg = this.$store.state.roomAlarmMsg || {};
        this.triggerAlarm(msg);
      },
      deviceAlarmMsg() {
        const msg = this.$store.state.deviceAlarmMsg || {};
        this.restoreAlarm(msg);
      },
      currentTime() { // todo 根据当前时间刷新token机制，防止浏览器F5刷新延时器初始化造成还在操作中token失效
        let tokenTime = getStorage(StorageKey.tokenTime); // 获取token的保存时间
        tokenTime = parseInt(tokenTime) + freshenToken.timingTime;// token保存时间加上token有效时间的百分之85
        // let tokenTimes = momentTimeToString(tokenTime)
        // let dateTime = momentTimeToString(new Date().getTime());//当前时间
        const RefreshTime = tokenTime + 10000; // todo 防止刚好在进入token刷新机制时刷新浏览器，延长10秒
        if (new Date().getTime() >= tokenTime && new Date().getTime() <= RefreshTime) { // 当前时间大于等于token保存时间加上token有效时间的百分之85并且小于等于token时间延长10秒，等于则进入刷新token机制
          const intervalCount = getStorage(StorageKey.intervalCount) || '0'; // 轮询次数
          const timeCount = getStorage(StorageKey.timeCount) || '0'; // 用于判断是否已经进入轮询
          if (parseInt(intervalCount) === 0 && parseInt(timeCount) === 0) { // token轮询次数等于0，且没有进入过轮询方法
            this.tokenInterval();
          }
        }
      },
      routeParamState() {
        this.setUrlParamFromState();
      }
    },
    created() {
      this.initWebsocket();
      this.getVersion();
      this.getPermission();
      this.initModifyPwdForm();
      this.initTableState();
      this.initRouteParamState();
      this.setParamStateFromUrl();
      // todo 判断是否有轮询次数，有进入轮询继续刷新token机制
      const intervalCount = getStorage(StorageKey.intervalCount) || '0';
      if (parseInt(intervalCount) !== 0) {
        this.tokenInterval();
      }
    },
    mounted() {
      // 监听当前时间的变化
      this.setCurrentTime = setInterval(() => {
        this.currentTime = new Date(); // 修改当前时间
      }, 1000);
      // 监听窗口大小
      window.onresize = () => {
        return (() => {
          this.menuWidth();
        })();
      };
      // 监听键盘事件
      window.addEventListener('keyup', this.handleKeyEvent);
      // 监听鼠标划入划出事件
      window.addEventListener('mouseover', this.setOperationTime);
      // 监听鼠标点击事件
      this.globalClick(this.setOperationTime);
      // 监听鼠标滑轮事件
      const userAgent = navigator.userAgent; // 取得浏览器的userAgent字符串
      // 判断是否Firefox浏览器
      if (userAgent.indexOf('Firefox') > -1) {
        window.addEventListener('DOMMouseScroll', this.setOperationTime, false);
      } else { // 其他浏览器
        window.addEventListener('mousewheel', this.setOperationTime, false);
      }
      // 判断是否为谷歌浏览器，其他浏览器显示全局提示(建议使用谷歌浏览器)
      this.$store.commit('updateBrowserSuggest', !userAgent.includes('Chrome'));

      /**
       *判断浏览器窗口是刷新或者关闭操作
       * 无论任何浏览器不管是刷新或者是关闭都会执行下面两个方法 onbeforeunload  onunload
       * 根据时间差来实现
       * 在点击刷新或者关闭时开始计时记录下这一刻的时间戳
       * 因为刷新和关闭 在执行onunload方法时的时间不一样，一般情况下经过测试
       * 关闭时时间差不大于3毫秒
       * 刷新时即使只有一个简单的helloworld页面都不少于10毫秒
       * 而一般网站网页内容更多，时间差达到了100多毫秒
       *
       * 下面方法的缺点是不管你开了多少窗口，都会在关闭一个窗口时清空所有localStorage缓存
       * 造成所有页面都需要重新登录，其实这也是针对项目而言的，目前本项目就不认为这是缺点
       * 而能更好的保护用户信息
       **/
      let beginTime = 0; // 开始时间
      let differTime = 0; // 时间差
      window.onunload = (event) => {
        event.preventDefault();
        differTime = new Date().getTime() - beginTime;
        if (differTime <= 3) {
          clearStorage();
          this.closeWebsocket();
        }
      };
      window.onbeforeunload = function(event) {
        event.preventDefault();
        beginTime = new Date().getTime();
      };
    },
    beforeDestroy() {
      clearInterval(this.setCurrentTime);
      clearInterval(this.interval);
    },
    methods: {
      // ===== 页面逻辑处理相关 =====//
      closeBrowserSuggest() {
        this.$store.commit('updateBrowserSuggest', false);
      },
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

      // ===== 依赖数据源相关 =====//
      getPermission() {
        this.menuLoading = true;
        API.user.userPermissionAll().then(resp => {
          if (checkRespCorrect(resp)) {
            this.menuLoading = false;
            const {data = []} = resp;
            setStorage(StorageKey.userPermissions, data);
            if (data.length > 0) {
              assembleRouterPermission(data);
              this.menuData = initMenuData();
              this.submenuOpenKey = __.pluck(this.menuData, 'name');
              const {hasPerm = false, route = {}} = handleDefaultRoute(this.$route);
              if (!hasPerm) {
                this.$notify({
                  message: '当前菜单无权限，自动跳转到有权限菜单！',
                  type: 'warning',
                  duration: 3000
                });
                this.$router.push({name: route.name});
              }
            } else {
              this.$router.push({name: routerMeta.noPermission.name});
            }
          } else {
            this.menuLoading = false;
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.menuLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      getVersion() {
        API.setting.getVersion().then(resp => {
          if (checkRespCorrect(resp)) {
            this.version = resp.data.version;
          }
        });
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

      // websocket 相关
      initWebsocket() {
        this.closeWebsocket();
        const websocket = new RealTimeMsgHandle();
        websocket.initWebsocket();
      },
      // 取消ws订阅和关闭连接
      closeWebsocket() {
        RealTimeMsgHandle.bulkUnSubscription(); // 批量取消订阅
        RealTimeMsgHandle.closeWebsocket();
      },

      // ===== 状态栏相关 =====//
      reloadPage() {
        this.$router.go(0);
      },
      openChrome() { // 跳转到Chrome浏览器下载界面
        window.open('https://www.google.cn/chrome/');
      },

      // ===== token 自动刷新机制相关 =====//
      tokenInterval() {
        setStorage(StorageKey.timeCount, 1); // 用于判断是否已经进入轮询
        let timeCount = getStorage(StorageKey.intervalCount) ? parseInt(getStorage(StorageKey.intervalCount)) : 0;
        setStorage(StorageKey.intervalCount, 1);// todo 进入token刷新机制方法，先赋值1，防止第一次轮询还没开始就浏览器刷新
        this.interval = setInterval(() => {
          timeCount = timeCount + 1;
          setStorage(StorageKey.intervalCount, timeCount);// todo 记录当前轮询的次数，防止浏览器F5刷新后轮询不在执行
          if (timeCount > freshenToken.pollCount) { // 清除轮询和重置轮询次数
            // todo 超过循环次数要不要弹出token失效的提示，待确认
            this.clearPoll();
            clearInterval(this.setCurrentTime); // 清空计时器
          }
          const dateTime = new Date().getTime();
          const part = freshenToken.totalTime * 0.5; // 有效时间百分之50
          const eighty = freshenToken.totalTime * 0.85; // 有效时间百分之85
          const second = (dateTime - getStorage(StorageKey.operationTime)) / 1000;// 计算当前时间与操作时间的间隔多少秒
          if (timeCount === 1) { // 第一次用百分50-85区间判断
            if (second < (eighty - part)) {
              this.refreshToken();
            }
          } else { // 用轮询时间*轮询次数判断
            if (second < (timeCount * freshenToken.pollTime / 1000)) {
              this.refreshToken();
            }
          }
        }, freshenToken.pollTime);
      },
      // 清除轮询和重置轮询次数
      clearPoll() {
        clearInterval(this.interval);
        setStorage(StorageKey.intervalCount, 0);
        setStorage(StorageKey.timeCount, 0);
      },
      // 刷新token
      refreshToken() {
        API.user.userRefreshToken().then(resp => {
          if (checkRespCorrect(resp)) {
            setStorage(StorageKey.token, resp.data.token || '');// 刷新token
            setStorage(StorageKey.tokenTime, new Date().getTime());// 刷新token保存时间
            this.clearPoll(); // 清除轮询
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      // 键盘事件
      handleKeyEvent(event) {
        // eslint-disable-next-line no-caller
        const keyUp = event || window.event || arguments.callee.caller.arguments[0];
        if (!keyUp) return;
        this.setOperationTime();
      },
      // 重新给缓存中操作时间赋值
      setOperationTime() {
        setStorage(StorageKey.operationTime, (new Date()).getTime());
      },

      // ===== 全局消息推送相关 =====//
      // 触发告警提示
      triggerAlarm(msg = {}) {
        if (msg.alarmStatus === commonString.monitorStatus.alarm.value && msg.isRing) {
          const {
            alarmConfigId = '', alarmCfgId = '', triggerNum = 0,
            alarmConfigName = '', roomId = '', roomName = ''
          } = msg;
          const alarmRule = this.$store.state.alarmRule[alarmConfigId];
          if (alarmRule) {
            if (alarmRule.notifyInstance) {
              alarmRule.notifyInstance.close();
            }
          }
          $('#alarmAudio').trigger('click');
          const html = this.$createElement;
          // todo 不能直接更改 store.state 而需要用 mutation
          store.commit('updateAlarmRule', {
            isShow: true,
            notifyInstance: this.$notify({
              title: '告警提示',
              dangerouslyUseHTMLString: true,
              onClose: () => {
                if (!this.$store.state.alarmRule) return;
                delete this.$store.state.alarmRule[alarmConfigId];
              },
              message: html('div', null, [
                html('a', {
                  on: {
                    click: () => {
                      this.routerToAlarmRecord();
                    }
                  },
                  style: 'cursor: pointer'
                }, '' + (triggerNum > 1 ? triggerNum + '个' : '') + '会议室触发了[' + alarmConfigName + ']'),
                html('br'),
                html('a', {
                  on: {
                    click: () => {
                      this.routerToMonitorDetail(roomId);
                    }
                  },
                  style: 'cursor: pointer'
                }, '最近告警会议室：' + roomName + '')
              ]),
              duration: 0,
              type: 'warning'
            }), alarmId: alarmConfigId
          });
        }
      },
      // 恢复告警提示
      restoreAlarm(msg = {}) {
        if (msg.alarmStatus === commonString.monitorStatus.normal.value) {
          const {
            alarmConfigId = '', triggerNum = 0,
            alarmConfigName = '', roomId = '', roomName = ''
          } = msg;
          const alarmRule = this.$store.state.alarmRule[alarmConfigId];
          if (alarmRule) {
            if (alarmRule.notifyInstance) {
              alarmRule.notifyInstance.close();
            }
          }
          $('#restoreAlarmAudio').trigger('click');
          const html = this.$createElement;
          store.commit('updateAlarmRule', {
            isShow: true, notifyInstance: this.$notify({
              title: '告警恢复',
              dangerouslyUseHTMLString: true,
              onClose: () => {
                if (!this.$store.state.alarmRule) return;
                delete this.$store.state.alarmRule[alarmConfigId];
              },
              message: html('div', null, [
                html('a', {
                  on: {
                    click: () => {
                      this.routerToAlarmRecord();
                    }
                  },
                  style: 'cursor: pointer'
                }, '' + (triggerNum > 1 ? triggerNum + '个' : '') + '会议室恢复了[' + alarmConfigName + ']'),
                html('br'),
                html('a', {
                  on: {
                    click: () => {
                      this.routerToMonitorDetail(roomId);
                    }
                  },
                  style: 'cursor: pointer'
                }, '最近恢复告警会议室：' + roomName + '')
              ]),
              duration: 0,
              type: 'success'
            }), alarmId: alarmConfigId
          });
        }
      },
      // 跳转到监控会议室详情
      routerToMonitorDetail(id) {
        this.$router.push({name: routerMeta.monitorRoomDetail.name, params: {rid: id}});
      },
      // 跳转到告警记录
      routerToAlarmRecord() {
        this.$router.push({
          name: routerMeta.alarmRecord.name
        });
      },
      // 触发告警提示音
      triggerAlarmAudio() {
        this.$nextTick(() => {
          try {
            const alarmAudio = this.$refs['alarmAudio'];
            if (!alarmAudio) return;
            alarmAudio.currentTime = 0; // 从头开始播放提示音
            alarmAudio.play(); // 播放
          } catch (err) {
          }
        });
      },
      // 触发恢复告警提示音
      triggerRestoreAlarmAudio() {
        this.$nextTick(() => {
          try {
            const restoreAlarmAudio = this.$refs['restoreAlarmAudio'];
            if (!restoreAlarmAudio) return;
            restoreAlarmAudio.currentTime = 0; // 从头开始播放提示音
            restoreAlarmAudio.play(); // 播放
          } catch (err) {
          }
        });
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
