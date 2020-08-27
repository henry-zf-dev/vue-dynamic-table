import Ax from '../../api';

export default {
  // 查询朝代演进列表
  dynastyProgressList: (param) => Ax('post', `/history-dynasty/dynasty-progress/list`, param),
  // 朝代演进新增
  dynastyProgressAdd: (param) => Ax('post', `/history-dynasty/dynasty-progress`, param),
  // 朝代演进编辑
  dynastyProgressEdit: (param) => Ax('put', `/history-dynasty/dynasty-progress/${param.id}`, param),
  // 朝代演进详情
  dynastyProgressDetail: (query) => Ax('get', `/history-dynasty/dynasty-progress/${query.id}`),
  // 朝代演进删除
  dynastyProgressDelete: (query) => Ax('delete', `/history-dynasty/dynasty-progress/${query.id}`)
};
