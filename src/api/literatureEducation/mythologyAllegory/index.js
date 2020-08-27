import Ax from '../../api';

export default {
  // 查询神话寓言列表
  mythologyAllegoryList: (param) => Ax('post', `/literature-education/mythology-allegory/list`, param),
  // 神话寓言新增
  mythologyAllegoryAdd: (param) => Ax('post', `/literature-education/mythology-allegory`, param),
  // 神话寓言编辑
  mythologyAllegoryEdit: (param) => Ax('put', `/literature-education/mythology-allegory/${param.id}`, param),
  // 神话寓言详情
  mythologyAllegoryDetail: (query) => Ax('get', `/literature-education/mythology-allegory/${query.id}`),
  // 神话寓言删除
  mythologyAllegoryDelete: (query) => Ax('delete', `/literature-education/mythology-allegory/${query.id}`)
};
