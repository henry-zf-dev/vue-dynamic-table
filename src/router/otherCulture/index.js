import { tableIdConfig } from '../../config/common';

export default {
  // 其他文化
  otherCulture: {
    path: '/other-culture',
    name: 'culture.otherCulture',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '其他文化 | 中华文化',
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
      title: '传统节日 | 其他文化',
      label: '传统节日',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：传统节日'
        }
      ],
      table: [tableIdConfig.traditionFestival]
    },
    component: () => import('../../pages/otherCulture/traditionFestival/TraditionFestival.vue')
  },
  // 生肖文化
  zodiacCulture: {
    path: '/other-culture/zodiac-culture',
    name: 'culture.otherCulture.zodiacCulture',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '生肖文化 | 其他文化',
      label: '生肖文化',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：生肖文化'
        }
      ],
      table: [tableIdConfig.zodiacCulture]
    },
    component: () => import('../../pages/otherCulture/zodiacCulture/ZodiacCulture.vue')
  },
  // 饮食厨艺
  cuisineCulinary: {
    path: '/other-culture/cuisine-culinary',
    name: 'culture.otherCulture.cuisineCulinary',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '饮食厨艺 | 其他文化',
      label: '饮食厨艺',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：饮食厨艺'
        }
      ],
      table: [tableIdConfig.cuisineCulinary]
    },
    component: () => import('../../pages/otherCulture/cuisineCulinary/CuisineCulinary.vue')
  },
  // 音乐戏剧
  musicDrama: {
    path: '/other-culture/music-drama',
    name: 'culture.otherCulture.musicDrama',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '音乐戏剧 | 其他文化',
      label: '音乐戏剧',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：音乐戏剧'
        }
      ],
      table: [tableIdConfig.musicDrama]
    },
    component: () => import('../../pages/otherCulture/musicDrama/MusicDrama.vue')
  },
  // 中华武术
  ChineseWushu: {
    path: '/other-culture/Chinese-Wushu',
    name: 'culture.otherCulture.ChineseWushu',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '中华武术 | 其他文化',
      label: '中华武术',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：中华武术'
        }
      ],
      table: [tableIdConfig.ChineseWushu]
    },
    component: () => import('../../pages/otherCulture/ChineseWushu/ChineseWushu.vue')
  },
  // 民间工艺
  folkHandicraft: {
    path: '/other-culture/folk-handicraft',
    name: 'culture.otherCulture.folkHandicraft',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '民间工艺 | 其他文化',
      label: '民间工艺',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：民间工艺'
        }
      ],
      table: [tableIdConfig.folkHandicraft]
    },
    component: () => import('../../pages/otherCulture/folkHandicraft/FolkHandicraft.vue')
  },
  // 少数民族
  ethnicMinority: {
    path: '/other-culture/ethnic-minority',
    name: 'culture.otherCulture.ethnicMinority',
    parent: 'culture.home',
    relation: 'culture.otherCulture',
    meta: {
      title: '少数民族 | 其他文化',
      label: '少数民族',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '其他文化：少数民族'
        }
      ],
      table: [tableIdConfig.ethnicMinority]
    },
    component: () => import('../../pages/otherCulture/ethnicMinority/EthnicMinority.vue')
  }
};
