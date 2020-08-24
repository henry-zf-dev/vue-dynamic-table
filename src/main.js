// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

// 解决 js 低版本浏览器兼容问题相关引入
import 'babel-polyfill';

import Vue from 'vue';
import App from './App';
import router from './router/routes';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import underscore from 'vue-underscore';
import '!style-loader!css-loader!less-loader!./assets/styles/app.less';

// element 自定义主题
import '../theme/index.css';

import jQuery from 'jquery';
import moment from 'moment';
import API from './api';
window.$ = jQuery;
window._ = _;
moment.locale('zh-cn');
window.moment = moment;
window.API = API;

Vue.prototype.$EventBus = new Vue();
// 定义全局点击函数
Vue.prototype.globalClick = function(callback) {
  document.getElementById('app').onclick = function() {
    callback();
  };
};
Vue.config.productionTip = false;
Vue.use(VueRouter);
Vue.use(ElementUI);
Vue.use(underscore);

// 引入vuex
import store from './store/index';

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
});
