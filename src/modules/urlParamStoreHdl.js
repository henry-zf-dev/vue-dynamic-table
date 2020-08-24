import store from '../store';

// 将 URL 解析为两部分：URI 和 query（均为字符串）
// query 用来初始化 URLSearchParams 对象
export function getUrlPart() {
  const url = window.location.href;
  const urlPart = {
    uri: url,
    query: ''
  };
  const splitArr = url.split('?');
  if (splitArr.length > 1) {
    urlPart.uri = splitArr[0];
    urlPart.query = splitArr[1];
  }
  return urlPart;
}

// 通过 URLSearchParams 对象获取 URL 中 query 中的键值对
export function getUrlParam(key = '') {
  const urlPart = getUrlPart();
  const params = {};
  if (urlPart.query) {
    const search = new URLSearchParams(urlPart.query);
    for (const k of search.keys()) {
      params[k] = search.get(k);
    }
  }
  return key ? (params[key] || '') : params;
}

// 通过 URLSearchParams 更新获取 URL 中 query 中的键值对
export function setUrlParam(key = '', value = '') {
  const urlPart = getUrlPart();
  const params = getUrlParam();
  value ? params[key] = value : delete params[key];
  const search = new URLSearchParams('');
  for (const key of Object.keys(params)) {
    search.set(key, params[key]);
  }
  const searchStr = search.toString();
  const destUrl = searchStr ? `${urlPart.uri}?${searchStr}` : urlPart.uri;
  window.history.replaceState({}, '', destUrl);
}

// 通过 URLSearchParams 删除获取 URL 中 query 中的键值对
export function deleteUrlParam(key = '') {
  const urlPart = getUrlPart();
  const params = getUrlParam();
  delete params[key];
  const paramKeys = Object.keys(params);
  let destUrl = urlPart.uri;
  if (paramKeys.length > 0) {
    const search = new URLSearchParams('');
    for (const key of Object.keys(params)) {
      search.set(key, params[key]);
    }
    const searchStr = search.toString();
    destUrl = searchStr ? `${urlPart.uri}?${searchStr}` : urlPart.uri;
  }
  window.history.replaceState({}, '', destUrl);
}

// 清空 URL 中 query 中的键值对
export function clearUrlParam() {
  const urlPart = getUrlPart();
  window.history.replaceState({}, '', urlPart.uri);
}

// 根据 routeName 更新 store 中的 routeParamState
export function updateRouteParamState(routeName = '', data = {}) {
  if (!routeName) return;
  const routeParamState = store.state.routeParamState;
  if (!routeParamState || !routeParamState[routeName]) return;
  const state = routeParamState[routeName];
  store.commit('updateRouteParamState', {
    route: routeName,
    ...state,
    ...data
  });
}
