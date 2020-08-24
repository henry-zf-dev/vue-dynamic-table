<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  data() {
    return {};
  },
  beforeDestroy() {

  },
  mounted() {
    this.$store.commit('updateClientWidth', document.body.clientWidth);
    this.$store.commit('updateClientHeight', document.body.clientHeight);
    // 监听窗口大小
    window.onresize = () => {
      return (() => {
        this.$store.commit('updateClientWidth', document.body.clientWidth);
        this.$store.commit('updateClientHeight', document.body.clientHeight);
      })();
    };
  }
};
</script>

<style lang="less">
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: @colorGray20;
    background: @colorGray96;
    box-shadow: -1px 0 0 @colorGray90;
    height: 100%;
  }
</style>
