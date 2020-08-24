import Ax from '../../api';
import { apiType } from '../../../config/common';

export default {
  // 查询房间报告列表
  roomReportList: (param) => Ax('post', `${apiType.manager}/room-report/list`, param),
  // 查询房间报告详情
  roomReportDetail: (query) => Ax('get', `${apiType.manager}/room-report/${query.id}`),
  // 生成房间报告
  roomReportAdd: (param) => Ax('post', `${apiType.manager}/room-report`, param),
  // 查询自检历史记录
  roomReportRuleList: (param) => Ax('post', `${apiType.manager}/room-report/list/rule/${param.roomId}?time=${param.time}`, param),
  // 查询房间自检报告自检触发次数
  roomReportSelfCheckTriggerCount: (param) => Ax('post', `${apiType.manager}/room-report/list/rule/count/${param.roomId}?time=${param.time}`, param),
  // 查询房间自检报告告警历史记录
  getRoomReportRoomList: (param) => Ax('post', `${apiType.manager}/room-report/list/alarm/${param.roomId}?time=${param.time}`, param),
  // 查询房间自检报告告警触发次数
  roomReportAlarmTriggerCount: (param) => Ax('post', `${apiType.manager}/room-report/list/alarm/count/${param.roomId}?time=${param.time}`, param)
};
