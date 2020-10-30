<template>
  <div
    :id="breadcrumbId"
    :style="{top: '0', height: `${optHeight}px`, left: asideMenuCollapsed ? '64px' : '250px'}"
    class="breadcrumb-container">
    <div v-if="tabData.length > 0">
      <el-tabs v-model="activeName" class="header6" @tab-click="tabClick">
        <el-tab-pane
          v-for="(tab, index) in tabData"
          v-if="judgePerm(tab)"
          :key="index"
          :label="tab.label"
          :name="tab.name">
        </el-tab-pane>
      </el-tabs>
    </div>
    <div v-else class="height-100">
      <div v-if="title" class="pad-top pad-btm-10">
        <el-breadcrumb>
          <el-breadcrumb-item v-for="(item, idx) in breadcrumb" :key="idx">
            <span
              :class="getBreadcrumbClass(idx)"
              class="header7"
              @click="breadcrumbClicked(item)">{{ item.title }}</span>
          </el-breadcrumb-item>
        </el-breadcrumb>
        <div class="breadcrumb-title-container">
          <span
            class="iconfont icon-zujiantubiao-fanhui breadcrumb-back-icon"
            @click="$router.go(-1)"></span>
          <div class="header4 pad-lft-30 limited-text max-width-60">
            <span
              :class="{'breadcrumb-title': titleWithHref}"
              @click="clickTitle">{{ title }}</span>
          </div>
        </div>
        <div v-if="subtitle.show">
          <div v-if="subtitle.text" class="breadcrumb-subtitle limited-text">
            <el-tooltip :open-delay="500" :content="subtitle.text" placement="top">
              <span>{{ subtitle.text }}</span>
            </el-tooltip>
          </div>
          <div v-else class="breadcrumb-subtitle limited-text">
            <span>{{ `注：该${subtitle.title}由${subtitle.createdPerson || '系统'}创建于${subtitle.createdTime||''}，` }}</span>
            <span>{{ `最后由${subtitle.updatedPerson || '系统'}修改于${subtitle.updatedTime||''}` }}</span>
          </div>
        </div>
      </div>
      <div v-else class="display-table height-100">
        <div class="display-table-cell vertical-align-middle">
          <el-breadcrumb>
            <el-breadcrumb-item v-for="(item, idx) in breadcrumb" :key="idx">
              <span
                :class="getBreadcrumbClass(idx)"
                class="header6"
                @click="breadcrumbClicked(item)">{{ item.title }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </div>
    <div class="breadcrumb-opt-container">
      <div v-if="extraTitle" class="display-table height-100">
        <span class="breadcrumb-extra-title">{{ extraTitle }}</span>
      </div>
      <div v-for="opt in optData" :key="opt.label" class="breadcrumb-opt-item-container">
        <div
          v-if="opt.type === 'btn' && judgePerm(opt)"
          class="breadcrumb-opt-btn-container"
          @click="opt.callback">
          <div class="breadcrumb-opt-btn-content">
            <i :class="[opt.icon]" class="iconfont font-size-20 display-block"></i>
            <span class="mar-top-5 display-block">{{ opt.label }}</span>
          </div>
        </div>
        <el-dropdown
          v-if="opt.type === 'dropdown' && judgeDropDown(opt.items) && !opt.hide"
          class="height-100"
          @command="opt.callback">
          <div class="breadcrumb-opt-btn-container">
            <div class="breadcrumb-opt-btn-content">
              <i :class="[opt.icon]" class="iconfont font-size-20 display-block"></i>
              <span class="mar-top-5 display-block">{{ opt.label }}</span>
            </div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, idx) in getDropDownMenu(opt.items)"
              :key="idx"
              :command="item.command">
              <i :class="item.icon" class="iconfont font-size-second"></i>&nbsp;{{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
  import {judgePermission} from '../../utils';
  import {commonString} from '../../config/string';
  import {mapState} from 'vuex';

  const elementResizeDetectorMaker = require('element-resize-detector');

  export default {
    name: 'Breadcrumb',
    props: {
      titleSpan: {
        type: Number,
        default: 14
      },
      optSpan: {
        type: Number,
        default: 10
      },
      title: {
        type: String,
        default: ''
      },
      // 点击 title 是否有跳转
      titleWithHref: {
        type: Boolean,
        default: false
      },
      subtitle: {
        type: Object,
        default: () => {
          return {
            show: false,
            text: '', // 如果传入 text，则直接显示 text，否则就组装以下字段
            title: '', // 标题，如：用户/告警规则/房间等等
            createdPerson: '',
            createdTime: '',
            updatedPerson: '',
            updatedTime: ''
          };
        }
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
      extraTitle: {
        type: String,
        default: ''
      },
      optData: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    data() {
      return {
        commonString: commonString,
        breadcrumbId: 'breadcrumbId',
        activeName: ''
      };
    },
    computed: {
      ...mapState(['asideMenuCollapsed']),
      breadcrumb() {
        return this.$route.meta.breadcrumb || [];
      },
      defaultTitle() {
        return this.breadcrumb.length > 0 ? this.breadcrumb[0].title : commonString.unknown;
      },
      optHeight() {
        if (this.tabData.length > 0) {
          return 50;
        } else {
          if (this.title) {
            if (this.subtitle.show) {
              return 100;
            } else {
              return 80;
            }
          } else {
            return 50;
          }
        }
      }
    },
    watch: {
      title() {
        this.calculateHeight();
      },
      subtitle() {
        this.calculateHeight();
      },
      currentTab: {
        handler() {
          this.activeName = this.currentTab;
        },
        immediate: true
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
          this.$store.commit('updateBreadcrumbHeight', element.offsetHeight);
        });
      },
      judgePerm(opt = {}) {
        return !opt.hide;
      },
      judgeDropDown(items = []) {
        return items.find(i => {
          return this.judgePerm(i);
        });
      },
      getDropDownMenu(items = []) {
        const menu = [];
        items.forEach(i => {
          if (this.judgePerm(i)) {
            menu.push(i);
          }
        });
        return menu;
      },
      clickTitle() {
        this.$emit('clickTitle');
      },
      getBreadcrumbClass(idx) {
        const item = this.breadcrumb[idx];
        if (!item) return;
        const font = idx === 0 ? 'font-weight-bold' : 'font-weight-regular font-gray-60';
        const cursor = item.name ? 'cursor-pointer font-hover-primary' : '';
        return `${font} ${cursor}`;
      },
      breadcrumbClicked(item = {}) {
        if (!item.name) return;
        this.$router.push({name: item.name, params: this.$route.params, query: this.$route.query});
      },
      tabClick(tab) {
        this.$emit('switchTab', tab.name);
      }
    }
  };
</script>

<style scoped lang="less">

  .breadcrumb-container {
    position: fixed;
    right: 0;
    z-index: 2000;
    background: @colorWhite;
    padding: 0 24px;
    box-shadow: 0 2px 8px 0 @colorBlackAlpha05;

    .breadcrumb-title-container {
      position: relative;
      margin-top: 15px;
    }

    .breadcrumb-subtitle {
      font-size: @sizeSecond;
      color: @colorGray60;
      max-width: 60%;
      margin-top: 10px;
    }

    .breadcrumb-back-icon {
      position: absolute;
      left: 0;
      top: 3px;
      cursor: pointer;
      color: @colorGray40;
    }

    .breadcrumb-back-icon:hover {
      color: @colorPrimary;
    }

    .breadcrumb-title:hover {
      cursor: pointer;
      color: @colorPrimary;
      text-decoration: underline;
    }

    .breadcrumb-opt-container {
      position: absolute;
      top: 0;
      bottom: 0;
      right: @paddingMain;

      .breadcrumb-extra-title {
        font-size: @sizeMain;
        color: @colorGray40;
        display: table-cell;
        vertical-align: middle;
      }

      .breadcrumb-opt-item-container {
        display: inline-block;
        height: 100%;

        .breadcrumb-opt-btn-container {
          padding: 0 20px;
          font-size: @sizeSecond;
          color: @colorGray40;
          height: 100%;
          display: table;
          cursor: pointer;

          .breadcrumb-opt-btn-content {
            display: table-cell;
            vertical-align: middle;
            text-align: center
          }
        }

        .breadcrumb-opt-btn-container:hover {
          background: @colorGray98;
          color: @colorPrimary;
        }
      }
    }

  }

</style>
