// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// 解决 js 低版本浏览器兼容问题相关引入
import 'babel-polyfill';
import Vue from 'vue';
import App from './App';
import store from './store/index';
import VueRouter from 'vue-router';
import jQuery from 'jquery';
import ElementUI from 'element-ui';
import underscore, {_} from 'vue-underscore';
import moment from 'moment';
import router from './router/routes';
import API from './api';
import '../theme/index.css';
import './assets/styles/app.less';
import {commonString} from "./config/string";
import {getStorage, StorageKey} from "./config/sessions";
import {routerMeta} from "./router/routerMeta";
import CustomNotify from './components/customNotify';

moment.locale('zh-cn');
window.$ = jQuery;
window._ = _;
window.moment = moment;
window.API = API;

Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.use(underscore);
Vue.prototype.$customNotify = CustomNotify;

// 判断当前路由是否存在和有权限
function judgeRouteStatus(route = {}) {
  // 当前路径为 /
  if (route.path !== '/') {
    const allRouter = [];
    // 去除一级菜单，只有包含 component 属性，才表示是真实的页面路由
    Object.values(routerMeta).forEach(item => {
      if (item.component) {
        allRouter.push(item);
      }
    });
    if (!_.pluck(allRouter, 'name').includes(route.name)) {
      return {
        validate: false,
        notFound: true
      };
    }
  }
  return {
    validate: true
  };
}

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || commonString.defaultTitle;
  if (getStorage(StorageKey.token)) {
    const routeStatus = judgeRouteStatus(to);
    if (routeStatus.validate) {
      next();
    } else {
      if (routeStatus.notFound) {
        next(routerMeta.notFound.path);
      } else if (routeStatus.noPermission) {
        next(routerMeta.noPermission.path);
      }
    }
  } else {
    if (!to.meta.ignoreToken && to.path !== routerMeta.login.path) {
      if (to.path !== '/') {
        CustomNotify({
          type: 'warning',
          duration: 1500,
          message: '请先登录!'
        });
        next({ path: routerMeta.login.path, query: { redirect: location.hostname } });
      } else {
        next({ path: routerMeta.login.path });
      }
    } else {
      next();
    }
  }
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
