import Ax from '../api';

export default {
  // 查询科列表
  familyList: (param) => Ax('post', `/family/list`, param),
  // 科新增
  familyAdd: (param) => Ax('post', `/family`, param),
  // 科编辑
  familyEdit: (param) => Ax('put', `/family/${param.id}`, param),
  // 科详情
  familyDetail: (query) => Ax('get', `/family/${query.id}`),
  // 科删除
  familyDelete: (query) => Ax('delete', `/family/${query.id}`)
};
