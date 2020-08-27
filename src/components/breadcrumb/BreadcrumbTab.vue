<template>
  <el-row
    :id="breadcrumbId"
    :style="{top: breadcrumbTop, left: asideMenuCollapsed ? '64px' : '250px'}"
    class="breadcrumb-tab-container">
    <el-col :span="mainSpan">
      <el-tabs v-model="activeName" class="header6" @tab-click="tabClick">
        <el-tab-pane
          v-for="(tab, index) in tabData"
          :key="index"
          :label="tab.label"
          :name="tab.name">
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="optSpan" class="text-align-right">
      <div v-for="(opt, idx) in optData" :key="idx" class="display-inline-block">
        <div
          v-if="opt.type === 'btn'"
          style="height: 60px"
          class="breadcrumb-opt-btn"
          @click="opt.callback">
          <div class="text-align-center">
            <i :class="opt.icon" class="iconfont display-block font-size-20 pad-top-5"></i>
            <span class="mar-top-5 display-block">{{ opt.label }}</span>
          </div>
        </div>
        <el-dropdown
          v-if="opt.type === 'dropdown' && opt.items.length > 0"
          class="display-inline-block"
          @command="opt.callback">
          <div class="breadcrumb-opt-btn" style="height: 60px">
            <div class="text-align-center">
              <i :class="opt.icon" class="iconfont display-block font-size-20 pad-top-5"></i>
              <span class="mar-top-5 display-block">{{ opt.label }}</span>
            </div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, idx) in opt.items"
              :command="item.command"
              :key="idx">
              <i :class="item.icon" class="iconfont font-size-second"></i>&nbsp;{{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {mapState} from 'vuex';

  const elementResizeDetectorMaker = require('element-resize-detector');

  export default {
    name: 'BreadcrumbTab',
    model: {
      event: 'change'
    },
    props: {
      mainSpan: {
        type: Number,
        default: 14
      },
      optSpan: {
        type: Number,
        default: 10
      },
      currentTab: {
        type: String,
        default: ''
      },
      tabData: {
        type: Array,
        default: () => {
          return [];
        }
      },
      optData: {
        type: Array,
        default: () => {
          return [];
        }
      },
      subtitle: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        breadcrumbId: 'breadcrumbId',
        activeName: ''
      };
    },
    computed: {
      ...mapState(['browserSuggest', 'wsReconnecting', 'asideMenuCollapsed']),
      breadcrumbTop() {
        let top = 60;
        this.browserSuggest && (top += 30);
        this.wsReconnecting && (top += 30);
        return `${top}px`;
      }
    },
    watch: {
      currentTab: {
        handler() {
          this.activeName = this.currentTab;
        },
        immediate: true
      },
      subtitle() {
        this.calculateHeight();
      }
    },
    mounted() {
      this.calculateHeight();
    },
    methods: {
      // 监听面包屑高度变化
      calculateHeight() {
        const breadcrumb = document.getElementById(this.breadcrumbId);
        if (!breadcrumb) return;
        const erd = elementResizeDetectorMaker();
        erd.listenTo(breadcrumb, (element) => {
          this.$emit('change', element.offsetHeight, element.offsetWidth);
        });
      },
      tabClick(tab) {
        this.$emit('switchTab', tab.name);
      }
    }
  };
</script>

<style scoped lang="less">

  .breadcrumb-tab-container {
    position: fixed;
    right: 0;
    z-index: 2000;
    height: 60px;
    background: @colorWhite;
    padding: 0 30px 0 30px;
    box-shadow: 0 2px 8px 0 @colorBlackAlpha05;

    .el-tabs--top {
      line-height: 60px;
    }

    .breadcrumb-opt-btn {
      padding: 0 20px;
      font-size: @sizeSecond;
      color: @colorGray40;
      cursor: pointer;
    }

    .breadcrumb-opt-btn:hover {
      background: @colorGray98;
      color: @colorPrimary;
    }

  }

</style>
