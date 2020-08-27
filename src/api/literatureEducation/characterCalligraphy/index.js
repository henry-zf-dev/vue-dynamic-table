import Ax from '../../api';

export default {
  // 查询文字书法列表
  characterCalligraphyList: (param) => Ax('post', `/literature-education/character-calligraphy/list`, param),
  // 文字书法新增
  characterCalligraphyAdd: (param) => Ax('post', `/literature-education/character-calligraphy`, param),
  // 文字书法编辑
  characterCalligraphyEdit: (param) => Ax('put', `/literature-education/character-calligraphy/${param.id}`, param),
  // 文字书法详情
  characterCalligraphyDetail: (query) => Ax('get', `/literature-education/character-calligraphy/${query.id}`),
  // 文字书法删除
  characterCalligraphyDelete: (query) => Ax('delete', `/literature-education/character-calligraphy/${query.id}`)
};
