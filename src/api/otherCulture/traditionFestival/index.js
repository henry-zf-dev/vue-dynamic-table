import Ax from '../../api';

export default {
  // 查询传统节日列表
  traditionFestivalList: (param) => Ax('post', `/other-culture/tradition-festival/list`, param),
  // 传统节日新增
  traditionFestivalAdd: (param) => Ax('post', `/other-culture/tradition-festival`, param),
  // 传统节日编辑
  traditionFestivalEdit: (param) => Ax('put', `/other-culture/tradition-festival/${param.id}`, param),
  // 传统节日详情
  traditionFestivalDetail: (query) => Ax('get', `/other-culture/tradition-festival/${query.id}`),
  // 传统节日删除
  traditionFestivalDelete: (query) => Ax('delete', `/other-culture/tradition-festival/${query.id}`)
};
