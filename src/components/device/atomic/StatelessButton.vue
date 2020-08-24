<template>
  <el-button
    :class="icon"
    type="primary"
    class="width-100 iconfont"
    @click="btnClicked">
    {{ label }}
  </el-button>
</template>

<script>
export default {
  name: 'StatelessButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    paramKey: {
      type: String,
      default: ''
    },
    paramValue: {
      type: String,
      default: ''
    },
    expectKey: {
      type: String,
      default: ''
    },
    method: {
      type: String,
      default: ''
    }
  },
  methods: {
    btnClicked(value) {
      const ctrParam = {
        method: this.method,
        params: {
          ...this.defaultParams
        }
      };
      const expParam = {
        method: this.method,
        paramKey: this.paramKey,
        expectKey: this.expectKey || this.paramKey,
        value: value
      };
      this.$emit('btnClicked', ctrParam, expParam);
    }
  }
};
</script>

<style scoped>

</style>
