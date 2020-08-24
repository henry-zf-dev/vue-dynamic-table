import {clearStorage, getStorage, setStorage, StorageKey} from '../config/sessions';
import {commonConfig, devCtrTimerConfig} from '../config/common';
import {commonString, msgCode, msgContent} from '../config/string';
import {baseUrl} from '../config/env';
import axios from 'axios';
import API from '../api/index';
import store from '../store/index';
import router from '../router/routes';
import {routerMeta} from '../router/routerMeta';
import {MessageBox, Notification} from 'element-ui';
import {RealTimeMsgHandle} from '../modules/realTimeMsgHdl';
import {DevCtrTimerHdl} from '../modules/deviceCtrTimerHdl';
import moment from 'moment';

const md5 = require('../lib/md5');

const eleMsgType = {
  success: 'success',
  warning: 'warning',
  error: 'error'
};

// 操作后提示 || 错误处理
export function messageHandle({code, msg}) {
  let type = eleMsgType.error;
  let dftMsg;

  switch (code) {
    case msgCode.UPLOAD_SAVE:
      type = eleMsgType.success;
      break;
    case msgCode.HAS_SAVE:
      type = eleMsgType.success;
      dftMsg = msgContent.HAS_SAVE;
      break;
    case msgCode.WARNING:
      type = eleMsgType.warning;
      dftMsg = msgContent.WARNING;
      break;
    case msgCode.TOKEN_FAILURE:
      type = eleMsgType.warning;
      dftMsg = msgContent.TOKEN_QUERY;
      break;
    case msgCode.ADD_SAVE:
      type = eleMsgType.success;
      dftMsg = msgContent.ADD_SAVE;
      break;
    case msgCode.EDIT_SAVE:
      type = eleMsgType.success;
      dftMsg = msgContent.EDIT_SAVE;
      break;
    case msgCode.DEL_SAVE:
      type = eleMsgType.success;
      dftMsg = msgContent.DEL_SAVE;
      break;
    case msgCode.RESET_SAVE:
      type = eleMsgType.success;
      dftMsg = msgContent.RESET_SAVE;
      break;
    // error
    case msgCode.QUERY:
      dftMsg = msgContent.QUERY;
      break;
    case msgCode.LOGIN:
      dftMsg = msgContent.LOGIN;
      break;
    case msgCode.MUTATION:
      dftMsg = msgContent.MUTATION;
      break;
    case msgCode.UPLOAD:
      dftMsg = msgContent.UPLOAD;
      break;
    case msgCode.SYSTEM:
      dftMsg = msgContent.SYSTEM;
      break;
    default:
      break;
  }
  if (code === msgCode.TOKEN_FAILURE && store.state.tokenCount) {
    store.state.tokenCount = false;
    setStorage(StorageKey.tokenExpire, true);
    clearStorage();
    RealTimeMsgHandle.bulkUnSubscription(); // 批量取消订阅
    RealTimeMsgHandle.closeWebsocket(); // 断开 websocket 连接
    store.commit('clearStore'); // 清空 store
    router.push({name: routerMeta.login.name, query: {redirect: location.hostname}});
  } else if (code !== msgCode.TOKEN_FAILURE) {
    Notification({
      type: type,
      showClose: true,
      message: msg || dftMsg
    });
  }
}

// 当前user信息
export function getUserInfo() {
  return {
    token: getStorage(StorageKey.token) || '',
    userId: getStorage(StorageKey.userId) || '',
    username: getStorage(StorageKey.username) || '',
    userRole: getStorage(StorageKey.userRole, true) || {},
    userEmail: getStorage(StorageKey.userEmail) || '',
    isAdmin: getStorage(StorageKey.userRole).includes(commonConfig.userRole.admin)
  };
}

