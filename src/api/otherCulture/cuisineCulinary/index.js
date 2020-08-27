import Ax from '../../api';

export default {
  // 查询饮食厨艺列表
  cuisineCulinaryList: (param) => Ax('post', `/other-culture/cuisine-culinary/list`, param),
  // 饮食厨艺新增
  cuisineCulinaryAdd: (param) => Ax('post', `/other-culture/cuisine-culinary`, param),
  // 饮食厨艺编辑
  cuisineCulinaryEdit: (param) => Ax('put', `/other-culture/cuisine-culinary/${param.id}`, param),
  // 饮食厨艺详情
  cuisineCulinaryDetail: (query) => Ax('get', `/other-culture/cuisine-culinary/${query.id}`),
  // 饮食厨艺删除
  cuisineCulinaryDelete: (query) => Ax('delete', `/other-culture/cuisine-culinary/${query.id}`)
};
