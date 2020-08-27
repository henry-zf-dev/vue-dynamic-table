import Ax from '../../api';

export default {
  // 查询文学著作列表
  famousLiteratureList: (param) => Ax('post', `/literature-education/famous-literature/list`, param),
  // 文学著作新增
  famousLiteratureAdd: (param) => Ax('post', `/literature-education/famous-literature`, param),
  // 文学著作编辑
  famousLiteratureEdit: (param) => Ax('put', `/literature-education/famous-literature/${param.id}`, param),
  // 文学著作详情
  famousLiteratureDetail: (query) => Ax('get', `/literature-education/famous-literature/${query.id}`),
  // 文学著作删除
  famousLiteratureDelete: (query) => Ax('delete', `/literature-education/famous-literature/${query.id}`)
};
