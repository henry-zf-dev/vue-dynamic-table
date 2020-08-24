import { permissionConfig } from '../../config/permission';
import { tableIdConfig } from '../../config/common';

import monitor from '../monitor/index.js';

export default {
  // 告警
  alarm: {
    path: '/admin/alarm',
    tag: permissionConfig.alarm,
    name: 'admin.alarm',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '正在告警 | 告警',
      label: '告警',
      icon: 'icon-nav-gaojing'
    }
  },

  // 正在告警
  alarmDevice: {
    path: '/admin/alarm/device',
    tag: permissionConfig.alarm,
    name: 'admin.alarm.device',
    parent: 'admin.home',
    relation: 'admin.alarm',
    meta: {
      title: '正在告警 | 告警',
      label: '正在告警',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '告警：正在告警'
        }
      ],
      table: [tableIdConfig.alarmDevice],
      keepAlive: true
    },
    component: () => import('../../pages/alarm/AlarmDevice')
  },
  // 正在告警记录
  alarmDeviceRecord: {
    path: '/admin/alarm/device/:did/record',
    tag: permissionConfig.alarm,
    name: 'admin.alarm.device.record',
    parent: 'admin.home',
    relation: 'admin.alarm.device',
    meta: {
      title: '正在告警详情 | 告警',
      label: '正在告警',
      breadcrumb: [
        {
          title: '告警：正在告警',
          name: 'admin.alarm.device'
        },
        {
          title: '告警记录'
        }
      ],
      table: [tableIdConfig.alarmRecord],
      keepAlive: true
    },
    component: () => import('../../pages/alarm/AlarmDeviceRecord')
  },
  // 正在告警记录详情
  alarmDeviceRecordDetail: {
    path: '/admin/alarm/device/:did/record/:aid/detail',
    tag: permissionConfig.alarm,
    name: 'admin.alarm.device.record.detail',
    parent: 'admin.home',
    relation: 'admin.alarm.device.record',
    meta: {
      title: '告警记录详情 | 告警',
      label: '告警记录详情',
      breadcrumb: [
        {
          title: '告警：设备告警列表',
          name: 'admin.alarm.device'
        },
        {
          title: '告警记录',
          name: 'admin.alarm.device.record'
        },
        {
          title: '告警详情'
        }
      ],
      // 额外配置的父子级关系，用于路由跳转，tableState 等信息的保留 Henry 2020-06-16 12:11:09
      extraParent: [monitor.monitorRoomDetail.name]
    },
    component: () => import('../../pages/alarm/AlarmRecordDetail')
  },

  // 告警记录
  alarmRecord: {
    path: '/admin/alarm/record',
    tag: permissionConfig.alarm,
    name: 'admin.alarm.record',
    parent: 'admin.home',
    relation: 'admin.alarm',
    meta: {
      title: '告警记录 | 告警',
      label: '告警记录',
      icon: 'icon-nav-gaojing',
      breadcrumb: [
        {
          title: '告警：告警记录'
        }
      ],
      table: [tableIdConfig.alarmRecord],
      keepAlive: true
    },
    component: () => import('../../pages/alarm/AlarmRecord')
  },
  // 告警记录详情
  alarmRecordDetail: {
    path: '/admin/alarm/record/:aid/detail',
    tag: permissionConfig.alarm,
    name: 'admin.alarm.record.detail',
    parent: 'admin.home',
    relation: 'admin.alarm.record',
    meta: {
      title: '告警记录详情 | 告警',
      label: '告警记录详情',
      breadcrumb: [
        {
          title: '告警记录',
          name: 'admin.alarm.record'
        },
        {
          title: '告警详情'
        }
      ],
      extraParent: [monitor.monitorRoomDetail.name]
    },
    component: () => import('../../pages/alarm/AlarmRecordDetail')
  }
};
