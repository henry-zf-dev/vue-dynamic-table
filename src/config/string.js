export const msgCode = {
  HAS_SAVE: 100,
  WARNING: 200,
  ADD_SAVE: 101,
  EDIT_SAVE: 102,
  DEL_SAVE: 103,
  RESET_SAVE: 104,
  RECOVERY_SAVE: 105,
  UPLOAD_SAVE: 0,
  TOKEN_FAILURE: 5001,
  // error
  QUERY: -300,
  MUTATION: -310,
  LOGIN: -200,
  UPLOAD: -440,
  SYSTEM: -500
};

export const msgContent = {
  HAS_SAVE: '保存成功',
  ADD_SAVE: '新增成功',
  EDIT_SAVE: '编辑成功',
  DEL_SAVE: '删除成功',
  RESET_SAVE: '密码重置成功',
  RECOVERY_SAVE: '恢复成功',

  WARNING: '请求未通过',
  TOKEN_QUERY: '由于长时间未进行任何操作，触发系统安全保护机制，需要您重新登录才可继续使用。',
  // error
  QUERY: '查询失败',
  MUTATION: '操作失败',
  LOGIN: '登录失败',
  UPLOAD: '上传失败',
  SYSTEM: '系统维护中，请稍后再试'
};

export const commonString = {
  defaultTitle: '中华传统文化',
  unknown: '未知',
  none: '无',
  // 设备基础信息
  devBaseInfo: [
    {name: '型号：', show: true, value: '未知', key: 'model'},
    {name: '固件版本：', show: true, value: '未知', key: 'firmwareVersion'},
    {name: '软件版本：', show: false, value: '未知', key: 'softwareVersion'},
    {name: '序列号：', show: true, value: '未知', key: 'serialNumber'},
    {name: 'MAC地址：', show: false, value: '未知', key: 'mac'},
    {name: 'IP地址：', show: false, value: '未知', key: 'ip'},
    {name: '子网掩码：', show: false, value: '未知', key: 'subnetMask'},
    {name: '网关地址：', show: false, value: '未知', key: 'gateway'}
  ],

  // 特殊设备基础信息
  devSpecialInfo: [
    {
      // maxhub mac地址和型号
      type: 'mac_model',
      keyList: [
        'model', 'mac'
      ]
    }
  ],

  // 房间系统开启状态
  systemStatus: {
    active: {
      label: '系统已开启',
      value: 'true',
      type: 'success'
    },
    inactive: {
      label: '系统已关闭',
      value: 'false',
      type: 'info'
    }
  },
  // 房间有人/无人状态
  peopleStatus: {
    active: {
      label: '有人',
      value: 'true',
      type: 'success'
    },
    inactive: {
      label: '无人',
      value: 'false',
      type: 'info'
    }
  },
  // 自动共享状态
  autoSharingStatus: {
    active: {
      label: '自动共享已开启',
      value: 'on',
      type: 'success'
    },
    inactive: {
      label: '自动共享未开启',
      value: 'off',
      type: 'info'
    }
  },
  // 会议室占用状态
  occupancyStatus: {
    unknown: {
      label: '未知',
      value: '1',
      type: 'info'
    },
    idle: {
      label: '空闲',
      value: '2',
      type: 'success'
    },
    occupied: {
      label: '使用中',
      value: '3',
      type: 'danger'
    }
  },
  // 设备在线状态
  connectionStatus: {
    online: {
      label: '在线',
      value: 'Y',
      type: 'success',
      icon: 'icon-zaixianzhuangtai-zaixian font-color-success'
    },
    offline: {
      label: '离线',
      value: 'N',
      type: 'unknown',
      icon: 'icon-zaixianzhuangtai-lixian font-color-danger'
    }
  },
  // 会议室、设备监控状态
  monitorStatus: {
    normal: {
      label: '正常',
      value: '0',
      type: 'success',
      icon: 'icon-gaojingzhuangtai-zhengchang font-color-success'
    },
    alarm: {
      label: '告警',
      value: '1',
      type: 'warning',
      icon: 'icon-gaojingzhuangtai-gaojing font-color-warning'
    },
    noDevice: {
      label: '无设备',
      value: '3',
      type: 'unknown'
    }
  },
  // 告警历史状态
  alarmHistoryStatus: {
    recover: {
      label: '恢复',
      value: '1',
      type: 'success'
    },
    alarm: {
      label: '告警',
      value: '2',
      type: 'warning'
    }
  },
  // 会议室、设备可用状态
  availableStatus: {
    online: {
      label: '已上线',
      value: '1',
      type: 'success'
    },
    offline: {
      label: '未上线',
      value: '2',
      type: 'warning'
    },
    reform: {
      label: '改造',
      value: 3,
      type: 'warning'
    },
    breakdown: {
      label: '故障',
      value: 4,
      type: 'danger'
    }
  },
  // 告警级别
  alarmPriority: {
    normal: {
      label: '一般',
      value: 'low',
      type: 'unknown'
    },
    urgent: {
      label: '紧急',
      value: 'high',
      type: 'warning'
    }
  },
  // 告警、自检、中控等 启用/禁用
  configEnable: {
    enable: {
      label: '启用',
      value: 'Y',
      type: 'success',
      icon: 'icon-qiyong'
    },
    forbidden: {
      label: '禁用',
      value: 'N',
      type: 'danger',
      icon: 'icon-jinyong'
    }
  },
  // 应用/取消应用
  configApply: {
    apply: {
      label: '应用',
      value: 'Y',
      type: 'success',
      icon: 'icon-qiyong'
    },
    cancel: {
      label: '取消应用',
      value: 'N',
      type: 'danger',
      icon: 'icon-jinyong'
    }
  },
  // 区域房间状态
  roomUseStatus: {
    enable: {
      label: '启用',
      value: '1',
      type: 'success'
    },
    forbidden: {
      label: '禁用',
      value: '2',
      type: 'danger'
    },
    debugging: {
      label: '调试',
      value: '3',
      type: 'warning'
    }
  },
  // 未知状态
  unknownStatus: {
    label: '未知',
    value: '',
    type: 'unknown'
  },
  // 自检报告分数
  selfCheckStatus: {
    terrible: {
      label: '极差'
    },
    poor: {
      label: '较差'
    },
    general: {
      label: '一般'
    },
    good: {
      label: '良好'
    },
    fine: {
      label: '优秀'
    }
  },

  // 图片为空
  emptyImg: {
    big: require('../assets/img/video-img.png'), // 大
    small: require('../assets/img/error-img.png') // 小
  },
  // 评分图片
  scoreImg: {
    fine: require('../assets/img/grade-fine.png'), // 优秀
    good: require('../assets/img/grade-good.png'), // 良好
    general: require('../assets/img/grade-sort.png'), // 一般
    poor: require('../assets/img/grade-poor.png'), // 差
    terrible: require('../assets/img/grade-range.png') // 极差
  },
  // 会议室总体状态图片
  generalStatusImg: {
    normal: require('../assets/img/icon-normal.png'),
    alarm: require('../assets/img/icon-alarm.png'),
    breakdown: require('../assets/img/icon-hitch.png')
  }

};

