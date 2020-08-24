<template>
  <el-button
    :type="type || (model === paramValue ? 'primary' : 'info')"
    :circle="circle"
    :class="icon"
    :style="{width: `${width}px`, height: `${height}px`}"
    class="iconfont font-size-20"
    @click="btnClicked">
    {{ label }}
  </el-button>
</template>

<script>
export default {
  name: 'SingleButton',
  props: {
    type: {
      type: String,
      default: ''
    },
    circle: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      default: 60
    },
    height: {
      type: Number,
      default: 60
    },
    label: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    // eslint-disable-next-line vue/require-prop-types
    model: {
      default: ''
    },
    defaultParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    paramKey: {
      type: String,
      default: ''
    },
    // eslint-disable-next-line vue/require-prop-types
    paramValue: {
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
    btnClicked() {
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
        value: this.paramValue
      };
      this.$emit('btnClicked', ctrParam, expParam);
    }
  }
};
</script>

<style scoped>

</style>
