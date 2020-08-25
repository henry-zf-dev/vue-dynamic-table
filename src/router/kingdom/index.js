import { tableIdConfig } from '../../config/common';

export default {
  // 界
  kingdom: {
    path: '/admin/kingdom',
    name: 'admin.kingdom',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 界',
      label: '界',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.kingdom]
    },
    component: () => import('../../pages/kingdom/Kingdom.vue')
  },
  // 界详情
  kingdomDetail: {
    path: '/admin/kingdom/:id/detail',
    name: 'admin.kingdom.detail',
    parent: 'admin.home',
    relation: 'admin.kingdom',
    meta: {
      title: '界 | 界详情',
      label: '界详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '界：界详情'
        }
      ]
    },
    component: () => import('../../pages/kingdom/KingdomDetail.vue')
  },
  // 界编辑
  kingdomEdit: {
    path: '/admin/kingdom/:id/edit',
    name: 'admin.kingdom.edit',
    parent: 'admin.home',
    relation: 'admin.kingdom',
    meta: {
      title: '界 | 界编辑',
      label: '界编辑',
      breadcrumb: [
        {
          title: '界：界编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/kingdom/KingdomEdit.vue')
  }
};
