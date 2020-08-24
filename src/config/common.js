import {baseUrl} from './env';

/* ========== api、ws 相关配置 ==========*/

export const apiType = {
  core: '/api',
  manager: '/api'
};

export const fileUploadApi = {
  fileInfo: `${baseUrl}${apiType.core}/file-info/upload`, // 文件地址
  deviceSync: `${baseUrl}${apiType.manager}/device/sync`, // 离线导入设备库数据
  roomImport: `${baseUrl}${apiType.core}/room-info/import`, // 导入房间
  imgCaptcha: 'api/captcha' // 获取图片验证码
};

export const fileDownloadApi = {
  exportAllRoom: `${baseUrl}${apiType.core}/room-info/export`, // 导出房间(全量/条件)
  downloadRoomTemplate: `${baseUrl}${apiType.core}/room-info/download`, // 下载房间模板
  exportDevice: `${baseUrl}${apiType.core}/device/export` // 导出设备
};

export const websocketType = { // websocket订阅的类型
  deviceStatus: 'deviceStatus', // 设备状态
  roomAlarm: 'roomAlarm', // 房间告警
  roomScore: 'roomScore', // 房间分数
  deviceAlarm: 'deviceAlarm', // 设备告警
  deviceOnline: 'deviceOnline', // 设备在线状态
  roomUsageState: 'roomUsageState' // 房间有人无人、开关系统、情景ID、自动共享状态
};

export const ssoUrlConfig = {
  dev: 'https://t-ssov2.myoas.com/sso/user/authenticate',
  prod: 'https://ssov2.myoas.com/sso/user/authenticate'
};

/* ====================================*/

