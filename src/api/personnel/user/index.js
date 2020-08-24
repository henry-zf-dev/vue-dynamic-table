import Ax from '../../api';

import { apiType } from '../../../config/common';

export default {
  // 登录
  login: (param) => Ax('post', `${apiType.core}/user/login`, param),
  // 登出
  logout: () => Ax('post', `${apiType.core}/user/logout`),
  // 第三方认证接口
  authenticate: (query) => Ax('get', `${apiType.core}/sso/user/login?token=${query.token}`),
  // 发送手机验证码
  sendSms: (query) => Ax('get', `${apiType.core}/message/send-sms?tel=${query.tel}&type=${query.type}`, query),
  // 获取图片验证码
  imgCaptcha: () => Ax('get', `${apiType.core}/captcha`),

  // 查询用户列表
  userList: (param) => Ax('post', `${apiType.core}/user/list`, param),
  // 查询所有用户（无分页）
  userAll: () => Ax('get', `${apiType.core}/user/all`),
  // 查询用户详情
  userDetail: (query) => Ax('get', `${apiType.core}/user/${query.id}`),
  // 新增用户
  userAdd: (param) => Ax('post', `${apiType.core}/user`, param),
  // 编辑用户
  userEdit: (param) => Ax('put', `${apiType.core}/user/${param.id}`, param),
  // 删除用户
  userDelete: (param) => Ax('delete', `${apiType.core}/user/${param.id}`),
  // 重置密码
  userResetPwd: (param) => Ax('put', `${apiType.core}/user/reset/${param.id}`),
  // 修改密码
  userModifyPwd: (param) => Ax('put', `${apiType.core}/user/pwd`, param),
  // 查询当前用户的所有权限列表
  userPermissionAll: () => Ax('get', `${apiType.core}/user/refresh-permission`),
  // 刷新token
  userRefreshToken: () => Ax('get', `${apiType.core}/user/refresh-token`)
};
