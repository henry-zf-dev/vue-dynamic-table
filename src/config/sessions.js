import {commonString} from '../config/string';

export const StorageKey = {
  token: 'token',
  tokenTime: 'tokenTime',
  tokenExpire: 'tokenExpire',
  intervalCount: 'intervalCount',
  timeCount: 'timeCount',
  userId: 'userId',
  username: 'username',
  userEmail: 'userEmail',
  userRole: 'userRole',
  userPermissions: 'userPermissions',
  routes: 'routes',
  backRoute: 'backRoute',
  sysConfig: 'sysConfig',
  rememberUserName: 'rememberUserName',
  rememberPasswords: 'rememberPasswords',
  tacitlyApprove: 'tacitlyApprove',
  operationTime: 'operationTime',
  genComm: 'genComm',
  tableConfig: 'tableConfig'
};

export function setStorage(key, content) {
  const _content = (typeof content !== 'string') ? JSON.stringify(content) : content;
  localStorage.setItem(key, _content || commonString.none);
}

export function getStorage(key, needParse = false) {
  if (!localStorage.getItem(key)) return '';

  if (needParse) return JSON.parse(localStorage.getItem(key) || '');

  return localStorage.getItem(key) || '';
}

export function clearStorage(key) {
  if (key) {
    localStorage.removeItem(key);
    return;
  }
  localStorage.clear();
}
