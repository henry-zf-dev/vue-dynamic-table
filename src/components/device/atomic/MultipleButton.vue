<template>
  <el-button
    :type="currentBtn.isActive ? 'primary' : 'info'"
    :circle="circle"
    :class="currentBtn.icon"
    :style="{width: `${width}px`, height: `${height}px`}"
    class="iconfont font-size-20"
    @click="btnClicked(currentBtn.value)">
    {{ currentBtn.label }}
  </el-button>
</template>

<script>
export default {
  name: 'MultipleButton',
  props: {
    buttons: {
      type: Array,
      default: () => {
        /*
          * [
          *   {
          *     label: '静音',
          *     icon: 'icon-mute',
          *     value: 'mute',
          *     isActive: true
          *   },
          *   {
          *     label: '取消静音',
          *     icon: 'icon-unmute',
          *     value: 'unmute',
          *     isActive: false
          *   }
          * ]
          * */
        return [];
      }
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
  computed: {
    currentBtn() {
      // 根据 model 值返回当前显示的 button 信息
      // 默认值为 isActive === false 的 button 信息
      return this.buttons.find(btn => {
        return btn.value === this.model || !btn.isActive;
      });
    }
  },
  methods: {
    btnClicked(value) {
      const btn = this.buttons.find(btn => {
        return btn.value !== value;
      });
      const ctrParam = {
        method: this.method,
        params: {
          ...this.defaultParams,
          [this.paramKey]: btn.value
        }
      };
      const expParam = {
        method: this.method,
        paramKey: this.paramKey,
        expectKey: this.expectKey || this.paramKey,
        value: btn.value
      };
      this.$emit('btnClicked', ctrParam, expParam);
    }
  }
};
</script>

<style scoped>

</style>
