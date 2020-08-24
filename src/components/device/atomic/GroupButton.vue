<template>
  <el-row v-if="buttons.length > 0">
    <el-col
      v-for="(btn, idx) in buttons"
      :span="span"
      :key="idx"
      :class="getPaddingClass(idx)"
      class="mar-btm-5">
      <el-button
        :type="model === btn.value ? 'primary' : 'info'"
        :class="btn.icon"
        class="width-100 iconfont"
        @click="btnClicked(btn.value)">
        {{ btn.label }}
      </el-button>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'GroupButton',
  props: {
    buttons: {
      type: Array,
      default: () => {
        return [];
      }
    },
    span: {
      type: Number,
      default: 12
    },
    model: {
      type: String,
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
    getPaddingClass(idx) {
      if ((24 / this.span) === 2) {
        return idx % 2 === 0 ? 'pad-rgt-5' : 'pad-lft-5';
      } else {
        return idx % (24 / this.span) === 0 ? 'pad-rgt-5' : 'pad-lft-5 pad-rgt-5';
      }
    },
    btnClicked(value) {
      const ctrParam = {
        method: this.method,
        params: {
          ...this.defaultParams,
          [this.paramKey]: value
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
