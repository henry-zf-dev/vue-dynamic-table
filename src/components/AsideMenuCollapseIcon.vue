<template>
  <div
    :style="{left: collapsed ? '-24px' : '-8px'}"
    class="aside-menu-collapse-icon"
    @click="collapseChange">
    <i
      :class="collapsed ?
        'icon-zujiantubiao-xinxijiegou-xiangyou' :
      'icon-zujiantubiao-xinxijiegou-xiangzuo'"
      class="iconfont"
    ></i>
  </div>
</template>

<script>
export default {
  name: 'AsideMenuCollapseIcon',
  model: {
    event: 'change'
  },
  data() {
    return {
      collapsed: false
    };
  },
  methods: {
    collapseChange() {
      this.collapsed = !this.collapsed;
      this.$emit('change', this.collapsed);
    }
  }
};
</script>

<style scoped>

</style>
