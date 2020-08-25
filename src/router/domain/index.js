import { tableIdConfig } from '../../config/common';

export default {
  // 域
  domain: {
    path: '/admin/domain',
    name: 'admin.domain',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 域',
      label: '域',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.domain]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 域详情
  domainDetail: {
    path: '/admin/domain/:id/detail',
    name: 'admin.domain.detail',
    parent: 'admin.home',
    relation: 'admin.domain',
    meta: {
      title: '域 | 域详情',
      label: '域详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '域：域详情'
        }
      ]
    },
    component: () => import('../../pages/domain/DomainDetail.vue')
  },
  // 域编辑
  domainEdit: {
    path: '/admin/domain/:id/edit',
    name: 'admin.domain.edit',
    parent: 'admin.home',
    relation: 'admin.domain',
    meta: {
      title: '域 | 域编辑',
      label: '域编辑',
      breadcrumb: [
        {
          title: '域：域编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/domain/DomainEdit.vue')
  }
};
