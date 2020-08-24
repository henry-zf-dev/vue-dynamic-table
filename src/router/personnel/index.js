import { permissionConfig } from '../../config/permission';
import { tableIdConfig } from '../../config/common';

export default {
  // 人员
  personnel: {
    path: '/admin/personnel',
    tag: permissionConfig.personnel,
    name: 'admin.personnel',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '人员',
      label: '人员',
      icon: 'icon-nav-renyuan'
    }
  },
  // 用户管理
  personnelUser: {
    path: '/admin/personnel/user',
    tag: permissionConfig.personnelUser,
    name: 'admin.personnel.user',
    parent: 'admin.home',
    relation: 'admin.personnel',
    meta: {
      title: '用户管理 | 人员',
      label: '用户管理',
      icon: 'icon-nav-yonghuliebiao',
      breadcrumb: [
        {
          title: '人员：用户管理'
        }
      ],
      table: [tableIdConfig.user],
      keepAlive: true
    },
    component: () => import('../../pages/personnel/user/UserManagement')
  },
  // 用户详情
  personnelUserDetail: {
    path: '/admin/personnel/user/:uid/detail',
    tag: permissionConfig.personnelUserManage,
    name: 'admin.personnel.user.detail',
    parent: 'admin.home',
    relation: 'admin.personnel.user',
    meta: {
      title: '用户详情 | 用户管理',
      label: '用户详情',
      breadcrumb: [
        {
          title: '人员：用户管理',
          name: 'admin.personnel.user'
        },
        {
          title: '用户详情'
        }
      ]
    },
    component: () => import('../../pages/personnel/user/UserDetail')
  },

  // 角色管理
  personnelRole: {
    path: '/admin/personnel/role',
    tag: permissionConfig.personnelRole,
    name: 'admin.personnel.role',
    parent: 'admin.home',
    relation: 'admin.personnel',
    meta: {
      title: '角色管理 | 人员管理',
      label: '角色管理',
      icon: 'icon-nav-jiaoseguanli',
      breadcrumb: [
        {
          title: '人员：角色管理'
        }
      ],
      table: [tableIdConfig.role],
      keepAlive: true
    },
    component: () => import('../../pages/personnel/role/RoleManagement')
  },
  // 角色详情
  personnelRoleDetail: {
    path: '/admin/personnel/role/:rid/detail',
    tag: permissionConfig.personnelRoleManage,
    name: 'admin.personnel.role.detail',
    parent: 'admin.home',
    relation: 'admin.personnel.role',
    meta: {
      title: '角色详情 | 角色管理',
      label: '角色详情',
      breadcrumb: [
        {
          title: '人员：角色管理',
          name: 'admin.personnel.role'
        },
        {
          title: '角色详情'
        }
      ]
    },
    component: () => import('../../pages/personnel/role/RoleDetail')
  }
};
