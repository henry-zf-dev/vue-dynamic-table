import Ax from '../../api';

export default {
  // 查询生肖文化列表
  zodiacCultureList: (param) => Ax('post', `/other-culture/zodiac-culture/list`, param),
  // 生肖文化新增
  zodiacCultureAdd: (param) => Ax('post', `/other-culture/zodiac-culture`, param),
  // 生肖文化编辑
  zodiacCultureEdit: (param) => Ax('put', `/other-culture/zodiac-culture/${param.id}`, param),
  // 生肖文化详情
  zodiacCultureDetail: (query) => Ax('get', `/other-culture/zodiac-culture/${query.id}`),
  // 生肖文化删除
  zodiacCultureDelete: (query) => Ax('delete', `/other-culture/zodiac-culture/${query.id}`)
};
