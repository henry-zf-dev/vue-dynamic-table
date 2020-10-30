import axios from 'axios';
import {baseUrl} from '../config/env';
import {getUserInfo} from '../utils/index';
import CustomNotify from '../components/customNotify';

// getJson () {
//   axios.get(‘../../../static/data.json’).then(res=> {
//     console.log(res.body)
//   })
// }

function getUrlQuery(url = '') {
  let query = '';
  const splitArr = url.split('?');
  if (splitArr.length > 1) {
    query = splitArr[1];
  }
  return new URLSearchParams(query);
}

// 判断是否要忽略错误提示
function judgeIgnoreMsg(config = {}) {
  const {url = '', method = ''} = config;
  if (method === 'get' || method === 'GET') return true;
  const query = getUrlQuery(url);
  return !!query.get('ignoreMsg');
}

const Ax = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 30000
});

// 请求拦截器
Ax.interceptors.request.use(
  config => {
    const headers = config.headers;
    config.headers = {
      ...headers,
      'token': getUserInfo().token,
      'userId': getUserInfo().userId
    };
    return config;
  },
  error => {
    console.log('##### request error #####', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
Ax.interceptors.response.use(
  response => {
    const {config = {}} = response;
    const ignoreMsg = judgeIgnoreMsg(config);
    const resp = response.data || {};
    if (resp.code !== 0) {
      const message = resp.message || '服务器异常，请稍后重试';
      !ignoreMsg && CustomNotify({
        type: 'error',
        message: message
      });
      return Promise.reject(new Error(message));
    } else {
      return resp;
    }
  },
  error => {
    console.log('##### response error #####', error);
    const {config = {}} = error.response;
    const ignoreMsg = judgeIgnoreMsg(config);
    !ignoreMsg && CustomNotify({
      type: 'error',
      message: error.message || '网络错误，请稍后重试!'
    });
    return Promise.reject(error);
  }
);

export default Ax;