export const deviceCtrFunc = {
  projector: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setSource: {
      method: 'setSource', // setSource
      params: ['source']
    }
  },
  display: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setSource: {
      method: 'setSource', // 设置输入源
      params: ['source']
    },
    setScreen: {
      method: 'setScreen', // 设置亮息屏状态
      params: ['screen']
    },
    toggleScreen: {
      method: 'toggleScreen' // 设置亮息屏状态 (无参数)
    },
    setMute: {
      method: 'setMute', // 设置静音/取消静音
      params: ['mute']
    },
    setVolume: {
      method: 'setVolume', // 设置音量
      params: ['volume']
    }
  },
  microphone: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setReboot: {
      method: 'setReboot' // 重启
    },
    setVolume: {
      method: 'setVolume', // 设置音量
      params: ['volume']
    },
    setMute: {
      method: 'setMute', // 设置静音/取消静音
      params: ['mute']
    },
    setRfIntensity: {
      method: 'setRfIntensity', // 设置射频信号强度
      params: ['rfIntensity']
    }
  },
  audioProcessor: {
    setChannelMute: {
      method: 'setChannelMute', // 设置通道静音/取消静音
      params: ['module', 'channel', 'mute']
    },
    setChannelVolume: {
      method: 'setChannelVolume', // 设置通道音量
      params: ['module', 'channel', 'volume']
    },
    setMode: {
      method: 'setMode', // 设置模式
      params: ['mode']
    }
  },
  camera: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setHorizontal: {
      method: 'setHorizontal', // 设置水平方向转动
      params: ['horizontal']
    },
    setVertical: {
      method: 'setVertical', // 设置垂直方向转动
      params: ['vertical']
    },
    setFocus: {
      method: 'setFocus', // 设置焦距
      params: ['focus']
    },
    setZoom: {
      method: 'setZoom', // 设置缩放
      params: ['zoom']
    },
    setFullScreen: {
      method: 'setFullScreen' // 全屏/取消全屏
    },
    setMonitor: {
      method: 'setMonitor', // 开启/关闭跟踪
      params: ['monitor']
    },
    setMode: {
      method: 'setMode', // 设置模式
      params: ['mode']
    }
  },
  power: {
    setAllChannelPower: {
      method: 'setAllChannelPower', // 设置全开/全关
      params: ['power']
    },
    setChannelPowerOn: {
      method: 'setChannelPowerOn', // 设置单个通道开
      params: ['channel']
    },
    setChannelPowerOff: {
      method: 'setChannelPowerOff', // 设置单个通道关
      params: ['channel']
    },
    setMulChannelPower: {
      method: 'setMulChannelPower', // 设置多通道开
      params: ['onChannels', 'offChannels']
    }
  },
  videoConfHost: {
    setPower: {
      method: 'setPower', // 主机开关机
      params: ['power']
    },
    callJoin: {
      method: 'callJoin', // 加入会议
      params: ['number']
    },
    callJoinWithPwd: {
      method: 'callJoinWithPwd', // 输入密码加入已存在的会议
      params: ['callId', 'dtmfIndex']
    },
    callJoinEncrypted: {
      method: 'callJoinEncrypted', // 加入加密会议
      params: ['number', 'password']
    },
    callHangUp: {
      method: 'callHangUp', // 挂断会议
      params: ['callId']
    },
    callHangUpWithoutParams: {
      method: 'callHangUp' // 挂断会议（无参数）
    },
    setSharingMode: {
      method: 'setSharingMode', // 设置共享模式：本地/远程/开启/关闭
      params: ['sharingMode']
    },
    setSharingOff: {
      method: 'setSharingOff' // 关闭共享(本地加远程都关闭)
    },
    setDisturb: {
      method: 'setDisturb', // 设置免打扰
      params: ['isDisturbed']
    },
    setMute: {
      method: 'setMute', // 设置通道静音/取消静音
      params: ['mute']
    },
    setVolume: {
      method: 'setVolume', // 设置音量值
      params: ['volume']
    },
    setCameraPower: {
      method: 'setCameraPower', // 摄像头开关机
      params: ['cameraPower']
    },
    setCameraZoom: {
      method: 'setCameraZoom', // 摄像头缩放
      params: ['zoom', 'cameraId']
    },
    setCameraHorizontal: {
      method: 'setCameraHorizontal', // 摄像头左右
      params: ['horizontal', 'cameraId']
    },
    setCameraVertical: {
      method: 'setCameraVertical', // 摄像头上下
      params: ['vertical', 'cameraId']
    },
    setCameraFullScreen: {
      method: 'setCameraFullScreen', // 摄像头全屏
      params: ['action']
    }
  },
  videoMatrix: {
    setInputOutputRoute: {
      method: 'setInputOutputRoute', // 设置通道输入源
      params: ['input', 'output']
    }
  },
  curtain: {
    setChannelPower: {
      method: 'setChannelPower', // 设置通道开关状态
      params: ['channel', 'power']
    }
  },
  airCondition: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setWindLevel: {
      method: 'setWindLevel', // 设置风量
      params: ['windLevel']
    },
    setTemperature: {
      method: 'setTemperature', // 设置温度
      params: ['temperature']
    },
    setMode: {
      method: 'setMode', // 设置模式
      params: ['mode']
    }
  },
  light: {
    setPower: {
      method: 'setPower', // 设置开关状态
      params: ['power']
    },
    setChannelPower: {
      method: 'setChannelPower', // 设置通道开关状态
      params: ['channel', 'power']
    },
    setBrightness: {
      method: 'setBrightness', // 设置亮度
      params: ['brightness']
    }
  },
  gateLock: {
    setLock: {
      method: 'setLock', // 设置开锁/关锁
      params: ['isLocked']
    }
  },
  bodyInduction: {
    setPower: {
      method: 'setPower', // 设置电源状态
      params: ['power']
    },
    setOccupy: {
      method: 'setOccupy', // 设置是否有人
      params: ['isOccupied']
    },
    setTimeout: {
      method: 'setTimeout', // 设置感应超时时长
      params: ['timeout']
    }
  },
  paperlessElevator: {
    setScreenPosition: { // 屏幕位置
      method: 'setScreenPosition',
      params: ['action']
    },
    setMicPosition: { // 话筒位置
      method: 'setMicPosition',
      params: ['action']
    },
    setScreenMicPosition: { // 话筒屏幕位置
      method: 'setScreenMicPosition',
      params: ['action']
    }
  }
};

