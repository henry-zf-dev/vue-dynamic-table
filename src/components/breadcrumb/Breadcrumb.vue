<template>
  <el-row
    :id="breadcrumbId"
    :style="{top: breadcrumbTop, left: asideMenuCollapsed ? '64px' : '250px'}"
    class="breadcrumb-container">
    <el-col v-if="title" :span="titleSpan" class="pad-top pad-btm">
      <el-breadcrumb class="mar-btm">
        <el-breadcrumb-item v-for="(item, idx) in breadcrumb" :key="idx">
          <span
            :class="getBreadcrumbClass(idx)"
            class="header7"
            @click="breadcrumbClicked(item)">{{ item.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="position-relative">
        <span
          class="iconfont icon-zujiantubiao-fanhui breadcrumb-back-icon"
          @click="$router.go(-1)"></span>
        <div class="header3 pad-lft-30 limited-text" style="max-width: 100%;">
          <span
            :class="{'breadcrumb-title': titleWithHref}"
            @click="clickTitle">{{ title }}</span>
        </div>
      </div>
      <div v-if="subtitle.show">
        <div v-if="subtitle.text" class="breadcrumb-subtitle limited-text" style="max-width: 100%;">
          <el-tooltip :open-delay="500" :content="subtitle.text" placement="top">
            <span>{{ subtitle.text }}</span>
          </el-tooltip>
        </div>
        <div v-else class="breadcrumb-subtitle limited-text" style="max-width: 100%;">
          <span>{{ `注：该${subtitle.title}由${subtitle.createdPerson || '系统'}创建于${subtitle.createdTime}，` }}</span>
          <span>{{ `最后由${subtitle.updatedPerson || '系统'}修改于${subtitle.updatedTime}` }}</span>
        </div>
      </div>
    </el-col>
    <el-col v-else :span="titleSpan" style="padding: 23px 0">
      <el-breadcrumb>
        <el-breadcrumb-item v-for="(item, idx) in breadcrumb" :key="idx">
          <span
            :class="getBreadcrumbClass(idx)"
            class="header6"
            @click="breadcrumbClicked(item)">{{ item.title }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </el-col>
    <el-col :span="optSpan" class="text-align-right">
      <div v-for="(opt, idx) in optData" :key="idx" class="display-inline-block">
        <div
          v-if="opt.type === 'btn' && (!opt.perm || judgePerm(opt.perm))"
          :style="{height: optHeight}"
          class="breadcrumb-opt-btn"
          @click="opt.callback">
          <div class="text-align-center">
            <i
              :class="[opt.icon, title ? 'font-size-24' : 'font-size-20']"
              :style="{paddingTop: optPadding}"
              class="iconfont font-size-24 display-block"></i>
            <span class="mar-top-5 display-block">{{ opt.label }}</span>
          </div>
        </div>
        <el-dropdown
          v-if="opt.type === 'dropdown' && judgeDropDown(opt.items)"
          class="display-inline-block"
          @command="opt.callback">
          <div
            :style="{height: optHeight}"
            class="breadcrumb-opt-btn">
            <div class="text-align-center">
              <i
                :class="[opt.icon, title ? 'font-size-24' : 'font-size-20']"
                :style="{paddingTop: optPadding}"
                class="iconfont display-block"></i>
              <span class="mar-top-5 display-block">{{ opt.label }}</span>
            </div>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, idx) in opt.items"
              v-if="!item.perm || judgePerm(item.perm)"
              :key="idx"
              :command="item.command">
              <i :class="item.icon" class="iconfont font-size-second"></i>&nbsp;{{ item.label }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {judgePermission} from '../../utils';
  import {commonString} from '../../config/string';
  import {mapState} from 'vuex';

  const elementResizeDetectorMaker = require('element-resize-detector');

  export default {
    name: 'Breadcrumb',
    model: {
      event: 'change'
    },
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
        breadcrumbId: 'breadcrumbId'
      };
    },
    computed: {
      ...mapState(['browserSuggest', 'wsReconnecting', 'asideMenuCollapsed']),
      breadcrumbTop() {
        let top = 60;
        this.browserSuggest && (top += 30);
        this.wsReconnecting && (top += 30);
        return `${top}px`;
      },
      breadcrumb() {
        return this.$route.meta.breadcrumb || [];
      },
      defaultTitle() {
        return this.breadcrumb.length > 0 ? this.breadcrumb[0].title : commonString.unknown;
      },
      optHeight() {
        if (this.title) {
          if (this.subtitle.show) {
            return '106px';
          } else {
            return '80px';
          }
        } else {
          return '60px';
        }
      },
      optPadding() {
        if (this.title) {
          if (this.subtitle.show) {
            return '28px';
          } else {
            return '15px';
          }
        } else {
          return '6px';
        }
      }
    },
    watch: {
      title() {
        this.calculateHeight();
      },
      subtitle() {
        this.calculateHeight();
      }
    },
    mounted() {
      this.calculateHeight();
    },
    methods: {
      judgePerm: judgePermission,
      // 监听面包屑高度变化
      calculateHeight() {
        const breadcrumb = document.getElementById(this.breadcrumbId);
        if (!breadcrumb) return;
        const erd = elementResizeDetectorMaker();
        erd.listenTo(breadcrumb, (element) => {
          this.$emit('change', element.offsetHeight, element.offsetWidth);
        });
      },
      judgeDropDown(items = []) {
        return items.find(i => {
          return !i.perm || this.judgePerm(i.perm);
        });
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

    .breadcrumb-subtitle {
      font-size: @sizeSecond;
      color: @colorGray60;
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
