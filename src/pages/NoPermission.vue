<template>
  <div class="no-permission-container">
    <div class="no-permission-content">
      <div class="header6 font-gray-70">暂无权限，请联系管理员为您添加权限!</div>
      <el-button type="primary" class="mar-top" @click="signOut">退出系统</el-button>
    </div>
  </div>
</template>

<script>
import { clearStorage } from '../config/sessions';
import { routerMeta } from '../router/routerMeta';

export default {
  name: 'NoPermission',
  methods: {
    signOut() {
      clearStorage();
      this.$router.push({
        name: routerMeta.login.name
      });
    }
  }
};
</script>

<style scoped lang="less">

  .no-permission-container {
    position: relative;
    height: 100%;
    text-align: center;

    .no-permission-content {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -100px;
      margin-left: -100px;
    }

  }

</style>
