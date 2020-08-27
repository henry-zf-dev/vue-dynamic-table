import Ax from '../../api';

export default {
  // 查询大思想家列表
  greatThinkerList: (param) => Ax('post', `/geography-architecture/great-thinker/list`, param),
  // 大思想家新增
  greatThinkerAdd: (param) => Ax('post', `/geography-architecture/great-thinker`, param),
  // 大思想家编辑
  greatThinkerEdit: (param) => Ax('put', `/geography-architecture/great-thinker/${param.id}`, param),
  // 大思想家详情
  greatThinkerDetail: (query) => Ax('get', `/geography-architecture/great-thinker/${query.id}`),
  // 大思想家删除
  greatThinkerDelete: (query) => Ax('delete', `/geography-architecture/great-thinker/${query.id}`)
};
