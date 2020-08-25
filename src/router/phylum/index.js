import { tableIdConfig } from '../../config/common';

export default {
  // 门
  phylum: {
    path: '/admin/phylum',
    name: 'admin.phylum',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 门',
      label: '门',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.phylum]
    },
    component: () => import('../../pages/phylum/Phylum.vue')
  },
  // 门详情
  phylumDetail: {
    path: '/admin/phylum/:id/detail',
    name: 'admin.phylum.detail',
    parent: 'admin.home',
    relation: 'admin.phylum',
    meta: {
      title: '门 | 门详情',
      label: '门详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '门：门详情'
        }
      ]
    },
    component: () => import('../../pages/phylum/PhylumDetail.vue')
  },
  // 门编辑
  phylumEdit: {
    path: '/admin/phylum/:id/edit',
    name: 'admin.phylum.edit',
    parent: 'admin.home',
    relation: 'admin.phylum',
    meta: {
      title: '门 | 门编辑',
      label: '门编辑',
      breadcrumb: [
        {
          title: '门：门编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/phylum/PhylumEdit.vue')
  }
};
