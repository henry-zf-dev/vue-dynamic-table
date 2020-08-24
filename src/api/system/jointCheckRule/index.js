import Ax from '../../api';
import { apiType } from '../../../config/common';

export default {
  // 查询所有房间的联检规则列表
  roomAllJointCheckRuleList: (param) => Ax('post', `${apiType.manager}/joint-inspection/room/list`, param),
  // 根据房间 id 查询房间联检规则列表 roomJointCheckRuleListByRoomId
  roomJointCheckRuleListByRoomId: (param) => Ax('post', `${apiType.manager}/joint-inspection/list/${param.roomId}`, param),
  // 新增房间联检规则
  jointCheckRuleAdd: (param) => Ax('post', `${apiType.manager}/joint-inspection/${param.roomId}`, param),
  // 编辑房间联检规则
  jointCheckRuleEdit: (param) => Ax('put', `${apiType.manager}/joint-inspection/${param.roomId}?ruleId=${param.id}`, param),
  // 获取房间联检规则详情
  jointCheckRuleDetail: (query) => Ax('get', `${apiType.manager}/joint-inspection/${query.roomId}?ruleId=${query.id}`),
  // 删除房间联检规则
  jointCheckRuleDelete: (param) => Ax('delete', `${apiType.manager}/joint-inspection/${param.roomId}?ruleId=${param.id}`),
  // 删除房间所有联检规则
  jointCheckRuleAllDelete: (param) => Ax('delete', `${apiType.manager}/joint-inspection/room/${param.roomId}`),
  // 房间联检规则启用/禁用
  jointCheckRuleEnable: (param) => Ax('put', `${apiType.manager}/joint-inspection/enable/${param.roomId}?ruleId=${param.id}&isEnable=${param.isEnable}`),
  // 房间所有联检规则启用/禁用
  jointCheckRuleAllEnable: (param) => Ax('put', `${apiType.manager}/joint-inspection/room/enable/${param.roomId}?isEnable=${param.isEnable}`),
  // 执行房间联检
  jointCheckRuleExecute: (param) => Ax('put', `${apiType.manager}/joint-inspection/exec/${param.id}`),
  // 查询房间联检执行时长
  jointCheckRuleTimeout: () => Ax('get', `${apiType.manager}/joint-inspection/timeout`),
  // 房间联检复制
  jointCheckRuleCopy: (param) => Ax('post', `${apiType.manager}/joint-inspection/copy`, param)

};
