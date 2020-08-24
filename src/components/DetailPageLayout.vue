<template>
  <div
    :id="pageId"
    :style="{minHeight: fitPage ? `${pageMinHeight}px` : 'auto'}"
    class="detail-page-layout">
    <el-tabs v-model="currentTab" class="position-relative">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.value"
        :name="tab.value"
        :label="tab.label">
        <slot :name="tab.value"></slot>
      </el-tab-pane>
      <div class="tab-more-opt-container">
        <slot name="tabMoreOpt"></slot>
      </div>
    </el-tabs>
  </div>
</template>

<script>
import {getTableMinHeight} from '../utils';

export default {
  name: 'DetailPageLayout',
  props: {
    tabs: {
      type: Array,
      default: () => {
        return [];
      }
    },
    defaultTab: {
      type: String,
      default: ''
    },
    fitPage: {
      type: Boolean,
      default: false
    },
    pageId: {
      type: String,
      default: 'detailPageLayout'
    }
  },
  data() {
    return {
      pageMinHeight: 0
    };
  },
  computed: {
    currentTab: {
      get() {
        return this.defaultTab || (this.tabs.length ? this.tabs[0]['value'] : '');
      },
      set() {}
    }
  },
  mounted() {
    this.pageMinHeight = getTableMinHeight(this.pageId, 130);
  }
};

</script>

<style scoped lang="less">

</style>
