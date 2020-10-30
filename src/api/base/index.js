import Ax from '../../api/api';

export default {
  // 查询 table 配置
  getTableConfigById: (url) => Ax.get(url)
};
