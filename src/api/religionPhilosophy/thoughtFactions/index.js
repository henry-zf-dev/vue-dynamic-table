import Ax from '../../api';

export default {
  // 查询思想派系列表
  thoughtFactionsList: (param) => Ax('post', `/geography-architecture/thought-factions/list`, param),
  // 思想派系新增
  thoughtFactionsAdd: (param) => Ax('post', `/geography-architecture/thought-factions`, param),
  // 思想派系编辑
  thoughtFactionsEdit: (param) => Ax('put', `/geography-architecture/thought-factions/${param.id}`, param),
  // 思想派系详情
  thoughtFactionsDetail: (query) => Ax('get', `/geography-architecture/thought-factions/${query.id}`),
  // 思想派系删除
  thoughtFactionsDelete: (query) => Ax('delete', `/geography-architecture/thought-factions/${query.id}`)
};
