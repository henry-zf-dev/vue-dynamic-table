<template>
  <div class="not-fond-container">
    <div class="not-fond-content">
      <div class="header6 font-gray-70">抱歉，你访问的页面不存在</div>
      <el-button type="primary" class="mar-top" @click="signOut">退出系统</el-button>
    </div>
  </div>
</template>

<script>
import { routerMeta } from '../router/routerMeta';
import { clearStorage } from '../config/sessions';

export default {
  name: 'NotFound',
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

  .not-fond-container {
    position: relative;
    height: 100%;
    text-align: center;

    .not-fond-content {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -100px;
      margin-left: -100px;
    }
  }

</style>
