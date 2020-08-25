import { tableIdConfig } from '../../config/common';

export default {
  // 种
  species: {
    path: '/admin/species',
    name: 'admin.species',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 种',
      label: '种',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.species]
    },
    component: () => import('../../pages/species/Species.vue')
  },
  // 种详情
  speciesDetail: {
    path: '/admin/species/:id/detail',
    name: 'admin.species.detail',
    parent: 'admin.home',
    relation: 'admin.species',
    meta: {
      title: '种 | 种详情',
      label: '种详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '种：种详情'
        }
      ]
    },
    component: () => import('../../pages/species/SpeciesDetail.vue')
  },
  // 种编辑
  speciesEdit: {
    path: '/admin/species/:id/edit',
    name: 'admin.species.edit',
    parent: 'admin.home',
    relation: 'admin.species',
    meta: {
      title: '种 | 种编辑',
      label: '种编辑',
      breadcrumb: [
        {
          title: '种：种编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/species/SpeciesEdit.vue')
  }
};
