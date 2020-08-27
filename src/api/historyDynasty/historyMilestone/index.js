import Ax from '../../api';

export default {
  // 查询重大事件列表
  historyMilestoneList: (param) => Ax('post', `/history-dynasty/history-milestone/list`, param),
  // 重大事件新增
  historyMilestoneAdd: (param) => Ax('post', `/history-dynasty/history-milestone`, param),
  // 重大事件编辑
  historyMilestoneEdit: (param) => Ax('put', `/history-dynasty/history-milestone/${param.id}`, param),
  // 重大事件详情
  historyMilestoneDetail: (query) => Ax('get', `/history-dynasty/history-milestone/${query.id}`),
  // 重大事件删除
  historyMilestoneDelete: (query) => Ax('delete', `/history-dynasty/history-milestone/${query.id}`)
};
