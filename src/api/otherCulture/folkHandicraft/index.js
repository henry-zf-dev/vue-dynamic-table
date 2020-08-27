import Ax from '../../api';

export default {
  // 查询民间工艺列表
  folkHandicraftList: (param) => Ax('post', `/other-culture/folk-handicraft/list`, param),
  // 民间工艺新增
  folkHandicraftAdd: (param) => Ax('post', `/other-culture/folk-handicraft`, param),
  // 民间工艺编辑
  folkHandicraftEdit: (param) => Ax('put', `/other-culture/folk-handicraft/${param.id}`, param),
  // 民间工艺详情
  folkHandicraftDetail: (query) => Ax('get', `/other-culture/folk-handicraft/${query.id}`),
  // 民间工艺删除
  folkHandicraftDelete: (query) => Ax('delete', `/other-culture/folk-handicraft/${query.id}`)
};
