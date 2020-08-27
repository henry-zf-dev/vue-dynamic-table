import Ax from '../../api';

export default {
  // 查询少数民族列表
  ethnicMinorityList: (param) => Ax('post', `/other-culture/ethnic-minority/list`, param),
  // 少数民族新增
  ethnicMinorityAdd: (param) => Ax('post', `/other-culture/ethnic-minority`, param),
  // 少数民族编辑
  ethnicMinorityEdit: (param) => Ax('put', `/other-culture/ethnic-minority/${param.id}`, param),
  // 少数民族详情
  ethnicMinorityDetail: (query) => Ax('get', `/other-culture/ethnic-minority/${query.id}`),
  // 少数民族删除
  ethnicMinorityDelete: (query) => Ax('delete', `/other-culture/ethnic-minority/${query.id}`)
};
