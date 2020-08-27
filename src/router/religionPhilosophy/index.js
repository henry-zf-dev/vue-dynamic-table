import { tableIdConfig } from '../../config/common';

export default {
  // 宗教哲学
  religionPhilosophy: {
    path: '/religion-philosophy',
    name: 'culture.religionPhilosophy',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '宗教哲学 | 中华文化',
      label: '宗教哲学',
      icon: 'icon-nav-gaojing'
    }
  },
  // 思想流派
  thoughtFactions: {
    path: '/geography-architecture/thought-factions',
    name: 'culture.religionPhilosophy.thoughtFactions',
    parent: 'culture.home',
    relation: 'culture.religionPhilosophy',
    meta: {
      title: '思想流派 | 宗教哲学',
      label: '思想流派',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '宗教哲学：思想流派'
        }
      ],
      table: [tableIdConfig.thoughtFactions]
    },
    component: () => import('../../pages/religionPhilosophy/thoughtFactions/ThoughtFactions.vue')
  },
  // 大思想家
  greatThinker: {
    path: '/geography-architecture/great-thinker',
    name: 'culture.religionPhilosophy.greatThinker',
    parent: 'culture.home',
    relation: 'culture.religionPhilosophy',
    meta: {
      title: '大思想家 | 宗教哲学',
      label: '大思想家',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '宗教哲学：大思想家'
        }
      ],
      table: [tableIdConfig.greatThinker]
    },
    component: () => import('../../pages/religionPhilosophy/greatThinker/GreatThinker.vue')
  }
};
