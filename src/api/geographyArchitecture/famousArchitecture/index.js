import Ax from '../../api';

export default {
  // 查询著名建筑列表
  famousArchitectureList: (param) => Ax('post', `/geography-architecture/famous-architecture/list`, param),
  // 著名建筑新增
  famousArchitectureAdd: (param) => Ax('post', `/geography-architecture/famous-architecture`, param),
  // 著名建筑编辑
  famousArchitectureEdit: (param) => Ax('put', `/geography-architecture/famous-architecture/${param.id}`, param),
  // 著名建筑详情
  famousArchitectureDetail: (query) => Ax('get', `/geography-architecture/famous-architecture/${query.id}`),
  // 著名建筑删除
  famousArchitectureDelete: (query) => Ax('delete', `/geography-architecture/famous-architecture/${query.id}`)
};
