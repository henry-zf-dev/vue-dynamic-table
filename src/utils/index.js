import {clearStorage, getStorage, setStorage, StorageKey} from '../config/sessions';
import {commonConfig} from '../config/common';
import {msgCode, msgContent} from '../config/string';
import API from '../api/index';
import store from '../store/index';
import router from '../router/routes';
import {routerMeta} from '../router/routerMeta';
import {Notification} from 'element-ui';
import moment from 'moment';

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
    username: getStorage(StorageKey.username) || 'admin',
    userRole: getStorage(StorageKey.userRole, true) || {},
    userEmail: getStorage(StorageKey.userEmail) || '',
    isAdmin: getStorage(StorageKey.userRole).includes(commonConfig.userRole.admin)
  };
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

// 调用接口前参数trim，除去参数前后空格
export function paramsTrim(params) {
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value && typeof (value) === 'string') {
      params[key] = value.trim();
    }
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

// 根据 filterResult、searchResult 解析出 selector
export function getTableFilterResult(table = {}) {
  const {filterResult = {}, searchResult = []} = table;
  const result = [];
  _.union(Object.values(filterResult), searchResult).forEach(config => {
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
          value: _.pluck(value || [], 'value')
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
  if (!tableId || _.isEmpty(table)) return;
  store.commit('updateTableState', {
    id: tableId,
    ...table,
    ...data
  });
}

// 删除成功时判断当前记录的pageNo是否大于total/pageSize
export function updatePageNo(tableId = '') {
  const table = getTableState(tableId);
  if (!tableId || _.isEmpty(table)) return;
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