// 批量控制
export const batchControl = {
  scene: { // 情景
    method: 'setProfile'
  }
};

// 设备控制超时
export const devCtrTimerConfig = {
  none: 0,
  short: 5000,
  shorter: 3000,
  shortest: 1000,
  long: 10000,
  longer: 15000,
  longest: 30000
};

export const commonConfig = {
  // 设备类别
  deviceTypeCode: {
    audioProcessor: '01', // 音频处理器
    projector: '02', // 投影仪
    display: '03', // 显示器
    videoMatrix: '04', // 视频矩阵
    power: '05', // 时序电源
    microphone: '06', // 麦克风
    camera: '07', // 摄像头
    airCondition: '09', // 空调
    videoConfHost: '10', // 视频会议主机
    otherSubCtr: '11', // cp3 等其他分控
    light: '12', // 灯关
    powerAmplifier: '14', // 功率放大器
    bodyInduction: '15', // 人体感应
    gateLock: '16', // 门锁
    keyPanel: '18', // 按键面板
    paperlessElevator: '23', // 无纸化升降机
    curtain: '24', // 窗帘
    controlPad: '25', // 控制平板
    appointmentScreen: '26', // 预约屏
    wirelessAP: '27', // 无线AP
    switch: '28', // 交换机
    centralControl: '99' // 易科分控
  },
  // 设备品牌
  deviceBrand: {
    biamp: 'Biamp',
    symetrix: 'Symetrix',
    cisco: 'Cisco',
    zoom: 'Zoom'
  },
  // 限制表单输入框可输入最大长度
  formMaxLength: {
    inputMax: 50, // 单行文本框
    textareaMax: 500 // 多行文本框
  },
  userRole: {
    admin: 'admin',
    devOps: 'devOps'
  },
  // 文件上传类型
  fileUploadType: [
    {
      'label': '仅导入新数据',
      'value': '1'
    },
    {
      'label': '仅更新已有数据',
      'value': '2'
    },
    {
      'label': '导入新数据并更新已有数据',
      'value': '3'
    }
  ],
  // 自定义字段范围
  customFieldScope: [
    {
      'label': '区域',
      'value': 'location'
    },
    {
      'label': '房间',
      'value': 'room'
    },
    {
      'label': '设备',
      'value': 'device'
    }
  ],
  // 自定义字段数据类型
  customFieldType: [
    {
      'label': '字符串',
      'value': 'string'
    },
    {
      'label': '整型',
      'value': 'int'
    },
    {
      'label': '布尔',
      'value': 'bool'
    }
  ]
};

