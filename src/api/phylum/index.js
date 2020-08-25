import Ax from '../api';

export default {
  // 查询门列表
  phylumList: (param) => Ax('post', `/phylum/list`, param),
  // 门新增
  phylumAdd: (param) => Ax('post', `/phylum`, param),
  // 门编辑
  phylumEdit: (param) => Ax('put', `/phylum/${param.id}`, param),
  // 门详情
  phylumDetail: (query) => Ax('get', `/phylum/${query.id}`),
  // 门删除
  phylumDelete: (query) => Ax('delete', `/phylum/${query.id}`)
};
