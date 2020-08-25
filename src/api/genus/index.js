import Ax from '../api';

export default {
  // 查询属列表
  genusList: (param) => Ax('post', `/genus/list`, param),
  // 属新增
  genusAdd: (param) => Ax('post', `/genus`, param),
  // 属编辑
  genusEdit: (param) => Ax('put', `/genus/${param.id}`, param),
  // 属详情
  genusDetail: (query) => Ax('get', `/genus/${query.id}`),
  // 属删除
  genusDelete: (query) => Ax('delete', `/genus/${query.id}`)
};
