import { StorageKey, getStorage, setStorage } from '../config/sessions';
import { routerMeta } from '../router/routerMeta';
import { assembleTreeFromArray } from '../utils';

// 根据用户登录返回的权限，组装侧边导航信息（级联结构）
export function initMenuData() {
  const routesWithPerm = Object.values(getStorage(StorageKey.routes, true) || {});
  const routes = assembleTreeFromArray({
    srcData: routesWithPerm,
    parentKey: 'relation',
    childKey: 'name'
  });
  const menuData = [];
  __.flatten(__.pluck(routes, 'children')).forEach(router => {
    if (router.children && router.children.length > 0) {
      menuData.push(router);
    }
  });
  return menuData;
}

// 筛选出路由相关的权限项
export function assembleRouterPermission(permissions = []) {
  const tags = __.pluck(permissions, 'tag');
  const routesWithPerm = {
    superAdminLogin: routerMeta.superAdminLogin,
    login: routerMeta.login,
    loginWithSSO: routerMeta.loginWithSSO,
    home: routerMeta.home,
    noPermission: routerMeta.noPermission,
    notFound: routerMeta.notFound,
    tableConfig: routerMeta.tableConfig
  };
  for (const key in routerMeta) {
    const router = routerMeta[key];
    tags.includes(router.tag) && (routesWithPerm[key] = router);
  }
  setStorage(StorageKey.routes, routesWithPerm);
}

// 用户拥有权限的第一个路由，及初始权限的判断
export function handleDefaultRoute(currentRoute = {}) {
  const menuData = initMenuData();
  const defaultRoute = __.first(__.flatten(__.pluck(menuData, 'children')));
  if (defaultRoute) {
    const routesWithPerm = Object.values(getStorage(StorageKey.routes, true) || {});
    setStorage(StorageKey.tacitlyApprove, defaultRoute.path);
    const hasPerm = routesWithPerm.find(router => {
      return router.name === currentRoute.name;
    });
    return {
      hasPerm: hasPerm,
      route: defaultRoute
    };
  } else {
    return {
      hasPerm: false,
      route: routerMeta.noPermission
    };
  }
}
