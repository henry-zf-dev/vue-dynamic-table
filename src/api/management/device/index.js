import Ax from '../../api';
import {apiType} from '../../../config/common';

export default {
  // 查询所有设备分类
  deviceCategoryList: () => Ax('get', `${apiType.manager}/category/list`),
  // 根据设备类型查询设备品牌
  deviceBrandList: (query) => Ax('get', `${apiType.manager}/brand/list/${query.category}`),
  // 查询设备所有storeKey
  deviceStoreKeyAll: () => Ax('get', `${apiType.manager}/device/general-cmd-list`),
  // 查询设备列表
  deviceList: (param) => Ax('post', `${apiType.manager}/device/list`, param),
  // 根据房间 id 查询设备列表
  deviceListByRoomId: (query) => Ax('get', `${apiType.manager}/room-info/device-list/${query.roomId}`),
  // 查询设备详情
  deviceDetail: (query) => Ax('get', `${apiType.manager}/device/${query.id}`),
  // 编辑设备
  deviceEdit: (param) => Ax('put', `${apiType.manager}/device/${param.id}`, param.data)

};
