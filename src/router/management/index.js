import { permissionConfig } from '../../config/permission';
import { tableIdConfig } from '../../config/common';

import monitor from '../monitor/index.js';

export default {
  // 管理
  management: {
    path: '/admin/management',
    tag: permissionConfig.management,
    name: 'admin.management',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '管理',
      label: '管理',
      icon: 'icon-nav-guanli'
    }
  },

  // 区域管理
  managementArea: {
    path: '/admin/management/area',
    tag: permissionConfig.managementArea,
    name: 'admin.management.area',
    parent: 'admin.home',
    relation: 'admin.management',
    meta: {
      title: '区域管理 | 管理',
      label: '区域管理',
      icon: 'icon-nav-quyuguanli',
      breadcrumb: [
        {
          title: '管理：区域管理'
        }
      ],
      table: [tableIdConfig.managerArea],
      keepAlive: true
    },
    component: () => import('../../pages/management/area/AreaManagement')
  },
  // 新增房间
  managementRoomAdd: {
    path: '/admin/management/area/:lid/room/add',
    tag: permissionConfig.managementAreaManage,
    name: 'admin.management.area.room.add',
    parent: 'admin.home',
    relation: 'admin.management.area',
    meta: {
      title: '新增房间 | 区域管理',
      label: '新增房间',
      breadcrumb: [
        {
          title: '管理：区域管理',
          name: 'admin.management.area'
        },
        {
          title: '新增房间'
        }
      ]
    },
    component: () => import('../../pages/management/area/RoomOperation')
  },
  // 编辑房间
  managementRoomEdit: {
    path: '/admin/management/area/:lid/room/:rid/edit',
    tag: permissionConfig.managementAreaManage,
    name: 'admin.management.area.room.edit',
    parent: 'admin.home',
    relation: 'admin.management.area',
    meta: {
      title: '编辑房间 | 区域管理',
      label: '编辑房间',
      breadcrumb: [
        {
          title: '管理：区域管理',
          name: 'admin.management.area'
        },
        {
          title: '编辑房间'
        }
      ],
      extraParent: [monitor.monitorRoomDetail.name],
      edit: true
    },
    component: () => import('../../pages/management/area/RoomOperation')
  },
  // 房间详情
  managementRoomDetail: {
    path: '/admin/management/area/:lid/room/:rid/detail',
    tag: permissionConfig.managementAreaManage,
    name: 'admin.management.area.room.detail',
    parent: 'admin.home',
    relation: 'admin.management.area',
    meta: {
      title: '房间详情 | 区域管理',
      label: '房间详情',
      breadcrumb: [
        {
          title: '管理：区域管理',
          name: 'admin.management.area'
        },
        {
          title: '房间详情'
        }
      ]
    },
    component: () => import('../../pages/management/area/RoomDetail')
  },

  // 设备管理
  managementDevice: {
    path: '/admin/management/device',
    tag: permissionConfig.managementDevice,
    name: 'admin.management.device',
    parent: 'admin.home',
    relation: 'admin.management',
    meta: {
      title: '设备管理 | 管理',
      label: '设备管理',
      icon: 'icon-nav-shebeiguanli',
      breadcrumb: [
        {
          title: '管理：设备管理'
        }
      ],
      table: [tableIdConfig.managerDevice],
      keepAlive: true
    },
    component: () => import('../../pages/management/device/DeviceManagement')
  },
  // 新增设备
  managementDeviceAdd: {
    path: '/admin/management/device/add',
    tag: permissionConfig.managementDevice,
    name: 'admin.management.device.add',
    parent: 'admin.home',
    relation: 'admin.management.device',
    meta: {
      title: '新增设备 | 设备管理',
      label: '新增设备',
      breadcrumb: [
        {
          title: '管理：设备管理',
          name: 'admin.management.device'
        },
        {
          title: '新增设备'
        }
      ]
    },
    component: () => import('../../pages/management/device/DeviceOperation')
  },
  // 编辑设备
  managementDeviceEdit: {
    path: '/admin/management/device/:did/edit',
    tag: permissionConfig.managementDevice,
    name: 'admin.management.device.edit',
    parent: 'admin.home',
    relation: 'admin.management.device',
    meta: {
      title: '编辑设备 | 设备管理',
      label: '编辑设备',
      breadcrumb: [
        {
          title: '管理：设备管理',
          name: 'admin.management.device'
        },
        {
          title: '编辑设备'
        }
      ]
    },
    component: () => import('../../pages/management/device/DeviceOperation')
  },
  // 设备详情
  managementDeviceDetail: {
    path: '/admin/management/device/:did/detail',
    tag: permissionConfig.managementDevice,
    name: 'admin.management.device.detail',
    parent: 'admin.home',
    relation: 'admin.management.device',
    meta: {
      title: '设备详情 | 设备管理',
      label: '设备详情',
      breadcrumb: [
        {
          title: '管理：设备管理',
          name: 'admin.management.device'
        },
        {
          title: '设备详情'
        }
      ]
    },
    component: () => import('../../pages/management/device/DeviceDetail')
  },

  // 分控管理
  managementSubControl: {
    path: '/admin/management/subControl',
    tag: permissionConfig.managementSubControl,
    name: 'admin.management.subControl',
    parent: 'admin.home',
    relation: 'admin.management',
    meta: {
      title: '分控管理 | 管理',
      label: '分控管理',
      icon: 'icon-nav-fenkongguanli',
      breadcrumb: [
        {
          title: '管理：分控管理'
        }
      ],
      table: [tableIdConfig.managerSubControl],
      keepAlive: true
    },
    component: () => import('../../pages/management/subControl/SubControlManagement')
  },
  // 分控详情
  managementSubControlDetail: {
    path: '/admin/management/subControl/:sid/detail',
    tag: permissionConfig.managementSubControl,
    name: 'admin.management.subControl.detail',
    parent: 'admin.home',
    relation: 'admin.management.subControl',
    meta: {
      title: '分控详情 | 分控管理',
      label: '分控详情',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '管理：分控管理',
          name: 'admin.management.subControl'
        },
        {
          title: '分控详情'
        }
      ]
    },
    component: () => import('../../pages/management/subControl/SubControlDetail')
  }
};
