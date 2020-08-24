<template>
  <div class="form-opt-btn-container">
    <div v-if="isInDialog" class="small-form-opt-btn-container">
      <el-button type="info" @click="formCancel">取消</el-button>
      <el-button type="primary" @click="formSubmit">确定</el-button>
    </div>
    <div
      v-else
      :style="{left: asideMenuCollapsed ? '89px' : '275px'}"
      class="large-form-opt-btn-container">
      <el-button type="info" @click="formCancel">取消</el-button>
      <el-button type="primary" @click="formSubmit">确定</el-button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'FormOptBtn',
  props: {
    isInDialog: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['asideMenuCollapsed'])
  },
  methods: {
    formCancel() {
      this.$emit('formCancel');
    },
    formSubmit() {
      this.$emit('formSubmit');
    }
  }
};
</script>

<style scoped lang="less">
  .small-form-opt-btn-container {
    text-align: right;
    background: @colorWhite;
  }
  .large-form-opt-btn-container {
    text-align: right;
    background: @colorWhite;
    padding: @paddingRegular @paddingMain;
    position: fixed;
    bottom: 0;
    left: 275px;
    right: @paddingMain;
    border-radius: @borderRadiusSecond;
    box-shadow:0px -2px 4px 0px @colorBlackAlpha05;
    z-index: 1999;
  }
</style>
