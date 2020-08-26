export default {
  login: {
    path: '/login',
    name: 'login',
    label: '登录',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/Login.vue')
  },
  noPermission: {
    path: '/no/permission',
    name: 'noPermission',
    label: '无权限',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/NoPermission.vue')
  },
  notFound: {
    path: '/not/found',
    name: 'notFound',
    label: '页面找不到',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/NotFound.vue')
  },
  home: {
    path: '/culture/home',
    name: 'culture.home',
    meta: {
      title: '主页',
      module: 'home'
    },
    component: () => import('../../layouts/BodyAdmin.vue')
  }
};
