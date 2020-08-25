import Ax from '../api';

export default {
  // 查询纲列表
  classList: (param) => Ax('post', `/class/list`, param),
  // 纲新增
  classAdd: (param) => Ax('post', `/class`, param),
  // 纲编辑
  classEdit: (param) => Ax('put', `/class/${param.id}`, param),
  // 纲详情
  classDetail: (query) => Ax('get', `/class/${query.id}`),
  // 纲删除
  classDelete: (query) => Ax('delete', `/class/${query.id}`)
};
