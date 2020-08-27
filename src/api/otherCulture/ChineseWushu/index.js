import Ax from '../../api';

export default {
  // 查询中华武术列表
  ChineseWushuList: (param) => Ax('post', `/other-culture/Chinese-Wushu/list`, param),
  // 中华武术新增
  ChineseWushuAdd: (param) => Ax('post', `/other-culture/Chinese-Wushu`, param),
  // 中华武术编辑
  ChineseWushuEdit: (param) => Ax('put', `/other-culture/Chinese-Wushu/${param.id}`, param),
  // 中华武术详情
  ChineseWushuDetail: (query) => Ax('get', `/other-culture/Chinese-Wushu/${query.id}`),
  // 中华武术删除
  ChineseWushuDelete: (query) => Ax('delete', `/other-culture/Chinese-Wushu/${query.id}`)
};
