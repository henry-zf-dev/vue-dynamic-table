import Ax from '../../api';
import { apiType } from '../../../config/common';

export default {
  // 查询操作日志列表
  operationLogList: (param) => Ax('post', `${apiType.core}/operation-log/list`, param),
  // 查询设备日志列表
  deviceLogList: (param) => Ax('post', `${apiType.manager}/device-log`, param),
  // 查询房间日志列表
  roomLogList: (param) => Ax('post', `${apiType.manager}/room-log/list`, param),
  // 查询自检日志列表
  selfCheckLogList: (param) => Ax('post', `${apiType.manager}/device-check-history/list`, param)
};
