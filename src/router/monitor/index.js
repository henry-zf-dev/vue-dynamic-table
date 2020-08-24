import { permissionConfig } from '../../config/permission';
import { tableIdConfig } from '../../config/common';

export default {
  // 监控
  monitor: {
    path: '/admin/monitor',
    tag: permissionConfig.monitor,
    name: 'admin.monitor',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      label: '监控',
      icon: 'icon-nav-jiankong'
    }
  },

  // 仪表盘
  dashboard: {
    path: '/admin/monitor/dashboard',
    tag: permissionConfig.dashboard, // 用于根据用户用于的权限集，筛选出路由相关权限，并组装侧边栏数据源
    name: 'admin.monitor.dashboard',
    parent: 'admin.home', // 所有路由的parent都是'admin.home'，避免<router-view>未加载，导致路由跳转了，但是组件无法渲染的问题
    relation: 'admin.monitor', // 用于组装侧边导航栏的嵌套结构
    meta: {
      title: '仪表盘 | 监控', // 页面 title
      label: '仪表盘', // 侧边导航栏显示文字
      breadcrumb: [
        {
          title: '监控：仪表盘'
        }
      ],
      keepAlive: true
    },
    component: () => import('../../pages/dashboard/Dashboard')
  },
  // 房间
  monitorRoom: {
    path: '/admin/monitor/room',
    tag: permissionConfig.monitorRoomManage,
    name: 'admin.monitor.room',
    parent: 'admin.home',
    relation: 'admin.monitor',
    meta: {
      title: '房间监控 | 监控',
      label: '房间监控',
      icon: 'icon-nav-huiyishi',
      breadcrumb: [
        {
          title: '监控：房间'
        }
      ],
      table: [tableIdConfig.monitorRoom], // 记录当前页面的 table，用于路由变换时清空 tableState 的判断
      keepAlive: true
    },
    component: () => import('../../pages/monitor/room/Room')
  },
  // 房间详情
  monitorRoomDetail: { // 监控--》房间--》详情
    path: '/admin/monitor/room/:rid/detail',
    tag: permissionConfig.monitorRoomManage,
    name: 'admin.monitor.room.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.room',
    meta: {
      title: '房间详情 | 监控',
      label: '房间详情',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情'
        }
      ],
      table: [tableIdConfig.monitorRoomDevice],
      keepAlive: false
    },
    component: () => import('../../pages/monitor/room/RoomDetail')
  },

  // 房间自检规则
  monitorRoomSelfCheck: {
    path: '/admin/monitor/room/:rid/detail/selfCheck',
    tag: permissionConfig.monitorRoomSelfCheck,
    name: 'admin.monitor.room.detail.selfCheck',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail',
    meta: {
      title: '房间自检规则 | 监控',
      label: '房间自检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '自检规则'
        }
      ],
      table: [tableIdConfig.monitorRoomSelfCheckRule],
      keepAlive: true
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRule')
  },
  // 新增房间自检规则
  monitorRoomSelfCheckAdd: {
    path: '/admin/monitor/room/:rid/roomDetail/selfCheck/add',
    tag: permissionConfig.monitorRoomSelfCheckManage,
    name: 'admin.monitor.room.detail.selfCheck.add',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.selfCheck',
    meta: {
      title: '新增房间自检规则 | 监控',
      label: '新增房间自检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '自检规则',
          name: 'admin.monitor.room.detail.selfCheck'
        },
        {
          title: '新增自检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleOpt')
  },
  // 编辑房间自检规则
  monitorRoomSelfCheckEdit: {
    path: '/admin/monitor/room/:rid/detail/selfCheck/:sid/edit',
    tag: permissionConfig.monitorRoomAlarmManage,
    name: 'admin.monitor.room.detail.selfCheck.edit',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.selfCheck',
    meta: {
      title: '编辑房间自检规则 | 监控',
      label: '编辑房间自检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '自检规则',
          name: 'admin.monitor.room.detail.selfCheck'
        },
        {
          title: '编辑自检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleOpt')
  },
  // 房间自检规则详情
  monitorRoomSelfCheckDetail: {
    path: '/admin/monitor/room/:rid/detail/selfCheck/:sid/detail',
    tag: permissionConfig.monitorRoomSelfCheckManage,
    name: 'admin.monitor.room.detail.selfCheck.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.selfCheck',
    meta: {
      title: '房间自检规则详情 | 监控',
      label: '房间自检规则详情',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '自检规则',
          name: 'admin.monitor.room.detail.selfCheck'
        },
        {
          title: '自检详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleDetail')
  },
  // 房间自检规则设为告警
  monitorRoomSelfCheckSetAlarm: {
    path: '/admin/monitor/room/:rid/detail/selfCheck/:sid/setAlarm',
    tag: permissionConfig.monitorRoomSelfCheckManage,
    name: 'admin.monitor.room.detail.selfCheck.setAlarm',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.selfCheck',
    meta: {
      title: '房间告警 | 告警',
      label: '房间告警',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '自检规则',
          name: 'admin.monitor.room.detail.selfCheck'
        },
        {
          title: '设为告警'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleOpt')
  },

  // 房间联检规则
  monitorRoomJointCheckRule: {
    path: '/admin/monitor/room/:rid/detail/joint',
    tag: permissionConfig.monitorRoomJointCheckRule,
    name: 'admin.monitor.room.detail.joint',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail',
    meta: {
      title: '房间联检规则 | 联检',
      label: '房间联检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '联检规则'
        }
      ],
      table: [tableIdConfig.monitorRoomJointCheckRule],
      keepAlive: true
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRule')
  },
  // 新增房间联检规则
  monitorRoomJointCheckRuleAdd: {
    path: '/admin/monitor/room/:rid/detail/joint/add',
    tag: permissionConfig.monitorRoomJointCheckRuleManage,
    name: 'admin.monitor.room.detail.joint.add',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.joint',
    meta: {
      title: '新增房间联检规则 | 联检',
      label: '新增房间联检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '联检规则',
          name: 'admin.monitor.room.detail.joint'
        },
        {
          title: '新增联检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleOpt')
  },
  // 编辑房间联检规则
  monitorRoomJointCheckRuleEdit: {
    path: '/admin/monitor/room/:rid/detail/joint/:jid/edit',
    tag: permissionConfig.monitorRoomJointCheckRuleManage,
    name: 'admin.monitor.room.detail.joint.edit',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.joint',
    meta: {
      title: '编辑房间联检规则 | 联检',
      label: '编辑房间联检规则',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '联检规则',
          name: 'admin.monitor.room.detail.joint'
        },
        {
          title: '编辑联检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleOpt')
  },
  // 房间联检详情
  monitorRoomJointCheckRuleDetail: {// 监控--》房间--》详情--》联检规则--》详情
    path: '/admin/monitor/room/:rid/detail/joint/:jid/detail',
    tag: permissionConfig.monitorRoomJointCheckRuleManage,
    name: 'admin.monitor.room.detail.joint.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.joint',
    meta: {
      title: '房间联检规则详情 | 联检',
      label: '房间联检规则详情',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '联检规则',
          name: 'admin.monitor.room.detail.joint'
        },
        {
          title: '联检详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleDetail')
  },

  // 房间告警规则
  monitorRoomAlarm: {
    path: '/admin/monitor/room/:rid/detail/alarm',
    tag: permissionConfig.monitorRoomAlarm,
    name: 'admin.monitor.room.detail.alarm',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail',
    meta: {
      title: '房间告警 | 告警',
      label: '房间告警',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '房间告警'
        }
      ],
      table: [tableIdConfig.monitorRoomAlarmRule],
      keepAlive: true
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRule')
  },
  // 新增房间告警规则
  monitorRoomAlarmAdd: {
    path: '/admin/monitor/room/:rid/detail/alarm/add',
    tag: permissionConfig.monitorRoomAlarmManage,
    name: 'admin.monitor.room.detail.alarm.add',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.alarm',
    meta: {
      title: '新增房间告警 | 告警',
      label: '新增房间告警',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '房间告警',
          name: 'admin.monitor.room.detail.alarm'
        },
        {
          title: '新增告警'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleOpt')
  },
  // 编辑房间告警规则
  monitorRoomAlarmEdit: {
    path: '/admin/monitor/room/:rid/detail/alarm/:aid/edit',
    tag: permissionConfig.monitorRoomAlarmManage,
    name: 'admin.monitor.room.detail.alarm.edit',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.alarm',
    meta: {
      title: '编辑房间告警 | 告警',
      label: '编辑房间告警',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '房间告警',
          name: 'admin.monitor.room.detail.alarm'
        },
        {
          title: '编辑告警'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleOpt')
  },
  // 房间告警规则详情
  monitorRoomAlarmDetail: {
    path: '/admin/monitor/room/:rid/detail/alarm/:aid/detail',
    tag: permissionConfig.monitorRoomAlarmManage,
    name: 'admin.monitor.room.detail.alarm.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.room.detail.alarm',
    meta: {
      title: '房间告警详情 | 告警',
      label: '房间告警详情',
      breadcrumb: [
        {
          title: '监控：房间',
          name: 'admin.monitor.room'
        },
        {
          title: '房间详情',
          name: 'admin.monitor.room.detail'
        },
        {
          title: '房间告警',
          name: 'admin.monitor.room.detail.alarm'
        },
        {
          title: '告警详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleDetail')
  },

  // 运维报告（Tab：房间报告、自检报告、联检报告）
  monitorDevOpsReport: {
    path: '/admin/monitor/devOps',
    tag: permissionConfig.monitorAllDevOpsReport,
    name: 'admin.monitor.devOps',
    parent: 'admin.home',
    relation: 'admin.monitor',
    meta: {
      title: '运维报告 | 监控',
      label: '运维报告',
      icon: 'icon-nav-zijianjilu',
      withTab: true,
      table: [
        tableIdConfig.monitorSelfCheckReport,
        tableIdConfig.monitorJointCheckReport,
        tableIdConfig.monitorRoomReport
      ],
      keepAlive: true
    },
    component: () => import('../../pages/monitor/devOpsReport/DevOpsReport')
  },
  // 房间报告详情
  monitorRoomReportDetail: {
    path: '/admin/monitor/devOps/:rid/room/:roomId/detail',
    tag: permissionConfig.monitorAllDevOpsReport,
    name: 'admin.monitor.devOps.room.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.devOps',
    meta: {
      title: '房间报告',
      icon: 'el-icon-menu',
      module: 'monitor',
      index: 'monitorDevOps',
      breadcrumb: [
        {
          title: '运维：房间运维报告',
          name: 'admin.monitor.devOps'
        },
        {
          title: '房间报告详情'
        }
      ],
      extraParent: ['admin.monitor.room.detail']
    },
    component: () => import('../../pages/monitor/devOpsReport/roomReport/RoomReportDetail')
  },
  // 自检报告详情
  monitorDevOpsSelfCheckReportDetail: {
    path: '/admin/monitor/devOps/selfCheck/:sid/detail',
    tag: permissionConfig.monitorAllDevOpsReport,
    name: 'admin.monitor.devOps.selfCheck.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.devOps',
    meta: {
      title: '自检报告详情 | 运维报告',
      label: '自检报告详情',
      breadcrumb: [
        {
          title: '运维：自检报告',
          name: 'admin.monitor.devOps'
        },
        {
          title: '自检详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/devOpsReport/selfCheckReport/SelfCheckReportDetail')
  },
  // 联检报告详情
  monitorDevOpsJointCheckReportDetail: {
    path: '/admin/monitor/devOps/joint/:jid/detail',
    tag: permissionConfig.monitorAllDevOpsReport,
    name: 'admin.monitor.devOps.joint.detail',
    parent: 'admin.home',
    relation: 'admin.monitor.devOps',
    meta: {
      title: '联检报告',
      icon: 'el-icon-menu',
      module: 'monitor',
      index: 'monitorDevOps',
      label: '联检报告详情',
      breadcrumb: [
        {
          title: '运维：联检报告',
          name: 'admin.monitor.devOps'
        },
        {
          title: '联检详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/devOpsReport/jointCheckReport/JointCheckReportDetail')
  },

  // 系统日志（Tab：操作日志、设备日志、房间日志、自检日志）
  monitorSystemLog: {
    path: '/admin/monitor/systemLog',
    tag: permissionConfig.monitorAllSystemLog,
    name: 'admin.monitor.systemLog',
    parent: 'admin.home',
    relation: 'admin.monitor',
    meta: {
      title: '系统日志 | 监控',
      label: '系统日志',
      icon: 'icon-nav-rizhi',
      withTab: true,
      table: [
        tableIdConfig.monitorOperationLog,
        tableIdConfig.monitorDeviceLog,
        tableIdConfig.roomLog
      ],
      keepAlive: true
    },
    component: () => import('../../pages/monitor/systemLog/SystemLog')
  }

};
