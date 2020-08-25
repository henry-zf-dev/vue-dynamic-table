import { tableIdConfig } from '../../config/common';

export default {
  // 纲
  class: {
    path: '/admin/class',
    name: 'admin.class',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 纲',
      label: '纲',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/class/Class.vue')
  },
  // 纲详情
  classDetail: {
    path: '/admin/class/:id/detail',
    name: 'admin.class.detail',
    parent: 'admin.home',
    relation: 'admin.class',
    meta: {
      title: '纲 | 纲详情',
      label: '纲详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '纲：纲详情'
        }
      ]
    },
    component: () => import('../../pages/class/ClassDetail.vue')
  },
  // 纲编辑
  classEdit: {
    path: '/admin/class/:id/edit',
    name: 'admin.class.edit',
    parent: 'admin.home',
    relation: 'admin.class',
    meta: {
      title: '纲 | 纲编辑',
      label: '纲编辑',
      breadcrumb: [
        {
          title: '纲：纲编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/class/ClassEdit.vue')
  }
};
