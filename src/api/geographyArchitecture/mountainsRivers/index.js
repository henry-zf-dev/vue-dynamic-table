import Ax from '../../api';

export default {
  // 查询名山大川列表
  mountainsRiversList: (param) => Ax('post', `/geography-architecture/mountains-rivers/list`, param),
  // 名山大川新增
  mountainsRiversAdd: (param) => Ax('post', `/geography-architecture/mountains-rivers`, param),
  // 名山大川编辑
  mountainsRiversEdit: (param) => Ax('put', `/geography-architecture/mountains-rivers/${param.id}`, param),
  // 名山大川详情
  mountainsRiversDetail: (query) => Ax('get', `/geography-architecture/mountains-rivers/${query.id}`),
  // 名山大川删除
  mountainsRiversDelete: (query) => Ax('delete', `/geography-architecture/mountains-rivers/${query.id}`)
};
