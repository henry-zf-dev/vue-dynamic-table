export const commonConfig = {

};

// 通用状态颜色配置
export const statusColorConfig = {
  success: {
    bg: 'color-success',
    font: 'font-color-success'
  },
  warning: {
    bg: 'color-warning',
    font: 'font-color-warning'
  },
  danger: {
    bg: 'color-danger',
    font: 'font-color-danger'
  },
  info: {
    bg: 'color-info',
    font: 'font-color-info'
  },
  unknown: {
    bg: 'color-gray-70',
    font: 'font-gray-70'
  },
  // 分数circle颜色
  terrible: {
    bg: 'circle terrible-circle'
    // font: 'font-color-success'
  },
  poor: {
    bg: 'circle poor-circle'
    // font: 'font-color-warning'
  },
  general: {
    bg: 'circle general-circle'
    // font: 'font-color-danger'
  },
  good: {
    bg: 'circle good-circle'
    // font: 'font-color-info'
  },
  fine: {
    bg: 'circle fine-circle'
    // font: 'font-gray-70'
  }
};

// tableId 配置
export const tableIdConfig = {
  dynastyProgress: 'dynastyProgress',
  historyMilestone: 'historyMilestone',
  historyRepresentative: 'historyRepresentative',
  mountainsRivers: 'mountainsRivers',
  famousArchitecture: 'famousArchitecture',
  regionalCulture: 'regionalCulture',
  famousLiterature: 'famousLiterature',
  mythologyAllegory: 'mythologyAllegory',
  characterCalligraphy: 'characterCalligraphy',
  thoughtFactions: 'thoughtFactions',
  greatThinker: 'greatThinker',
  traditionFestival: 'traditionFestival',
  zodiacCulture: 'zodiacCulture',
  cuisineCulinary: 'cuisineCulinary',
  musicDrama: 'musicDrama',
  ChineseWushu: 'ChineseWushu',
  folkHandicraft: 'folkHandicraft',
  ethnicMinority: 'ethnicMinority'

};

// table 操作按钮配置
export const tableOptBtnConfig = {
  detail: {
    label: '查看',
    type: 'detail'
  },
  edit: {
    label: '编辑',
    type: 'edit'
  },
  delete: {
    label: '删除',
    type: 'delete'
  },
  monitor: {
    label: '监控',
    type: 'monitor'
  },
  online: {
    label: '上线',
    type: 'online'
  },
  offline: {
    label: '下线',
    type: 'offline'
  },
  reform: {
    label: '改造',
    type: 'reform'
  },
  enable: {
    label: '启用',
    type: 'enable'
  },
  forbidden: {
    label: '禁用',
    type: 'forbidden'
  },
  apply: {
    label: '应用',
    type: 'apply'
  },
  cancel: {
    label: '取消应用',
    type: 'cancel'
  },
  statistics: {
    label: '查看统计',
    type: 'statistics'
  },
  allocate: {
    label: '分配人员',
    type: 'allocate'
  },
  resetPwd: {
    label: '重置密码',
    type: 'resetPwd'
  },
  download: {
    label: '下载附件',
    type: 'download'
  },
  setAlarm: {
    label: '设为告警',
    type: 'setAlarm'
  },
  jump: {
    label: '跳转',
    type: 'jump'
  },
  applyToRoom: {
    label: '应用至房间',
    type: 'applyToRoom'
  },
  implementJoint: {
    label: '执行联检',
    type: 'implementJoint'
  },
  recovery: {
    label: '恢复',
    type: 'recovery'
  },
  debugging: {
    label: '调试',
    type: 'debugging'
  }
};

// tab 配置
export const pageTabConfig = {
  devOpsReport: {
    roomReport: 'roomReport',
    selfCheckReport: 'selfCheckReport',
    jointCheckReport: 'jointCheckReport'
  },
  systemLog: {
    operationLog: 'operationLog',
    deviceLog: 'deviceLog',
    roomLog: 'roomLog',
    selfCheckLog: 'selfCheckLog'
  },
  alarmRule: {
    globalAlarmRule: 'globalAlarmRule',
    roomAlarmRule: 'roomAlarmRule'
  },
  selfCheckRule: {
    globalSelfCheckRule: 'globalSelfCheckRule',
    roomSelfCheckRule: 'roomSelfCheckRule',
    roomJointCheckRule: 'roomJointCheckRule',
    selfCheckRuleTemplate: 'selfCheckRuleTemplate'
  },
  systemSetting: {
    roomTypeSetting: 'roomTypeSetting',
    customFieldSetting: 'customFieldSetting',
    tableColumnSetting: 'tableColumnSetting'
  }
};

// moment 时间格式
export const momentFormat = {
  datetime: 'YYYY-MM-DD HH:mm',
  dateTimeDetail: 'YYYY-MM-DD HH:mm:ss',
  datetimeWithDay: 'YYYY-MM-DD HH:mm (dddd)',
  date: 'YYYY-MM-DD',
  dateWithDay: 'YYYY-MM-DD dddd',
  yearMonth: 'YYYY-MM',
  dateFormatMonthCN: 'YYYY年MM月',
  dateFormatDay: 'YYYY-MM-DD',
  dateFormatDaySlant: 'YYYY/MM/DD',
  dateFormatDaySlantDetail: 'YYYY/MM/DD HH:mm:ss',
  time: 'HH:mm',
  times: 'HH:mm:ss',
  datetimeLog: 'YYYY-MM-DD HH:mm:ss SSS',
  smsDate: 'MMMDo', // 4月23日
  dateMonthDay: 'MM-DD',
  yearFormat: 'YYYY',
  monthFormat: 'MM',
  defaultTimeZone: 'Asia/Shanghai',
  timestamp: 'X',
  timestampDetail: 'x',
  dateTimeDetailCN: 'YYYY年MM月DD日 HH:mm:ss'
};
