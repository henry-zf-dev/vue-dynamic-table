import { tableIdConfig } from '../../config/common';

export default {
  // 目
  order: {
    path: '/admin/order',
    name: 'admin.order',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '分类 | 目',
      label: '目',
      icon: 'icon-nav-gaojing',
      table: [tableIdConfig.order]
    },
    component: () => import('../../pages/order/Order.vue')
  },
  // 目详情
  orderDetail: {
    path: '/admin/order/:id/detail',
    name: 'admin.order.detail',
    parent: 'admin.home',
    relation: 'admin.order',
    meta: {
      title: '目 | 目详情',
      label: '目详情',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '目：目详情'
        }
      ]
    },
    component: () => import('../../pages/order/OrderDetail.vue')
  },
  // 目编辑
  orderEdit: {
    path: '/admin/order/:id/edit',
    name: 'admin.order.edit',
    parent: 'admin.home',
    relation: 'admin.order',
    meta: {
      title: '目 | 目编辑',
      label: '目编辑',
      breadcrumb: [
        {
          title: '目：目编辑',
          name: 'admin.alarm.device'
        }
      ]
    },
    component: () => import('../../pages/order/OrderEdit.vue')
  }
};
