import { tableIdConfig } from '../../config/common';

export default {
  // 历史朝代
  historyDynasty: {
    path: '/history-dynasty',
    name: 'culture.historyDynasty',
    parent: 'culture.home',
    relation: 'culture.home',
    meta: {
      title: '中华文化 | 历史朝代',
      label: '历史朝代',
      icon: 'icon-nav-gaojing'
    }
  },
  // 朝代演进
  dynastyProgress: {
    path: '/history-dynasty/dynasty-progress',
    name: 'culture.historyDynasty.historyProgress',
    parent: 'culture.home',
    relation: 'culture.historyDynasty',
    meta: {
      title: '历史朝代 | 朝代演进',
      label: '朝代演进',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '历史朝代：朝代演进'
        }
      ],
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/historyDynasty/dynastyProgress/DynastyProgress.vue')
  },
  // 重大事件
  historyMilestone: {
    path: '/history-dynasty/history-milestone',
    name: 'culture.historyDynasty.historyMilestone',
    parent: 'culture.home',
    relation: 'culture.historyDynasty',
    meta: {
      title: '历史朝代 | 重大事件',
      label: '重大事件',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '历史朝代：重大事件'
        }
      ],
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/historyDynasty/historyMilestone/HistoryMilestone.vue')
  },
  // 代表人物
  representative: {
    path: '/history-dynasty/history-representative',
    name: 'culture.historyDynasty.historyRepresentative',
    parent: 'culture.home',
    relation: 'culture.historyDynasty',
    meta: {
      title: '历史朝代 | 代表人物',
      label: '代表人物',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '历史朝代：代表人物'
        }
      ],
      table: [tableIdConfig.class]
    },
    component: () => import('../../pages/historyDynasty/representative/Representative.vue')
  }
};
