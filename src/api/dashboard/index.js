import Ax from '../api';
import {apiType} from '../../config/common';

export default {
  // 仪表盘--》告警房间数量和上线房间数量
  roomNumber: (param) => Ax('get', `${apiType.manager}/dashboard/count-alarm-room/${param.locationId}`),
  // 仪表盘--》告警设备数量和上线设备数量
  deviceNumber: (param) => Ax('get', `${apiType.manager}/dashboard/count-alarm-device/${param.locationId}`),
  // 仪表盘--》告警房间TOP10
  alarmRoomList: (param) => Ax('get', `${apiType.manager}/dashboard/alarm-room-list/${param.locationId}?startTime=${param.startTime}&endTime=${param.endTime} `, param),
  // 仪表盘--》告警设备top10
  alarmDeviceTypeList: (param) => Ax('get', `${apiType.manager}/dashboard/alarm-device-category-list/${param.locationId}?startTime=${param.startTime}&endTime=${param.endTime}`, param),
  // 仪表盘--》告警名称top10
  alarmRuleList: (param) => Ax('get', `${apiType.manager}/dashboard/alarm-config-list/${param.locationId}?startTime=${param.startTime}&endTime=${param.endTime}`, param),
  // 仪表盘--》告警曲线图
  alarmGraph: (param) => Ax('get', `${apiType.manager}/dashboard/alarm-graph/${param.locationId}?startTime=${param.startTime}&endTime=${param.endTime}`, param),
  // 仪表盘--》房间类型及分布区域
  roomTypeDistribution: (param) => Ax('get', `${apiType.manager}/dashboard/room-count-distribution/${param.locationId}`),
  // 仪表盘--》设备类型及分布区域
  deviceTypeDistribution: (param) => Ax('get', `${apiType.manager}/dashboard/device-type-distribution/${param.locationId}`)
};
