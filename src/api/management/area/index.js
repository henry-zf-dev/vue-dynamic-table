import Ax from '../../api';

import { apiType } from '../../../config/common';

export default {

  /* ===== 区域管理 =====*/
  // 查询区域详情
  areaDetail: (query) => Ax('get', `${apiType.core}/room-location/${query.id}`),
  // 根据区域 id 查询该区域下第一子层区域
  areaByPid: (query) => Ax('get', `${apiType.core}/room-location/list/${query.pid}`),
  // 新增区域
  areaAdd: (param) => Ax('post', `${apiType.core}/room-location`, param),
  // 编辑区域
  areaEdit: (param) => Ax('put', `${apiType.core}/room-location/${param.id}`, param),
  // 刪除区域
  areaDelete: (param) => Ax('delete', `${apiType.core}/room-location/${param.id}`),
  // 设置区域管理员
  areaSetAdmin: (param) => Ax('put', `${apiType.core}/room-location/set-manager/${param.id}`, param),
  // 获取最上层 OPPO 区域
  getAreaRoot: () => Ax('get', `${apiType.core}/room-location/root`),

  /* ===== 房间管理 =====*/
  // 查询房间列表
  roomList: (param) => Ax('post', `${apiType.core}/room-info/location/list/${param.req.locationId}`, param),
  // 新增房间
  roomAdd: (param) => Ax('post', `${apiType.core}/room-info`, param),
  // 编辑房间
  roomEdit: (param) => Ax('put', `${apiType.core}/room-info/${param.id}`, param),
  // 刪除房间
  roomDelete: (param) => Ax('delete', `${apiType.core}/room-info/${param.id}`),
  // 查询房间详情
  roomDetail: (query) => Ax('get', `${apiType.core}/room-info/${query.id}`),
  // 修改房间管理状态
  roomModifyStatus: (param) => Ax('put', `${apiType.core}/room-info/room-state/${param.id}?state=${param.state}`),
  // 修改房间启用、禁用、调试
  roomUseStatus: (param) => Ax('put', `${apiType.core}/room-info/use-status/${param.id}?useStatus=${param.useStatus}`)

};
