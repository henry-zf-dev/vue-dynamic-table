import Ax from '../../api';

export default {
  // 查询代表人物列表
  historyRepresentativeList: (param) => Ax('post', `/history-dynasty/history-representative/list`, param),
  // 代表人物新增
  historyRepresentativeAdd: (param) => Ax('post', `/history-dynasty/history-representative`, param),
  // 代表人物编辑
  historyRepresentativeEdit: (param) => Ax('put', `/history-dynasty/history-representative/${param.id}`, param),
  // 代表人物详情
  historyRepresentativeDetail: (query) => Ax('get', `/history-dynasty/history-representative/${query.id}`),
  // 代表人物删除
  historyRepresentativeDelete: (query) => Ax('delete', `/history-dynasty/history-representative/${query.id}`)
};
