import Ax from '../../api';
import { apiType } from '../../../config/common';

export default {
  // 查询分控列表
  subControlList: (param) => Ax('post', `${apiType.manager}/central-control/list`, param),
  // 查询分控详情
  subControlDetail: (query) => Ax('get', `${apiType.manager}/central-control/${query.id}`),
  // 新增分控
  subControlAdd: (param) => Ax('post', `${apiType.manager}/central-control`, param),
  // 编辑分控
  subControlEdit: (param) => Ax('put', `${apiType.manager}/central-control/${param.id}`, param),
  // 删除分控
  subControlDelete: (param) => Ax('delete', `${apiType.manager}/central-control/${param.id}?isEnable=${param.isEnable}`),
  // 跳转分控前获取token
  subControlToken: () => Ax('get', `${apiType.manager}/central-control/key`)
};
