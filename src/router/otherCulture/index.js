import { tableIdConfig } from '../../config/common';

export default {
  // 其他文化
  otherCulture: {
    path: '/other-culture',
    name: 'culture.otherCulture',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '中华文化 | 其他文化',
      label: '其他文化',
      icon: 'icon-nav-gaojing'
    }
  },
  // 传统节日
  traditionFestival: {
    path: '/other-culture/tradition-festival',
    name: 'culture.otherCulture.traditionFestival',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 传统节日',
      label: '传统节日',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 生肖文化
  zodiacCulture: {
    path: '/other-culture/zodiac-culture',
    name: 'culture.otherCulture.zodiacCulture',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 生肖文化',
      label: '生肖文化',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 饮食厨艺
  cuisineCulinary: {
    path: '/other-culture/cuisine-culinary',
    name: 'culture.otherCulture.cuisineCulinary',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 饮食厨艺',
      label: '饮食厨艺',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 音乐戏剧
  musicDrama: {
    path: '/other-culture/music-drama',
    name: 'culture.otherCulture.musicDrama',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 音乐戏剧',
      label: '音乐戏剧',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 中华武术
  ChineseWushu: {
    path: '/other-culture/Chinese-Wushu',
    name: 'culture.otherCulture.ChineseWushu',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 中华武术',
      label: '中华武术',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 民间工艺
  folkHandicraft: {
    path: '/other-culture/folk-handicraft',
    name: 'culture.otherCulture.folkHandicraft',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 民间工艺',
      label: '民间工艺',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  },
  // 少数民族
  ethnicMinority: {
    path: '/other-culture/ethnic-minority',
    name: 'culture.otherCulture.ethnicMinority',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '其他文化 | 少数民族',
      label: '少数民族',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/domain/Domain.vue')
  }
};
