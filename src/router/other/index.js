import { tenant } from '../../config/env';
import { tenantConfig } from '../../config/common';
import { permissionConfig } from '../../config/permission';

export default {
  // 超级管理员登录
  superAdminLogin: {
    path: '/super/admin/login',
    name: 'superAdminLogin',
    title: '超级管理员登录',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/Login')
  },
  // 重定向到 SSO 获取 token
  login: {
    path: '/login',
    name: 'login',
    label: '登录',
    meta: {
      ignoreToken: true
    },
    component: tenant === tenantConfig.EZPRO
      ? () => import('../../pages/Login')
      : () => import('../../pages/SSO/Authenticate')
  },
  // 拿到 SSO token 后登陆系统
  loginWithSSO: {
    path: '/login/with/sso',
    name: 'loginWithSSO',
    label: '授权后登陆',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/Login')
  },
  noPermission: {
    path: '/no/permission',
    name: 'noPermission',
    label: '无权限',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/NoPermission')
  },
  notFound: {
    path: '/not/found',
    name: 'notFound',
    label: '页面找不到',
    meta: {
      ignoreToken: true
    },
    component: () => import('../../pages/NotFound')
  },
  home: {
    path: '/admin/home',
    name: 'admin.home',
    meta: {
      title: '主页',
      module: 'home'
    },
    component: () => import('../../layouts/BodyAdmin')
  },
  tableConfig: {
    path: '/super/admin/tableConfig',
    name: 'tableConfig',
    label: '表格配置',
    component: () => import('../../pages/superAdmin/TableConfigSetting')
  },

  overview: {
    path: '/admin/overview',
    tag: permissionConfig.dashboard,
    name: 'admin.overview',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '首页',
      label: '首页',
      icon: 'el-icon-menu'
    }
  }
};
