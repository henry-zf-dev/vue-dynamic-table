// Import the router
import { routerMeta } from './routerMeta';
import Router from 'vue-router';
import { assembleTreeFromArray } from '../utils';

// Create router instance
export const routes = assembleTreeFromArray({
  srcData: Object.values(routerMeta),
  parentKey: 'parent',
  childKey: 'name'
});
export default new Router({
  routes: routes
});

// todo 防止路由跳到本页面传的参数一样的情况下控制台报错
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
