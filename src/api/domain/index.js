import Ax from '../api';

export default {
  // 查询域列表
  domainList: (param) => Ax('post', `/domain/list`, param),
  // 域新增
  domainAdd: (param) => Ax('post', `/domain`, param),
  // 域编辑
  domainEdit: (param) => Ax('put', `/domain/${param.id}`, param),
  // 域详情
  domainDetail: (query) => Ax('get', `/domain/${query.id}`),
  // 域删除
  domainDelete: (query) => Ax('delete', `/domain/${query.id}`)
};