// 租户配置
export const tenantConfig = {
  EZPRO: 'EZPRO',
  OPPO: 'OPPO'
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
  // 监控 => 房间
  monitorRoom: 'monitorRoom', // 房间列表
  monitorRoomDevice: 'monitorRoomDevice', // 房间设备列表
  monitorRoomAlarmRule: 'monitorRoomAlarmRule', // 房间告警规则
  monitorGlobalAlarmRule: 'monitorGlobalAlarmRule', // 全局告警规则
  monitorRoomSelfCheckRule: 'monitorRoomSelfCheckRule', // 房间自检规则
  monitorRoomJointCheckRule: 'monitorRoomJointCheckRule', // 房间联检规则
  // 监控 => 运维报告
  monitorRoomReport: 'monitorRoomReport', // 房间报告
  monitorRoomReportAlarmStatistic: 'monitorRoomReportAlarmStatistic', // 房间报告告警统计
  monitorRoomReportSelfCheckStatistic: 'monitorRoomReportSelfCheckStatistic', // 房间报告自检统计
  monitorRoomReportAlarmReport: 'monitorRoomReportAlarmReport', // 房间报告告警记录
  monitorSelfCheckReport: 'monitorSelfCheckReport', // 自检报告
  monitorJointCheckReport: 'monitorJointCheckReport', // 联检报告
  // 监控 => 系统日志
  monitorDeviceLog: 'monitorDeviceLog', // 设备日志
  monitorOperationLog: 'monitorOperationLog', // 操作日志
  monitorRoomLog: 'monitorRoomLog', // 房间日志
  monitorSelfCheckLog: 'monitorSelfCheckLog', // 自检日志

  // 告警
  alarmDevice: 'alarmDevice', // 告警设备
  alarmRecord: 'alarmRecord', // 告警记录

  // 管理
  managerArea: 'managerArea', // 管理区域
  managerDevice: 'managerDevice', // 管理设备
  managerSubControl: 'managerSubControl', // 管理分控

  // 人员
  user: 'user', // 用户
  role: 'role', // 角色

  // 系统 => 告警规则
  globalAlarmRule: 'globalAlarmRule', // 全局告警规则
  roomAlarmRule: 'roomAlarmRule', // 房间告警规则
  // 系统 => 检测规则
  globalSelfCheckRule: 'globalSelfCheckRule', // 全局自检规则
  roomSelfCheckRule: 'roomSelfCheckRule', // 房间自检规则
  roomSelfCheckRuleTemplate: 'roomSelfCheckRuleTemplate', // 房间自检规则模板
  roomJointCheckRule: 'roomJointCheckRule', // 房间联检规则
  roomJointCheckRuleTemplate: 'roomJointCheckRuleTemplate', // 房间联检规则模板
  // 系统 => 基础设置
  systemExtFieldConfig: 'systemExtFieldConfig', // 扩展字段配置
  systemRoomTypeConfig: 'systemRoomTypeConfig', // 会议室类型配置

  selfCheckTemplateApply: 'selfCheckTemplateApply', // 自检模板应用至房间
  selectRoom: 'selectRoom' // 选择房间

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

// 日志操作类型
export const logOperationType = {
  SELECT: {
    label: '查询',
    type: 'SELECT'
  },
  UPDATE: {
    label: '修改',
    type: 'UPDATE'
  },
  ADD: {
    label: '新增',
    type: 'ADD'
  },
  DELETE: {
    label: '删除',
    type: 'DELETE'
  },
  RPC: {
    label: '控制',
    type: 'RPC'
  },
  ALARM: {
    label: '告警',
    type: 'ALARM'
  },
  STATUS: {
    label: '状态',
    type: 'STATUS'
  }
};
// todo 日志模块名称 目前先由前端处理，后续需要后端处理
export const logModuleName = {
  USER: {
    label: '用户',
    type: 'USER'
  },
  ROLE: {
    label: '角色',
    type: 'ROLE'
  },
  DEVICE: {
    label: '设备',
    type: 'DEVICE'
  },
  ROOM: {
    label: '房间',
    type: 'ROOM'
  },
  ASSET: {
    label: '资产',
    type: 'ASSET'
  },
  LABEL: {
    label: '标签',
    type: 'LABEL'
  },
  LOCATION: {
    label: '区域',
    type: 'LOCATION'
  },
  ALARM: {
    label: '告警',
    type: 'ALARM'
  },
  JOINTINSPECTION: {
    label: '联检',
    type: 'JOINTINSPECTION'
  },
  RULE: {
    label: '自检',
    type: 'RULE'
  }
};

// 刷新token机制参数
export const freshenToken = {
  pollTime: Math.floor(1800 * 0.15 / 10 * 1000), // 多少秒轮询一次
  pollCount: 10, // 轮询次数
  totalTime: 1800, // 1800, //有效时间30分钟 秒为单位
  timingTime: Math.floor(1800 * 0.85 * 1000) // 延时触发事件
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

export const scoreColorConfig = {
  terrible: {
    bg: 'terrible-circle'
    // font: 'font-color-success'
  },
  poor: {
    bg: 'poor-circle'
    // font: 'font-color-warning'
  },
  general: {
    bg: 'general-circle'
    // font: 'font-color-danger'
  },
  good: {
    bg: 'good-circle'
    // font: 'font-color-info'
  },
  fine: {
    bg: 'fine-circle'
    // font: 'font-gray-70'
  }
};
