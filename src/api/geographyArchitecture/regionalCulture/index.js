import Ax from '../../api';

export default {
  // 查询地域文化列表
  regionalCultureList: (param) => Ax('post', `/geography-architecture/regional-culture/list`, param),
  // 地域文化新增
  regionalCultureAdd: (param) => Ax('post', `/geography-architecture/regional-culture`, param),
  // 地域文化编辑
  regionalCultureEdit: (param) => Ax('put', `/geography-architecture/regional-culture/${param.id}`, param),
  // 地域文化详情
  regionalCultureDetail: (query) => Ax('get', `/geography-architecture/regional-culture/${query.id}`),
  // 地域文化删除
  regionalCultureDelete: (query) => Ax('delete', `/geography-architecture/regional-culture/${query.id}`)
};
