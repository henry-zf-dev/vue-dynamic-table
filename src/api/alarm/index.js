import Ax from '../api';
import { apiType } from '../../config/common';

export default {
  // 查询设备告警列表
  deviceAlarmList: (param) => Ax('post', `${apiType.manager}/device/alarm-device-list`, param),
  // 查询告警详情
  deviceAlarmDetail: (query) => Ax('get', `${apiType.manager}/alarm/${query.id}`),
  // 根据告警 id 手动恢复设备告警
  recoveryAlarmById: (param) => Ax('post', `${apiType.manager}/alarm/rec/${param.id}`, param),
  // 查询告警日志历史列表
  deviceAlarmLogHistoryList: (param) => Ax('post', `${apiType.manager}/alarm/list`, param),
  // 查询设备告警日志列表
  deviceAlarmLogList: (param) => Ax('post', `${apiType.manager}/alarm/device-list/${param.deviceId}`, param),
  // 根据设备类型和设备品牌查询检测项
  alarmRulesList: (query) => Ax('get', `${apiType.manager}/alarm-config/rules?category=${query.category}&brand=${query.brand}`),
  // 获取条件中房间场景
  alarmSceneList: (query) => Ax('get', `${apiType.manager}/scene/list`)
};
