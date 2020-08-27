import Ax from '../../api';

export default {
  // 查询音乐戏剧列表
  musicDramaList: (param) => Ax('post', `/other-culture/music-drama/list`, param),
  // 音乐戏剧新增
  musicDramaAdd: (param) => Ax('post', `/other-culture/music-drama`, param),
  // 音乐戏剧编辑
  musicDramaEdit: (param) => Ax('put', `/other-culture/music-drama/${param.id}`, param),
  // 音乐戏剧详情
  musicDramaDetail: (query) => Ax('get', `/other-culture/music-drama/${query.id}`),
  // 音乐戏剧删除
  musicDramaDelete: (query) => Ax('delete', `/other-culture/music-drama/${query.id}`)
};
