import Ax from '../../api';

import { apiType } from '../../../config/common';

export default {

  // 角色列表
  roleList: (param) => Ax('post', `${apiType.core}/role/list`, param),
  // 查询所有角色（无分页）
  roleAll: () => Ax('get', `${apiType.core}/role/all`),
  // 查询角色详情
  roleDetail: (query) => Ax('get', `${apiType.core}/role/${query.id}`),
  // 新增角色
  roleAdd: (param) => Ax('post', `${apiType.core}/role`, param),
  // 编辑角色
  roleEdit: (param) => Ax('put', `${apiType.core}/role/${param.id}`, param),
  // 删除角色
  roleDelete: (param) => Ax('delete', `${apiType.core}/role/${param.id}`),
  // 分配人员
  roleAssign: (param) => Ax('put', `${apiType.core}/role/assign/${param.id}`, param.users),

  // 权限列表
  permissionList: (query) => Ax('get', `${apiType.core}/permission/list?pageNo=${query.pageNo}&pageSize=${query.pageSize}`),
  // 查询所有权限列表
  permissionAll: () => Ax('get', `${apiType.core}/permission/all`),
  // 新增权限
  permissionAdd: (param) => Ax('post', `${apiType.core}/permission`, param),
  // 删除权限
  permissionDelete: (param) => Ax('delete', `${apiType.core}/permission/${param.id}`),
  // 修改权限
  permissionEdit: (param) => Ax('put', `${apiType.core}/permission`, param)

};
