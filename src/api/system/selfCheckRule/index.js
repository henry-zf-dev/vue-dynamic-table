import Ax from '../../api';
import {apiType} from '../../../config/common';

export default {

  // ===== 自检项相关 =====//
  // 依据设备类型查询全局自检项（级联结构）
  selfCheckItemByDeviceType: () => Ax('get', `${apiType.manager}/device/rules-list-category`),
  // 根据房间 id 查询房间自检项（级联结构）
  selfCheckItemByRoomId: (query) => Ax('get', `${apiType.manager}/room/rules-list-for-select/${query.roomId}`),
  // 根据设备 id 查询自检项
  selfCheckItemListByDeviceId: (query) => Ax('get', `${apiType.manager}/room/device-rules/${query.deviceId}`),
  // 查询当前房间的自检项
  roomSelfCheckItemList: (query) => Ax('get', `${apiType.manager}/room/rules-list-by-category/${query.roomId}`),
  // 根据设备 category 和品牌 查询自检项
  selfCheckItemListByDeviceCategory: (query) => Ax('get', `${apiType.manager}/device-rules-template/device-rules/${query.category}/${query.brand}`),

  // ===== 全局自检相关 =====//
  // 查询自检触发场景前提条件
  globalSelfCheckTriggerScene: () => Ax('get', `${apiType.manager}/device/rules-scene-list`),
  // 查询全局自检规则列表
  globalSelfCheckRuleList: (param) => Ax('post', `${apiType.manager}/device-rules/list`, param),
  // 查询全局自检规则详情
  globalSelfCheckRuleDetail: (query) => Ax('get', `${apiType.manager}/device/rules/${query.id}`),
  // 编辑全局自检项规则
  globalSelfCheckRuleEdit: (param) => Ax('put', `${apiType.manager}/device/rules/${param.id}`, param),
  // 全局自检规则启用/禁用
  globalSelfCheckRuleEnable: (param) => Ax('put', `${apiType.manager}/device/rules-enable/${param.id}?enable=${param.isEnable}`),

  // ===== 房间自检相关 =====//
  // 查询所有房间的自检规则列表
  roomAllSelfCheckRuleList: (param) => Ax('post', `${apiType.manager}/room-inspection/list`, param),
  // 根据房间 id 查询房间自检规则列表
  roomSelfCheckRuleListByRoomId: (param) => Ax('post', `${apiType.manager}/room/rules-list/${param.roomId}`, param),
  // 新增房间自检规则
  roomSelfCheckRuleAdd: (param) => Ax('post', `${apiType.manager}/room/rules/${param.roomId}`, param),
  // 编辑房间自检规则
  roomSelfCheckRuleEdit: (param) => Ax('put', `${apiType.manager}/room/rules/${param.roomId}?ruleId=${param.id}`, param),
  // 房间自检规则启用/禁用
  roomSelfCheckRuleEnable: (param) => Ax('put', `${apiType.manager}/room/rules-enable/${param.roomId}?ruleId=${param.ruleId}&enable=${param.isEnable}`),
  // 房间所有自检规则启用/禁用
  roomSelfCheckRuleAllEnable: (param) => Ax('put', `${apiType.manager}/room-inspection/room/enable/${param.roomId}?isEnable=${param.isEnable}`),
  // 根据房间自检规则 id 删除房间自检规则
  roomSelfCheckRuleDelete: (param) => Ax('delete', `${apiType.manager}/room/rules/${param.roomId}?ruleId=${param.ruleId}`),
  // 根据房间 id 删除房间所有自检规则
  roomSelfCheckRuleAllDelete: (param) => Ax('delete', `${apiType.manager}/room-inspection/room/${param.roomId}`),
  // 查询房间自检规则详情
  roomSelfCheckRuleDetail: (query) => Ax('get', `${apiType.manager}/room/rules/${query.roomId}?ruleId=${query.ruleId}`),
  // 房间自检规则异常时间
  roomSelfCheckRuleDuration: () => Ax('get', `${apiType.manager}/alarm-config/duration`),

  // ===== 自检模板相关 =====//
  // 查询自检规则模板列表
  ruleTemplateList: (param) => Ax('post', `${apiType.manager}/device-rules-template/list`, param),
  // 新增自检规则模板
  ruleTemplateAdd: (param) => Ax('post', `${apiType.manager}/device-rules-template`, param),
  // 编辑自检规则模板
  ruleTemplateEdit: (param) => Ax('put', `${apiType.manager}/device-rules-template/${param.id}`, param),
  // 查询自检规则模板详情
  ruleTemplateDetail: (query) => Ax('get', `${apiType.manager}/device-rules-template/${query.id}`),
  // 删除自检规则模板
  ruleTemplateDelete: (param) => Ax('delete', `${apiType.manager}/device-rules-template/${param.id}`),
  // 查询自检规则模板已应用的房间列表
  ruleTemplateApplyRoomList: (param) => Ax('post', `${apiType.manager}/device-rules-template/${param.id}/room/list/${param.req.locationId}?category=${param.category}`, param),
  // 自检规则模板应用至房间
  ruleTemplateApply: (param) => Ax('put', `${apiType.manager}/device-rules-template/${param.id}/room`, param),
  // 自检规则模板取消应用至房间
  ruleTemplateApplyCancel: (param) => Ax('put', `${apiType.manager}/device-rules-template/${param.id}/cancel/room`, param)

};