// 设备监控能力集判断
export function judgeDeviceAbility(abilities = [], config = []) {
  let hasAbility = false;
  if (!abilities.length || !config.length) return false;
  const tempConfig = deepCopyWithJson(config);
  for (let i = 0; i < tempConfig.length; i++) {
    const conf = tempConfig[i];
    const {method = '', params = []} = conf;
    const ability = abilities.find(a => {
      return a.method === method;
    });
    if (ability) {
      const hash = params.length ? md5.hex_md5(params.sort().join('')) : md5.hex_md5('{}');
      if (ability.param_hash === hash) {
        hasAbility = true;
        break;
      }
    }
  }
  return hasAbility;
}

export function assembleDeviceAbility(abilities = [], funcConfig = {}) {
  const ability = {};
  const configs = Object.values(funcConfig);
  const mock = false;
  if (mock) {
    const genComm = getStorage(StorageKey.genComm, true) || [];
    genComm.forEach(gc => {
      const {generalCommands = []} = gc;
      generalCommands.forEach(c => {
        ability[c.method] = true;
      });
    });
  } else {
    if (!abilities.length) return {};
    __.pluck(abilities, 'method').forEach(m => {
      ability[m] = judgeDeviceAbility(abilities, configs);
    });
  }
  return ability;
}

export function clearGraphqlStore() {
  // 清除缓存  todo: 更优的解决办法
  // return await apolloClient.clearStore();
  apolloClient.cache.reset();
}

export function isJsonString(str) {
  try {
    if (typeof JSON.parse(str) === 'object') {
      return true;
    }
  } catch (e) {
  }
  return false;
}

export function checkRespCorrect(resp) {
  return (resp && resp.code === 0);
}

// 获取元素具体窗口顶部的距离
export function getElementTopOffset(el) {
  if (!el) return 0;
  const e = el.$el || el;
  return e.getBoundingClientRect().top + document.body.scrollTop;
}

// 根据 tableId 计算 table 的最小高度
export function getTableMinHeight(tableId, padBtm = 40, minHeight = 600) {
  const element = $(`#${tableId}`);
  if (!element || !element[0]) return;
  const toTop = getElementTopOffset(element[0]);
  const clientHeight = store.state.clientHeight;
  const tableHeight = clientHeight - toTop - padBtm;
  return Math.max(tableHeight, minHeight);
}

// 计算树形结构深度
export function calculateTreeDepth(data = []) {
  let arr = data;
  let depth = 0;
  while (arr.length > 0) {
    const temp = [];
    for (let i = 0; i < arr.length; i++) {
      temp.push(arr[i]);
    }
    arr = [];
    for (let i = 0; i < temp.length; i++) {
      for (let j = 0; j < temp[i].children.length; j++) {
        arr.push(temp[i].children[j]);
      }
    }
    if (arr.length >= 0) {
      depth++;
    }
  }
  return depth;
}

// 扁平结构转树形结构
export function assembleTreeFromArray({srcData = [], parentKey = 'pid', childKey = 'id', labelKey = 'name', filter = false}) {
  const map = {};
  let node;
  const tree = [];
  let i;
  for (i = 0; i < srcData.length; i++) {
    map[srcData[i][childKey]] = srcData[i];
    srcData[i].children = [];
  }
  for (i = 0; i < srcData.length; i += 1) {
    node = srcData[i];
    node.label = node[labelKey];
    node.value = node[childKey];

    if (node[parentKey] && map[node[parentKey]] && map[node[parentKey]].children) {
      map[node[parentKey]].children.push(node);
    } else {
      tree.push(node);
    }
  }
  filter && (filterEmptyChildren(tree));
  return tree;
}

// 递归去除子级为空的 children 字段
function filterEmptyChildren(srcData = []) {
  srcData.forEach(s => {
    if (s.children && s.children.length > 0) {
      filterEmptyChildren(s.children);
    } else {
      delete s['children'];
    }
  });
}

// 递归组装区域树形结构数据源
export function assembleTreeData(source, key = 'children') {
  const dest = [];
  for (let i = 0; i < source.length; i++) {
    const area = {
      value: source[i].id,
      label: source[i].name,
      count: source[i].roomCount,
      id: source[i].id,
      name: source[i].name
    };
    if (source[i][key] && source[i][key].length > 0) {
      area['children'] = assembleTreeData(source[i][key]);
    }
    dest.push(area);
  }
  return dest;
}

