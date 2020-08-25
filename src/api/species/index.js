import Ax from '../api';

export default {
  // 查询种列表
  speciesList: (param) => Ax('post', `/species/list`, param),
  // 种新增
  speciesAdd: (param) => Ax('post', `/species`, param),
  // 种编辑
  speciesEdit: (param) => Ax('put', `/species/${param.id}`, param),
  // 种详情
  speciesDetail: (query) => Ax('get', `/species/${query.id}`),
  // 种删除
  speciesDelete: (query) => Ax('delete', `/species/${query.id}`)
};
