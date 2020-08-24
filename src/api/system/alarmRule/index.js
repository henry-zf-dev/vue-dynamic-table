import Ax from '../../api';
import {apiType} from '../../../config/common';

export default {
  // 查询全局告警规则列表
  globalAlarmRuleList: (param) => Ax('post', `${apiType.manager}/alarm-config/list`, param),
  // 查询全局告警规则详情
  globalAlarmRuleDetail: (query) => Ax('get', `${apiType.manager}/alarm-config/${query.id}`),
  // 新增全局告警规则
  globalAlarmRuleAdd: (param) => Ax('post', `${apiType.manager}/alarm-config`, param),
  // 编辑全局告警规则
  globalAlarmRuleEdit: (param) => Ax('put', `${apiType.manager}/alarm-config/${param.id}`, param),
  // 全局告警规则手动恢复
  globalAlarmRuleRecovery: (param) => Ax('put', `${apiType.manager}/alarm-config/rec/${param.id}`, param),

  // 查询所有房间的告警规则列表
  roomAllAlarmRuleList: (param) => Ax('post', `${apiType.manager}/room-info/alarm-config/list`, param),
  // 根据房间 id 查询房间告警规则列表
  roomAlarmRuleListByRoomId: (param) => Ax('post', `${apiType.manager}/alarm-config/list/${param.roomId}`, param),
  // 根据告警规则 id 查询房间告警规则详情
  roomAlarmRuleDetail: (query) => Ax('get', `${apiType.manager}/alarm-config/${query.roomId}/${query.id}`),
  // 新增房间告警规则
  roomAlarmRuleAdd: (param) => Ax('post', `${apiType.manager}/alarm-config/${param.roomId}`, param),
  // 编辑房间告警规则
  roomAlarmRuleEdit: (param) => Ax('put', `${apiType.manager}/alarm-config/${param.roomId}/${param.id}`, param),
  // 房间告警规则启用/禁用
  roomAlarmRuleEnable: (param) => Ax('put', `${apiType.manager}/alarm-config/enable/room/${param.roomId}?enable=${param.isEnable}`),
  // 根据房间 id 删除房间的全部告警规则
  roomAlarmRuleDeleteByRoomId: (param) => Ax('delete', `${apiType.manager}/alarm-config/room/${param.roomId}`),
  // 根据房间 id + 告警规则 id 删除房间告警规则
  roomAlarmRuleDeleteById: (param) => Ax('delete', `${apiType.manager}/alarm-config/${param.id}`),
  // 房间告警规则复制
  roomAlarmRuleCopy: (param) => Ax('post', `${apiType.manager}/alarm-config/copy`, param),

  // 全局/房间告警规则启用/禁用
  alarmRuleEnable: (param) => Ax('put', `${apiType.manager}/alarm-config/enable/${param.id}?enable=${param.isEnable}`),
  // 查询告警规则沉默周期
  alarmRuleSilenceCycle: () => Ax('get', `${apiType.manager}/alarm-config/silenceCycle`)

};
