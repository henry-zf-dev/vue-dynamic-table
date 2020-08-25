import { tableIdConfig } from '../../config/common';

export default {
  // 科
  family: {
    path: '/admin/family',
    name: 'admin.family',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 科',
      label: '科',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.family]
    },
    component: () => import('../../pages/family/Family.vue')
  },
  // 科详情
  familyDetail: {
    path: '/admin/family/:id/detail',
    name: 'admin.family.detail',
    parent: 'admin.home',
    relation: 'admin.family',
    meta: {
      title: '科 | 科详情',
      label: '科详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '科：科详情'
        }
      ]
    },
    component: () => import('../../pages/family/FamilyDetail.vue')
  },
  // 科编辑
  familyEdit: {
    path: '/admin/family/:id/edit',
    name: 'admin.family.edit',
    parent: 'admin.home',
    relation: 'admin.family',
    meta: {
      title: '科 | 科编辑',
      label: '科编辑',
      breadcrumb: [
        {
          title: '科：科编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/family/FamilyEdit.vue')
  }
};
