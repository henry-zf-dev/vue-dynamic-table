import { tableIdConfig } from '../../config/common';

export default {
  // 属
  genus: {
    path: '/admin/genus',
    name: 'admin.genus',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 属',
      label: '属',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.genus]
    },
    component: () => import('../../pages/genus/Genus.vue')
  },
  // 属详情
  genusDetail: {
    path: '/admin/genus/:id/detail',
    name: 'admin.genus.detail',
    parent: 'admin.home',
    relation: 'admin.genus',
    meta: {
      title: '属 | 属详情',
      label: '属详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '属：属详情'
        }
      ]
    },
    component: () => import('../../pages/genus/GenusDetail.vue')
  },
  // 属编辑
  genusEdit: {
    path: '/admin/genus/:id/edit',
    name: 'admin.genus.edit',
    parent: 'admin.home',
    relation: 'admin.genus',
    meta: {
      title: '属 | 属编辑',
      label: '属编辑',
      breadcrumb: [
        {
          title: '属：属编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/genus/GenusEdit.vue')
  }
};
