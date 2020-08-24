export const permissionConfig = {

  // region ************************仪表盘**********************
  dashboard: 'dashboard',
  // endregion

  // region ************************监控************************
  monitor: 'monitor',

  // region **********监控房间**************
  // 监控房间--》查看（房间列表、房间详情）
  monitorRoom: 'monitor.room',
  // 监控房间--》管理（设备监控）
  monitorRoomManage: 'monitor.room.manage',
  // 自检规则--》查看（自检规则列表、自检规则详情）
  monitorRoomSelfCheck: 'monitor.room.selfCheck',
  // 自检规则--》管理（新增、编辑、设为告警、启用禁用）
  monitorRoomSelfCheckManage: 'monitor.room.selfCheck.manage',
  // 自检规则--》删除
  monitorRoomSelfCheckDelete: 'monitor.room.selfCheck.delete',
  // 联检规则--》查看（联检规则列表、联检规则详情）
  monitorRoomJointCheckRule: 'monitor.room.jointInspection',
  // 联检规则--》管理（新增、编辑、执行联检、启用禁用）
  monitorRoomJointCheckRuleManage: 'monitor.room.jointInspection.manage',
  // 联检规则--》删除
  monitorRoomJointCheckRuleDelete: 'monitor.room.jointInspection.delete',
  // 告警规则--》查看（告警规则列表、告警规则详情）
  monitorRoomAlarm: 'monitor.room.alarm',
  // 告警规则--》管理（新增、编辑、启用禁用）
  monitorRoomAlarmManage: 'monitor.room.alarm.manage',
  // 告警规则--》删除
  monitorRoomAlarmDelete: 'monitor.room.alarm.delete',
  // 生成运维报告
  monitorRoomCreateDevOpsReport: 'monitor.room.createDevOpsReport',
  // 监控房间--》跳转至分控
  monitorRoomJumpToSubControl: 'monitor.room.jumpToSubControl',

  // endregion

  // region **********所有运维报告**********
  // 包含自检报告、联检报告、房间报告
  monitorAllDevOpsReport: 'monitor.allDevOpsReport',
  // endregion

  // region **********所有系统日志**********
  // 包含操作日志、设备日志、房间日志、自检日志
  monitorAllSystemLog: 'monitor.allSystemLog',
  // endregion

  // endregion

  // region ************************告警************************
  // 包含告警设备、告警记录
  // 告警--》查看（告警列表、告警详情）
  alarm: 'alarm',
  // 告警--》管理（告警恢复）
  alarmManage: 'alarm.manage',
  // endregion

  // region ************************管理************************
  management: 'management',

  // region ************区域管理************
  // 区域管理--》查看（房间列表、房间详情）
  managementArea: 'management.area',
  // 区域管理--》管理（区域导入房间、区域下载模板、区域新增子层、区域新增房间、区域设置管理员、区域重命名、房间查看、房间编辑）
  managementAreaManage: 'management.area.manage',
  // 区域管理==》导出房间
  managementAreaExportRoom: 'management.area.exportRoom',
  // 区域管理--》删除（区域删除、房间删除）
  managementAreaDelete: 'management.area.delete',
  // endregion

  // region ************设备管理************
  // 设备管理--》查看（设备列表、设备详情）
  managementDevice: 'management.device',
  // 设备管理--》管理（编辑、设备导入）
  managementDeviceManage: 'management.device.manage',
  // endregion

  // region ************分控管理************
  // 分控管理--》查看（分控列表、分控详情）
  managementSubControl: 'management.subControl',
  // 分控管理--》管理（新增、编辑、跳转、启用禁用）
  managementSubControlManage: 'management.subControl.manage',
  // endregion

  // endregion

  // region ************************人员************************
  personnel: 'personnel',
  // region ************用户管理************
  // 用户管理--》查看（用户列表、用户详情）
  personnelUser: 'personnel.user',
  // 用户管理--》管理（新增、编辑、重置密码）
  personnelUserManage: 'personnel.user.manage',
  // 用户管理--》删除
  personnelUserDelete: 'personnel.user.delete',

  // endregion

  // region ************角色管理************
  // 角色管理--》查看（角色列表、角色详情）
  personnelRole: 'personnel.role',
  // 角色管理--》管理（新增、编辑、重置密码）
  personnelRoleManage: 'personnel.role.manage',
  // 角色管理--》删除
  personnelRoleDelete: 'personnel.role.delete',
  // endregion

  // endregion

  // region ************************设置************************
  // 包含自检规则、告警规则、系统设置
  system: 'system'
  // endregion
};
