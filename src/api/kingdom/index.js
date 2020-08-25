import Ax from '../api';

export default {
  // 查询界列表
  kingdomList: (param) => Ax('post', `/kingdom/list`, param),
  // 界新增
  kingdomAdd: (param) => Ax('post', `/kingdom`, param),
  // 界编辑
  kingdomEdit: (param) => Ax('put', `/kingdom/${param.id}`, param),
  // 界详情
  kingdomDetail: (query) => Ax('get', `/kingdom/${query.id}`),
  // 界删除
  kingdomDelete: (query) => Ax('delete', `/kingdom/${query.id}`)
};
