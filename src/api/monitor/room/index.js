import Ax from '../../api';
import {apiType} from '../../../config/common';

export default {
  // 查询房间监控列表
  roomList: (param) => Ax('post', `${apiType.manager}/room-info/monitor/list/${param.req.locationId}`, param),
  // 修改房间监控状态
  roomModifyStatus: (param) => Ax('put', `${apiType.core}/room-info/state/${param.id}`, param),
  // 查询房间设备监控列表
  roomDeviceListByRoomId: (param) => Ax('post', `${apiType.manager}/device/room/${param.id}`, param),
  // 查询房间设备监控详情
  roomDeviceDetailByDeviceId: (query) => Ax('get', `${apiType.manager}/device/monitor/${query.id}`),
  // 房间开启、关闭系统
  roomSysControl: (param) => Ax('post', `${apiType.manager}/scene`, param),
  // 房间设备控制
  roomDeviceControl: (param) => Ax('post', `${apiType.manager}/rpc/two-way`, param),
  // 查询房间所有情景
  roomSceneAll: (query) => Ax('get', `${apiType.manager}/scene/${query.roomId}`),
  // 房间情景触发
  roomTriggerScene: (param) => Ax('post', `${apiType.manager}/execute`, param),
  // 房间批量控制开、关系统
  roomBatchControl: (param) => Ax('post', `${apiType.manager}/execute-batch`, param),

  // 查询房间自检记录列表
  roomSelfCheckList: (query) => Ax('post', `${apiType.manager}/room-check-report/list`, query),
  // 查询房间自检记录详情
  roomSelfCheckDetail: (query) => Ax('get', `${apiType.manager}/room-check-report/${query.id}`),
  // 查询房间联检记录列表
  roomJointCheckList: (query) => Ax('post', `${apiType.manager}/joint-inspection-report/list`, query),
  // 查询房间联检记录详情
  roomJointCheckDetail: (query) => Ax('get', `${apiType.manager}/joint-inspection-report/${query.id}`),
  // 根据房间ID查询全局告警规则
  roomGlobalAlarmRuleList: (query) => Ax('post', `${apiType.manager}/alarm-config/global-list/${query.roomId}`),
  // 根据房间ID和告警ID 应用/取消应用告警规则
  roomGlobalAlarmRuleApply: (param) => Ax('put', `${apiType.manager}/alarm-config/apply/${param.id}?roomId=${param.roomId}&apply=${param.apply}`)

};
