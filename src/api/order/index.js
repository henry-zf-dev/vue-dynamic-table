import Ax from '../api';

export default {
  // 查询目列表
  orderList: (param) => Ax('post', `/order/list`, param),
  // 目新增
  orderAdd: (param) => Ax('post', `/order`, param),
  // 目编辑
  orderEdit: (param) => Ax('put', `/order/${param.id}`, param),
  // 目详情
  orderDetail: (query) => Ax('get', `/order/${query.id}`),
  // 目删除
  orderDelete: (query) => Ax('delete', `/order/${query.id}`)
};
