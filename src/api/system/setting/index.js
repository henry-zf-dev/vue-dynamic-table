import Ax from '../../api';
import { apiType } from '../../../config/common';

export default {
  // 查询版本号信息
  getVersion: () => Ax('get', `${apiType.manager}/version`),
  // 查询 SSO 授权的地址
  getSSOUrl: () => Ax('get', `${apiType.core}/env`),
  // 同步设备库信息至集控
  deviceSync: () => Ax('get', `${apiType.manager}/device/sync`),

  // 查询自定义字段列表
  customFieldList: (param) => Ax('post', `${apiType.core}/expand-attr/list`, param),
  // 查询所有自定义字段
  customFieldAll: () => Ax('get', `${apiType.core}/expand-attr/all`),
  // 新增自定义字段
  customFieldAdd: (param) => Ax('post', `${apiType.core}/expand-attr`, param),
  // 编辑自定义字段
  customFieldEdit: (param) => Ax('put', `${apiType.core}/expand-attr/${param.id}`, param),
  // 删除自定义字段
  customFieldDelete: (param) => Ax('delete', `${apiType.core}/expand-attr/${param.id}`),

  // 查询房间类型列表
  roomTypeList: (param) => Ax('post', `${apiType.core}/room-type/list`, param),
  // 新增房间类型
  roomTypeAdd: (param) => Ax('post', `${apiType.core}/room-type`, param),
  // 编辑房间类型
  roomTypeEdit: (param) => Ax('put', `${apiType.core}/room-type/${param.id}`, param),
  // 删除房间类型
  roomTypeDelete: (param) => Ax('delete', `${apiType.core}/room-type/${param.id}`),

  // 查询表格配置详情
  getTableConfigById: (query) => Ax('get', `${apiType.core}/metatable?id=${query.id}`),
  // 编辑表格配置
  tableConfigEdit: (param) => Ax('put', `${apiType.core}/metatable/${param.oldId}/${param.newId}?name=${param.name}`, param.data),
  // 删除表格配置
  tableConfigDelete: (param) => Ax('delete', `${apiType.core}/metatable/${param.id}`)

};
