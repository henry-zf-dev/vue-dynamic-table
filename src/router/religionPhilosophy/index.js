import { tableIdConfig } from '../../config/common';

export default {
  // 宗教哲学
  religionPhilosophyMenu: {
    path: '/religion-philosophy',
    name: 'culture.religionPhilosophy',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '中华文化 | 宗教哲学',
      label: '宗教哲学',
      icon: 'icon-nav-gaojing'
    }
  },
  // 宗教哲学
  religionPhilosophy: {
    path: '/geography-architecture/great-thinker',
    name: 'culture.religionPhilosophy',
    parent: 'culture.home',
    relation: 'culture.religionPhilosophy',
    meta: {
      title: '宗教哲学 | 宗教哲学',
      label: '宗教哲学',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 大思想家
  greatThinker: {
    path: '/geography-architecture/great-thinker',
    name: 'culture.greatThinker',
    parent: 'culture.home',
    relation: 'culture.religionPhilosophy',
    meta: {
      title: '宗教哲学 | 大思想家',
      label: '大思想家',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  }
};