// 多层级 object 扁平化
export function objectFlatten(obj = {}, mapAllKey = false, includeKeys = []) {
  const result = {};
  const recurse = (src, prop) => {
    const toString = Object.prototype.toString;
    if (toString.call(src) === '[object Object]') {
      let isEmpty = true;
      for (const p in src) {
        if (mapAllKey || includeKeys.includes(p)) {
          isEmpty = false;
          recurse(src[p], prop ? prop + '.' + p : p);
        }
      }
      if (isEmpty && prop) {
        result[prop] = {};
      }
    } else if (toString.call(src) === '[object Array]') {
      const len = src.length;
      if (len > 0) {
        src.forEach(function(item, index) {
          recurse(item, prop ? prop + '.' + index : index);
        });
      } else {
        result[prop] = [];
      }
    } else {
      result[prop] = src;
    }
  };
  recurse(obj, '');
  return result;
}

// 调用接口前参数 clean，将空字符串转换为null
export function paramsClean(params) {
  Object.keys(params).forEach(key => {
    if (params[key] === '') {
      params[key] = null;
    }
  });
}

// 调用接口前参数trim，除去参数前后空格
export function paramsTrim(params) {
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value && typeof (value) === 'string') {
      params[key] = value.trim();
    }
  });
}

// 生成随机数
export function generateUID(len = 64, radix = '') {
  const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  const uuid = [];
  let i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

// 通过 JSON.stringify 转化 判断相等
export function judgeEqualByJson(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// 下载附件(通过调用接口的方式)
export function downloadFileApi(url, data = {}, method = 'get') {
  if (!url) return;
  axios({
    url: url,
    method: method,
    data: data.data,
    params: data.params,
    responseType: 'blob', // 一定要加上 responseType 值为blob
    headers: {
      'token': getUserInfo().token
    }
  }).then(data => {
    if (!data) {
      return;
    }
    const url = window.URL.createObjectURL(data.data);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    const name = data.headers['content-disposition'].split(';')[1].split('=')[1] || '';// 获取headers里面的文件名称
    link.setAttribute('download', name);// download 属性定义了文件名称，并且是必填，不然会页面会自动识别为跳转路径，而不是文件下载地址
    document.body.appendChild(link);
    link.click();
    // 销毁添加的a标签
    setTimeout(() => {
      link.parentNode.removeChild(link);
    }, 200);
  }).catch(err => {
    messageHandle({code: msgCode.SYSTEM});
  });
}

// 利用 JSON 深度拷贝
export function deepCopyWithJson(src = {}) {
  return JSON.parse(JSON.stringify(src));
}

// 判断字符串/数字相等
export function judgeStrEqual(str1 = '', str2 = '') {
  return str1 + '' === str2 + '';
}

export function forceToString(src = '') {
  return src + '';
}

// 根据权限 key 判断用户权限
export function judgePermission(key = '') {
  const permissions = getStorage(StorageKey.userPermissions, true) || [];
  return ~__.pluck(permissions, 'tag').indexOf(key);
}

// 对象数组根据 key 排序
export function objArrayComparison(key, revert = false) {
  return (obj1 = {}, obj2 = {}) => {
    const val1 = parseFloat(obj1[key]);
    const val2 = parseFloat(obj2[key]);
    if (val1 > val2) {
      return revert ? -1 : 1;
    } else if (val1 < val2) {
      return revert ? 1 : -1;
    } else {
      return 0;
    }
  };
}

// 精确到小数点后 n 位
export function numberFix(num = 0, fix = 2) {
  try {
    return parseFloat(parseFloat(num).toFixed(fix));
  } catch (e) {
    return 0;
  }
}

// 根据 filterResult、searchResult 解析出 selector
export function getTableFilterResult(table = {}) {
  const {filterResult = {}, searchResult = []} = table;
  const result = [];
  __.union(Object.values(filterResult), searchResult).forEach(config => {
    const {fieldType, key, value} = config;
    switch (fieldType) {
      case 'input':
      case 'string':
      case 'bool':
        value.length > 0 && result.push({
          key, fieldType, value
        });
        break;
      case 'cascade':
        value.length > 0 && result.push({
          key, fieldType,
          value: __.pluck(value || [], 'value')
        });
        break;
      case 'number':
      case 'datetime':
        const {begin, end} = value || {};
        if (begin || end) {
          const filter = {
            key, fieldType
          };
          begin && (filter.begin = begin);
          end && (filter.end = end);
          result.push(filter);
        }
        break;
      default:
        break;
    }
  });
  return result;
}

// 根据 tableId 获取 store 中的 tableState
export function getTableState(tableId = '') {
  if (!tableId) return {};
  const tableState = store.state.tableState;
  if (!tableState || !tableState[tableId]) return {};
  const table = tableState[tableId];
  // const {page, size} = getUrlParam();
  return {
    ...table,
    // pageNo: page ? parseInt(page) : table.pageNo,
    // pageSize: size ? parseInt(size) : table.pageSize,
    // store 中只保存 tableFilter 组件需要的结构，
    // 最终的 selector 在以下方法中组装 Henry 2020-03-26 10:09:24
    filters: getTableFilterResult(tableState[tableId])
  };
}

// 根据 tableId 更新 store 中的 tableState
export function updateTableState(tableId = '', data = {}) {
  const table = getTableState(tableId);
  if (!tableId || __.isEmpty(table)) return;
  store.commit('updateTableState', {
    id: tableId,
    ...table,
    ...data
  });
}

// 删除成功时判断当前记录的pageNo是否大于total/pageSize
export function updatePageNo(tableId = '') {
  const table = getTableState(tableId);
  if (!tableId || __.isEmpty(table)) return;
  const {pageNo = 1, pageSize = 10, total = 0} = table;
  const totals = total - 1; // 当前数据总行数-1
  const general = Math.ceil(totals / pageSize);
  if (pageNo > general) {
    updateTableState(tableId, {pageNo: general || 0});
  }
}

// 组装 table opt btn 数据，添加 callback、fixed
export function assembleTableOptBtn(src = [], callback) {
  const optBtn = src.find(s => {
    return s.opt === true;
  });
  if (!optBtn) return;
  if (optBtn.children && optBtn.children[0]) {
    optBtn.children[0]['callback'] = callback;
  }
}

// 过滤出不需要返回的 columns
function ignoreColumns(src = [], ignore = []) {
  const dest = [];
  src.forEach(c => {
    if (!ignore.includes(c.label)) {
      dest.push({
        hide: false,
        checkable: false,
        ...c
      });
    }
  });
  return dest;
}

// 过滤不需要返回的 filters
function ignoreFilters(src = [], ignore = []) {
  const dest = [];
  src.forEach(c => {
    if (!ignore.includes(c.key)) {
      dest.push(c);
    }
  });
  return dest;
}

// 通过 tableId 获取本地缓存中的 table 配置
export function getTableCfgFromStorage(tableId = '', ignoreC = [], ignoreF = []) {
  if (!tableId) {
    return {
      columns: [],
      filters: []
    };
  }
  const tableConfig = getStorage(StorageKey.tableConfig, true) || {};
  const {filters = [], columns = []} = tableConfig[tableId] || {};
  return {
    columns: ignoreColumns(columns, ignoreC),
    filters: ignoreFilters(filters, ignoreF)
  };
}

// 通过 tableId 接口获取该 table 的 column、filter 配置
export function getTableConfig(tableId = '', ignoreC = [], ignoreF = []) {
  return new Promise(function(resolve, reject) {
    if (!tableId) reject();
    API.setting.getTableConfigById({id: tableId}).then(resp => {
      if (checkRespCorrect(resp)) {
        const {filters = [], columns = []} = resp.data || {};
        // 请求到新的 table 配置信息后，更新本地缓存
        const tableConfig = getStorage(StorageKey.tableConfig, true) || {};
        tableConfig[tableId] = resp.data || {};
        setStorage(StorageKey.tableConfig, tableConfig);
        resolve({
          columns: ignoreColumns(columns, ignoreC),
          filters: ignoreFilters(filters, ignoreF)
        });
      } else {
        messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
        reject();
      }
    }).catch(err => {
      messageHandle({code: msgCode.SYSTEM});
      reject(err);
    });
  });
}

// 根据在线状态和设备状态显示设备状态文案
export function getDeviceStatus(item) {
  const alarmValues = Object.values(commonString.monitorStatus);
  const alarmStatus = alarmValues.find(c => {
    return c.value === item.alarmStatus;
  }) || {};
  if (item.isOnline === commonString.connectionStatus.offline.value &&
    item.alarmStatus === commonString.monitorStatus.normal.value) {
    // todo 设备离线且后台返回状态为正常的情况下显示空
    return '';// commonString.unknownStatus;
  } else {
    return alarmStatus;
  }
}

// 根据会议室可用状态、监控状态组装数据
export function getGeneralStatus(data = {}, type = 'room') {
  // 可用状态 > 监控状态（只有在会议室上线或故障时，才能看到会议室）
  const key = type === 'room' ? 'roomStatus' : 'deviceStatus';
  if (data[key] === commonString.availableStatus.breakdown.value) {
    return {
      label: commonString.availableStatus.breakdown.label,
      type: commonString.availableStatus.breakdown.type,
      image: commonString.generalStatusImg.breakdown
    };
  } else {
    switch (data.alarmStatus) {
      case commonString.monitorStatus.alarm.value:
        return {
          label: commonString.monitorStatus.alarm.label,
          type: commonString.monitorStatus.alarm.type,
          image: commonString.generalStatusImg.alarm,
          icon: commonString.monitorStatus.alarm.icon
        };
      case commonString.monitorStatus.noDevice.value:
        return {
          label: commonString.monitorStatus.noDevice.label,
          type: commonString.monitorStatus.noDevice.type,
          image: commonString.generalStatusImg.normal
        };
      case commonString.monitorStatus.normal.value:
      default:
        return {
          label: commonString.monitorStatus.normal.label,
          type: commonString.monitorStatus.normal.type,
          image: commonString.generalStatusImg.normal,
          icon: commonString.monitorStatus.normal.icon
        };
    }
  }
}

export function getSelfCheckStatus(score) {
  if (score < 30) {
    return {
      label: commonString.selfCheckStatus.terrible.label,
      colorKey: 'terrible',
      classKey: 'terrible-circle'
    };
  }
  if (score >= 30 && score <= 60) {
    return {
      label: commonString.selfCheckStatus.poor.label,
      colorKey: 'poor',
      classKey: 'poor-circle'
    };
  }
  if (score >= 60 && score < 80) {
    return {
      label: commonString.selfCheckStatus.general.label,
      colorKey: 'general',
      classKey: 'general-circle'
    };
  }
  if (score >= 80 && score < 95) {
    return {
      label: commonString.selfCheckStatus.good.label,
      colorKey: 'good',
      classKey: 'good-circle'
    };
  }
  if (score >= 95) {
    return {
      label: commonString.selfCheckStatus.fine.label,
      colorKey: 'fine',
      classKey: 'fine-circle'
    };
  }
}

// 数组去重
export function arrUnique(arr) {
  if (!Array.isArray(arr)) return;
  const array = [];
  for (let i = 0; i < arr.length; i++) {
    if (array.indexOf(arr[i]) === -1) {
      array.push(arr[i]);
    }
  }
  return array;
}

// 将设备初始状态 array 转化为 object
export function transformDeviceInitStatus(data = {}) {
  const newStatus = {...data, deviceType: data.categoryCode};
  const {id, status = []} = data;
  status.forEach(s => {
    const {k = '', v = ''} = s;
    newStatus[k] = v;
  });
  return {[id]: newStatus};
}

// 根据 deviceId 清空该设备的加载器计时器
function clearTimerWithDeviceId(deviceId = '') {
  if (!deviceId) return;
  const timerInfo = store.state.devCtrTimer[deviceId];
  if (!timerInfo) return;
  const {timer} = timerInfo;
  DevCtrTimerHdl.clearTimer(deviceId, timer);
}

// 根据控制命令、参数获取该命令的控制加载时间
export function getCommandCtrInterval(abilities = [], expect = {}) {
  const {method = '', paramKey: key = '', value = '', ignoreParam = false} = expect;
  const ability = abilities.find(a => {
    return a.method === method;
  });
  if (!ability) return devCtrTimerConfig.none;
  const redundancy = 3000; // 超时冗余
  const {control_interval: ci, param_control_interval: pci = {}} = ability;
  // TODO 对于同时有多个参数的控制命令，如视屏矩阵的路由切换，
  //  暂时处理：不查找参数对应的控制加载时间，直接取 control_interval
  if (!ignoreParam) {
    const param = pci[key];
    if (param && param[value]) {
      return param[value] + redundancy;
    } else if (ci) {
      return ci + redundancy;
    } else {
      return devCtrTimerConfig.none;
    }
  } else {
    if (ci) {
      return ci + redundancy;
    } else {
      return devCtrTimerConfig.none;
    }
  }
}

export function deviceControlHandle(ctrParams = {}, expConfig = {}, ignoreConfirm = false) {
  return new Promise(function(resolve, reject) {
    function APIDeviceControl() {
      console.log('##### ctrParams #####', ctrParams);
      const {abilities = [], expect = {}} = expConfig;
      API.room.roomDeviceControl(ctrParams).then(resp => {
        if (checkRespCorrect(resp)) {
          // 设备控制成功
          resolve(getCommandCtrInterval(abilities, expect));
        } else {
          messageHandle({code: msgCode.MUTATION, msg: resp.message || msgContent.MUTATION});
          // 控制失败，则直接清空计时器
          clearTimerWithDeviceId(ctrParams.deviceId);
          resolve(devCtrTimerConfig.none);
        }
      }).catch(err => {
        messageHandle({code: msgContent.SYSTEM});
        // 控制失败，则直接清空计时器
        clearTimerWithDeviceId(ctrParams.deviceId);
        resolve(devCtrTimerConfig.none);
      });
    }

    if (ignoreConfirm) {
      APIDeviceControl();
    } else {
      MessageBox.confirm('该操作可能会影响此房间的会议，是否确认？', '设备控制', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        APIDeviceControl();
      }).catch(() => {
        resolve(devCtrTimerConfig.none);
      });
    }
  });
}

// 时间戳转换成string time：时间戳,type:转换类型
export function momentTimeToString(time, type = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return '';
  return moment(time).format(type);
}

// 获取分控跳转需要的token组成url
export function subControlToken(url, roomId = '') {
  API.subControl.subControlToken().then(resp => {
    if (checkRespCorrect(resp)) {
      const {data = {}} = resp || {};
      let subControlUrl = `${url}?a=${data.sign}&b=${data.ts}&c=${getUserInfo().username}`;
      if (roomId) {
        subControlUrl = `${subControlUrl}&d=${roomId}`;
      }
      window.open(subControlUrl);
    } else {
      messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
    }
  }).catch(err => {
    messageHandle({code: msgContent.SYSTEM});
  });
}

// 根据房间ID查询房间基本信息，返回房间名称+区域名称
export function getRoomByIdDetail(roomId = '') {
  return new Promise(function(resolve, reject) {
    if (!roomId) return reject();
    API.area.roomDetail({id: roomId}).then(resp => {
      if (checkRespCorrect(resp)) {
        const {data = {}} = resp;
        const roomTitle = data.roomLocationName ? data.roomLocationName + '-' + (data.name || '') : data.name || '';
        resolve(roomTitle);
      } else {
        messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
        reject();
      }
    }).catch(err => {
      messageHandle({code: msgCode.SYSTEM});
      reject(err);
    });
  });
}

