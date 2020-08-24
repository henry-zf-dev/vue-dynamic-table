import { permissionConfig } from '../../config/permission';
import { tableIdConfig } from '../../config/common';

export default {
  // 设置
  system: {
    path: '/admin/system',
    tag: permissionConfig.system,
    name: 'admin.system',
    parent: 'admin.home',
    relation: 'admin.home',
    meta: {
      title: '设置',
      label: '设置',
      icon: 'icon-nav-shezhi1'
    }
  },

  // // 规则（Tab：全局自检规则、所有房间自检规则）
  // systemSelfCheckRule: {
  //   path: '/admin/system/selfCheckRule',
  //   tag: permissionConfig.system,
  //   name: 'admin.system.selfCheckRule',
  //   parent: 'admin.home',
  //   relation: 'admin.system',
  //   meta: {
  //     title: '自检项 | 设置',
  //     label: '自检项',
  //     icon: 'icon-nav-quanjuzijian',
  //     withTab: true,
  //     table: [
  //       tableIdConfig.globalSelfCheckRule, tableIdConfig.roomSelfCheckRule,
  //       tableIdConfig.roomJointCheckRule, tableIdConfig.roomSelfCheckRuleTemplate
  //     ],
  //     keepAlive: true
  //   },
  //   component: () => import('../../pages/system/selfCheckRule/SelfCheckRule')
  // },
  // 编辑全局自检规则
  systemGlobalSelfCheckEdit: {
    path: '/admin/system/selfCheckRule/global/:sid/edit',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.global.edit',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.global',
    meta: {
      title: '编辑自检 | 全局自检规则',
      label: '编辑自检',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：全局自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '编辑自检'
        }
      ]
    },
    component: () => import('../../pages/system/selfCheckRule/SelfCheckRuleOpt')
  },
  // 全局自检规则设为告警
  systemGlobalSelfCheckSetAlarm: {
    path: '/admin/system/selfCheckRule/global/:sid/setAlarm',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.global.setAlarm',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.global',
    meta: {
      title: '编辑自检 | 全局自检规则',
      label: '设为告警',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：全局自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '设为告警'
        }
      ]
    },
    component: () => import('../../pages/system/alarmRule/AlarmRuleOperation')
  },

  // 具体房间自检规则列表
  systemRoomSelfCheckList: {
    path: '/admin/system/selfCheckRule/room/:rid/list',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.room.list',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.room',
    meta: {
      title: '房间自检规则 | 设置',
      label: '房间自检',
      breadcrumb: [
        {
          title: '设置：房间自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '自检列表'
        }
      ],
      table: [tableIdConfig.monitorRoomSelfCheckRule],
      keepAlive: true
    },
    component: () => import('../../pages/system/selfCheckRule/room/RoomSelfCheckRuleDetail')
  },
  // 新增具体房间自检规则
  systemRoomSelfCheckListAdd: {
    path: '/admin/system/selfCheckRule/room/:rid/list/:isCheck/add',
    tag: permissionConfig.system,
    name: 'dmin.system.selfCheckRule.room.list.add',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.room.list',
    meta: {
      title: '新增自检 | 房间自检规则',
      label: '新增自检',
      breadcrumb: [
        {
          title: '设置：房间自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '自检列表',
          name: 'admin.system.selfCheckRule.room.list'
        },
        {
          title: '新增自检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleOpt')
  },
  // 编辑具体房间自检规则
  systemRoomSelfCheckListEdit: {
    path: '/admin/system/selfCheckRule/:sid/room/:rid/list/:isCheck/edit',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.room.list.edit',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.room.list',
    meta: {
      title: '编辑自检 | 房间自检规则',
      label: '编辑自检',
      breadcrumb: [
        {
          title: '设置：房间自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '自检列表',
          name: 'admin.system.selfCheckRule.room.list'
        },
        {
          title: '编辑自检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleOpt')
  },
  // 具体房间自检规则列表详情
  systemRoomSelfCheckListDetail: {
    path: '/admin/system/selfCheckRule/:sid/room/:rid/list/:isCheck/detail',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.room.list.detail',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.room.list',
    meta: {
      title: '房间自检规则详情 | 房间自检规则',
      label: '房间自检规则详情',
      breadcrumb: [
        {
          title: '设置：房间自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '自检列表',
          name: 'admin.system.selfCheckRule.room.list'
        },
        {
          title: '详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/selfCheckRule/MonitorRoomSelfCheckRuleDetail')
  },
  // 具体房间自检规则设为告警
  systemRoomSelfCheckListSetAlarm: {
    path: '/admin/system/selfCheckRule/:sid/room/:rid/list/:isCheck/setAlarm',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.room.list.setAlarm',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.room.list',
    meta: {
      title: '房间告警规则 | 设置',
      label: '房间告警规则',
      breadcrumb: [
        {
          title: '设置：房间自检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '自检列表',
          name: 'admin.system.selfCheckRule.room.list'
        },
        {
          title: '设为告警'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleOpt')
  },

  // 具体房间联检规则列表
  systemRoomJointCheckRuleList: {
    path: '/admin/system/selfCheckRule/:rid/joint/list',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.joint.list',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.joint',
    meta: {
      title: '房间联检规则 | 设置',
      label: '房间联检',
      breadcrumb: [
        {
          title: '设置：房间联检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '联检列表'
        }
      ],
      table: [tableIdConfig.monitorRoomJointCheckRule],
      keepAlive: true
    },
    component: () => import('../../pages/system/selfCheckRule/room/RoomJointCheckRuleDetail')
  },
  // 新增具体房间联检规则
  systemRoomJointCheckRuleListAdd: {
    path: '/admin/system/selfCheckRule/:rid/joint/list/:isCheck/add',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.joint.list.add',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.joint.list',
    meta: {
      title: '新增联检 | 房间联检规则',
      label: '新增联检',
      breadcrumb: [
        {
          title: '设置：房间联检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '联检列表',
          name: 'admin.system.selfCheckRule.joint.list'
        },
        {
          title: '新增联检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleOpt')
  },
  // 编辑具体房间联检规则
  systemRoomJointCheckRuleListEdit: {
    path: '/admin/system/selfCheckRule/:jid/room/:rid/joint/list/:isCheck/edit',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.joint.list.edit',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.joint.list',
    meta: {
      title: '编辑联检 | 房间联检规则',
      label: '编辑联检',
      breadcrumb: [
        {
          title: '设置：房间联检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '联检列表',
          name: 'admin.system.selfCheckRule.joint.list'
        },
        {
          title: '编辑联检'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleOpt')
  },
  // 具体房间联检规则列表详情
  systemRoomJointCheckRuleListDetail: {
    path: '/admin/system/selfCheckRule/:jid/room/:rid/joint/list/:isCheck/detail',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.joint.list.detail',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.joint.list',
    meta: {
      title: '房间联检规则详情 | 房间联检规则',
      label: '房间联检规则详情',
      breadcrumb: [
        {
          title: '设置：房间联检',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '联检列表',
          name: 'admin.system.selfCheckRule.joint.list'
        },
        {
          title: '详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/jointCheckRule/MonitorRoomJointCheckRuleDetail')
  },

  // 新增自检规则模板
  systemSelfCheckTemplateAdd: {
    path: '/admin/system/selfCheckRule/SelfTemplate/add',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.SelfTemplate.add',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.SelfTemplate',
    meta: {
      title: '新增自检模板 | 自检模板',
      label: '新增自检模板',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：自检模板',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '新增自检模板'
        }
      ]
    },
    component: () => import('../../pages/system/selfCheckRule/template/SelfCheckRuleTemplateOpt')
  },
  // 编辑自检规则模板
  systemSelfCheckTemplateEdit: {
    path: '/admin/system/selfCheckRule/SelfTemplate/:tid/edit',
    tag: permissionConfig.system,
    name: 'admin.system.selfCheckRule.SelfTemplate.edit',
    parent: 'admin.home',
    relation: 'admin.system.selfCheckRule.SelfTemplate',
    meta: {
      title: '编辑自检模板 | 自检模板',
      label: '编辑自检模板',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：自检模板',
          name: 'admin.system.selfCheckRule'
        },
        {
          title: '编辑自检模板'
        }
      ]
    },
    component: () => import('../../pages/system/selfCheckRule/template/SelfCheckRuleTemplateOpt')
  },

  // 告警规则（Tab：全局告警规则、所有房间告警规则）
  systemAlarmRule: {
    path: '/admin/system/alarmRule',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule',
    parent: 'admin.home',
    relation: 'admin.system',
    meta: {
      title: '全局告警规则 | 系统设置',
      label: '告警规则',
      icon: 'icon-nav-gaojing',
      withTab: true,
      table: [tableIdConfig.globalAlarmRule, tableIdConfig.roomAlarmRule],
      keepAlive: true
    },
    component: () => import('../../pages/system/alarmRule/AlarmRule')
  },

  // 新增全局告警规则
  systemGlobalAlarmAdd: {
    path: '/admin/system/alarmRule/global/add',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.global.add',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.global',
    meta: {
      title: '新增告警规则 | 全局告警规则',
      label: '新增告警规则',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：全局告警',
          name: 'admin.system.alarmRule'
        },
        {
          title: '新增告警'
        }
      ]
    },
    component: () => import('../../pages/system/alarmRule/AlarmRuleOperation')
  },
  // 编辑全局告警规则
  systemGlobalAlarmEdit: {
    path: '/admin/system/alarmRule/:aid/global/edit',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.global.edit',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.global',
    meta: {
      title: '编辑告警规则 | 全局告警规则',
      label: '编辑告警规则',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：全局告警',
          name: 'admin.system.alarmRule'
        },
        {
          title: '编辑告警'
        }
      ]
    },
    component: () => import('../../pages/system/alarmRule/AlarmRuleOperation')
  },

  // 所有房间告警规则列表
  systemRoomAlarmList: {
    path: '/admin/system/alarmRule/room/:rid/list',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.room.list',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.room',
    meta: {
      title: '告警规则详情 | 房间告警规则',
      label: '告警规则详情',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：房间告警规则',
          name: 'admin.system.alarmRule'
        },
        {
          title: '告警列表'
        }
      ],
      table: [tableIdConfig.monitorRoomAlarmRule],
      keepAlive: true
    },
    component: () => import('../../pages/system/alarmRule/room/RoomAlarmRuleDetail')
  },
  // 新增具体房间告警规则
  systemRoomAlarmListAdd: {
    path: '/admin/system/alarmRule/room/:rid/list/add',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.room.list.add',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.room.list',
    meta: {
      title: '新增告警规则 | 房间告警规则',
      label: '新增告警规则',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：房间告警规则',
          name: 'admin.system.alarmRule'
        },
        {
          title: '告警列表',
          name: 'admin.system.alarmRule.room.list'
        },
        {
          title: '新增规则'
        }
      ]
    },
    component: () => import('../../pages/system/alarmRule/AlarmRuleOperation')
  },
  // 编辑具体房间告警规则
  systemRoomAlarmListEdit: {
    path: '/admin/system/alarmRule/:aid/room/:rid/list/edit',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.room.list.edit',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.room.list',
    meta: {
      title: '编辑告警规则 | 房间告警规则',
      label: '编辑告警规则',
      icon: 'icon-nav-rizhi',
      breadcrumb: [
        {
          title: '设置：房间告警规则',
          name: 'admin.system.alarmRule'
        },
        {
          title: '告警列表',
          name: 'admin.system.alarmRule.room.list'
        },
        {
          title: '编辑规则'
        }
      ]
    },
    component: () => import('../../pages/system/alarmRule/AlarmRuleOperation')
  },
  // 具体房间告警规则列表详情
  systemRoomAlarmListDetail: {
    path: '/admin/system/alarmRule/:aid/room/:rid/list/:isAlarm/detail',
    tag: permissionConfig.system,
    name: 'admin.system.alarmRule.room.list.detail',
    parent: 'admin.home',
    relation: 'admin.system.alarmRule.room.list',
    meta: {
      title: '告警规则详情 | 房间告警规则',
      label: '告警规则详情',
      breadcrumb: [
        {
          title: '设置：房间告警规则',
          name: 'admin.system.alarmRule'
        },
        {
          title: '告警列表',
          name: 'admin.system.alarmRule.room.list'
        },
        {
          title: '详情'
        }
      ]
    },
    component: () => import('../../pages/monitor/room/alarmRule/MonitorRoomAlarmRuleDetail')
  },

  // 系统设置（Tab：房间类型配置、扩展字段配置）
  systemSetting: {
    path: '/admin/system/setting',
    tag: permissionConfig.system,
    name: 'admin.system.setting',
    parent: 'admin.home',
    relation: 'admin.system',
    meta: {
      title: '系统设置',
      label: '系统设置',
      icon: 'icon-nav-shezhi',
      withTab: true,
      table: [tableIdConfig.systemRoomTypeConfig, tableIdConfig.systemExtFieldConfig],
      keepAlive: true
    },
    component: () => import('../../pages/system/SystemSetting')
  }
};
