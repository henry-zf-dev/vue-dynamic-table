import axios from 'axios';
import { baseUrl } from '../config/env';
import { getUserInfo } from '../utils/index';

axios.defaults.baseURL = baseUrl;
const Ax = async(type = 'get', url = '', data = {}, headers = {
  'token': getUserInfo().token,
  'userId': getUserInfo().userId
}, externalUrl = false) => {
  const config = {
    method: type,
    url: externalUrl ? url : baseUrl + url,
    headers: headers,
    timeout: 30000
  };
  switch (type) {
    case 'get':
      break;
    case 'post':
    case 'delete':
    case 'patch':
    case 'put':
      config['data'] = data;
      break;
    default:
      break;
  }
  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error);
    return { message: '网络错误' };
  }
};

export default Ax;
