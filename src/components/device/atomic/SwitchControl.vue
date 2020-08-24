<template>
  <div class="position-relative">
    <el-switch
      v-model="model"
      :active-value="active"
      :inactive-value="inactive"
      inactive-color="#e5e5e5">
    </el-switch>
    <div
      class="position-absolute switch-control-mask"
      @click="switched"></div>
  </div>
</template>

<script>
export default {
  name: 'SwitchControl',
  props: {
    switches: {
      type: Array,
      default: () => {
        /*
          * [
          *   {
          *     method: 'setChannelPowerOn',
          *     value: 'on',
          *     isActive: true
          *   },
          *   {
          *     method: 'setChannelPowerOn',
          *     value: 'off',
          *     isActive: false
          *   }
          * ]
          * */
        return [];
      }
    },
    active: {
      type: String,
      default: 'on'
    },
    inactive: {
      type: String,
      default: 'off'
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
    }
  },
  methods: {
    switched() {
      const swt = this.switches.find(swt => {
        return swt.value !== this.model;
      });
      const ctrParam = {
        method: swt.method,
        params: { ...this.defaultParams }
      };
      this.paramKey && (ctrParam.params[this.paramKey] = swt.value);
      const expParam = {
        method: swt.method,
        paramKey: this.paramKey,
        expectKey: this.expectKey || this.paramKey,
        value: swt.value
      };
      this.$emit('switched', ctrParam, expParam);
    }
  }
};
</script>

<style scoped lang="less">

  .switch-control-mask {
    width: 52px;
    height: 32px;
    cursor: pointer;
    right: 0;
    bottom: -6px;
  }

</style>
