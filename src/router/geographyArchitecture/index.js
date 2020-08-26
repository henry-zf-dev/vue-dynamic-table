import { tableIdConfig } from '../../config/common';

export default {
  // 地理建筑
  geographyArchitecture: {
    path: '/geography-architecture',
    name: 'culture.geographyArchitecture',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '中华文化 | 地理建筑',
      label: '地理建筑',
      icon: 'icon-nav-gaojing'
    }
  },
  // 名山大川
  mountainsRivers: {
    path: '/geography-architecture/mountains-rivers',
    name: 'culture.geographyArchitecture.mountainsRivers',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '地理建筑 | 名山大川',
      label: '名山大川',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 著名建筑
  famousArchitecture: {
    path: '/geography-architecture/famous-architecture',
    name: 'culture.geographyArchitecture.famousArchitecture',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '地理建筑 | 著名建筑',
      label: '著名建筑',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/DomainDetail.vue')
  },
  // 地域文化
  regionalCulture: {
    path: '/geography-architecture/regional-culture',
    name: 'culture.geographyArchitecture.regionalCulture',
    parent: 'culture.home',
    relation: 'culture.geographyArchitecture',
    meta: {
      title: '地理建筑 | 地域文化',
      label: '地域文化',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/DomainDetail.vue')
  }
};
