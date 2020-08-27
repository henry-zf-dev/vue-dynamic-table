import { tableIdConfig } from '../../config/common';

export default {
  // 文学教育
  literatureEducation: {
    path: '/literature-education',
    name: 'culture.literatureEducation',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '文学教育 | 中华文化',
      label: '文学教育',
      icon: 'icon-nav-gaojing'
    }
  },
  // 文学著作
  famousLiterature: {
    path: '/literature-education/famous-literature',
    name: 'culture.literatureEducation.famousLiterature',
    parent: 'culture.home',
    relation: 'culture.literatureEducation',
    meta: {
      title: '文学著作 | 文学教育',
      label: '文学著作',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '文学教育：文学著作'
        }
      ],
      table: [tableIdConfig.famousLiterature]
    },
    component: () => import('../../pages/literatureEducation/famousLiterature/FamousLiterature.vue')
  },
  // 神话寓言
  mythologyAllegory: {
    path: '/literature-education/mythology-allegory',
    name: 'culture.literatureEducation.mythologyAllegory',
    parent: 'culture.home',
    relation: 'culture.literatureEducation',
    meta: {
      title: '神话寓言 | 文学教育',
      label: '神话寓言',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '文学教育：神话寓言'
        }
      ],
      table: [tableIdConfig.mythologyAllegory]
    },
    component: () => import('../../pages/literatureEducation/mythologyAllegory/MythologyAllegory.vue')
  },
  // 文字书法
  characterCalligraphy: {
    path: '/literature-education/character-calligraphy',
    name: 'culture.literatureEducation.characterCalligraphy',
    parent: 'culture.home',
    relation: 'culture.literatureEducation',
    meta: {
      title: '文字书法 | 文学教育',
      label: '文字书法',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '文学教育：文字书法'
        }
      ],
      table: [tableIdConfig.characterCalligraphy]
    },
    component: () => import('../../pages/literatureEducation/characterCalligraphy/CharacterCalligraphy.vue')
  }
};
