<template>
  <div class="table-column-container">
    <div
      v-for="(child, idx) in children"
      :style="{display: horizontal ? 'inline-block' : 'block'}"
      :key="idx"
      class="table-column-content">
      <div
        v-if="!child.children"
        :class="child.hover?'column-hover':''"
        class="pad-rgt-10"
        @click="columnClick(child.key,data,child.hover)">
        <TableCircle
          v-if="child.circle"
          :class="child.class"
          :size="child.size"
          :color="child.color"
          :type="data[child.colorKey]"
          :trim="child.trim"
          :title="data.hasOwnProperty(child.key) ? data[child.key] : ''"></TableCircle>
        <!--<i v-else-if="child.icon" class="iconfont font-size-main" :class="getIconClass(child)"></i>-->
        <i v-else-if="child.icon" :class="getIconClass(child)" class="iconfont"></i>
        <div v-else-if="child.image">
          <div v-if="data[child.key]" class="table-cell-image-container">
            <el-popover
              v-for="(file, idx) in getImage(data[child.key])"
              :key="idx"
              :open-delay="500"
              placement="right"
              trigger="hover">
              <img :src="`${fileBaseUrl}${file.url}`" width="200px" height="200px">
              <img
                slot="reference"
                :src="`${fileBaseUrl}${file.url}`"
                class="cursor-pointer table-cell-image size-40">
            </el-popover>
          </div>
          <div v-else>
            <img :src="commonString.emptyImg.small" class="size-40">
          </div>
        </div>
        <div v-else-if="child.buttons">
          <div
            v-for="(btn, idx) in child.buttons"
            v-if="!btn.dropdown && (judgeOptBtnPerm(btn) || btn.icon) && (data.hasOwnProperty('isBtnArr')?!data['isBtnArr'].includes(btn.type):true)"
            :key="idx">
            <el-button
              :class="getBtnClass(btn)"
              type="info"
              size="mini"
              class="mar-rgt-10"
              @click="child.callback({type: getBtnInfo(btn).type, data: data})"
            >{{ getBtnTitle(btn) }}
            </el-button>
          </div>
          <el-dropdown
            v-if="showDropdown(child.buttons)"
            trigger="hover"
            @command="child.callback">
            <div class="table-column-dropdown">
              <i class="iconfont icon-gengduocaozuo"></i>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="opt in getDropdownOpts(child.buttons)"
                v-if="judgeOptBtnPerm(opt) && (data.hasOwnProperty('isBtnArr')?!data['isBtnArr'].includes(opt.type):true)"
                :key="opt.label"
                :class="opt.class"
                :command="{type: opt.value, data: data}">
                <i :class="opt.icon" class="font-size-second iconfont"></i>
                <span :class="opt.color">{{ opt.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-else :class="child.class" class="header6 font-weight-regular">
          <el-tooltip
            v-if="child.tooltip && data[child.key]"
            :open-delay="800"
            :visible-arrow="false"
            placement="top-start">
            <div slot="content">
              <span v-html="data[child.key] || '--'"></span>
            </div>
            <span :class="child.hover?'column-hover':''" v-html="data[child.key] || '--'"></span>
          </el-tooltip>
          <span v-else :class="child.hover?'column-hover':''" v-html="data[child.key] || '--'"></span>
        </div>
      </div>
      <EZColumn
        v-else
        :horizontal="child.horizontal"
        :children="child.children"
        :parent="child"
        :data="data"
      ></EZColumn>
    </div>
  </div>
</template>

<script>
  import {commonString} from '../../config/string';
  import {statusColorConfig, tableOptBtnConfig} from '../../config/common';
  import {permissionConfig} from '../../config/permission';
  import {judgePermission} from '../../utils';
  import {baseUrl} from '../../config/env';
  import TableCircle from './TableCircle.vue';

  export default {
    name: 'EZColumn',
    components: {TableCircle},
    props: {
      // 是否为水平布局
      horizontal: {
        type: Boolean,
        default: false
      },
      // 可能需要用到上一级的信息，以 parent 传递
      // 比如 label 的 width，需要作为 cell 的 max-width
      parent: {
        type: Object,
        default: () => {
          return {};
        }
      },
      // 子组件
      children: {
        type: Array,
        default: () => {
          return [];
        }
      },
      // table row 数据
      data: {
        type: Object,
        default: () => {
          return {};
        }
      },
      // 当前列是否可悬浮点击
      hover: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        commonString: commonString,
        fileBaseUrl: baseUrl
      };
    },
    methods: {
      // 列点击事件
      columnClick(key, data, hover) {
        if (!hover) return;
        this.$emit('listClickJump', key, data);
      },
      getIconClass(config = {}) {
        // region todo 原有样式处理代码
        // let colorType = this.data[config.colorKey], fontClass = '';
        // if (colorType) {
        //   fontClass = statusColorConfig[colorType].font
        // }
        // return `${config.class} ${fontClass || ''}`
        // endregion

        return `${config.class || 'font-size-main'} ${this.data[config.key] || ''}`;
      },
      getImage(images) {
        if (!images) return [];
        return Array.isArray(images) ? images : [images];
      },
      judgeOptBtnPerm(btn = {}) {
        const {perms = []} = btn;
        let hasPerm = false;
        perms.forEach(p => {
          if (judgePermission(p)) {
            hasPerm = true;
          }
        });
        return hasPerm;
      },
      getBtnClass(btn = {}) {
        const destBtn = this.getBtnInfo(btn);
        return destBtn.icon ? `iconfont font-size-main font-gray-90 cursor-default ${destBtn.class}` : `${destBtn.class}`;
      },
      getBtnInfo(btn = {}) {
        if (btn.options && btn.key) {
          const destBtn = btn.options.find(o => {
            if (!btn.reverse) {
              return o.value === this.data[btn.key];
            } else {
              return o.value !== this.data[btn.key];
            }
          });
          if (destBtn) {
            return {
              ...destBtn,
              perms: btn.perms
            };
          }
          return {};
        }
        return btn;
      },
      getBtnTitle(btn = {}) {
        const destBtn = this.getBtnInfo(btn);
        if (!__.isEmpty(destBtn)) {
          const type = destBtn.type;
          if (type && tableOptBtnConfig[type]) {
            return tableOptBtnConfig[type].label;
          } else {
            return '';
          }
        } else {
          return '';
        }
      },
      showDropdown(buttons = []) {
        let show = false;
        for (let i = 0; i < buttons.length; i++) {
          const btn = buttons[i];
          if (btn.dropdown && this.judgeOptBtnPerm(btn)) {
            show = true;
            break;
          }
        }
        return show;
      },
      getDropdownOpts(buttons = []) {
        const dropdownOpts = [];
        buttons.forEach(btn => {
          const destBtn = this.getBtnInfo(btn);
          if (btn.dropdown || destBtn.dropdown) {
            dropdownOpts.push({
              ...destBtn,
              label: this.getBtnTitle(destBtn),
              value: destBtn.type
            });
          }
        });
        return dropdownOpts;
      }
    }
  };
</script>

<style scoped lang="less">

  .table-column-container {
    display: inline-block;

    div {
      display: inline-block;
    }

    .table-column-content {
      vertical-align: middle;
    }
  }

  .hover-font-warning:hover {
    color: @colorWarning !important;
  }

  .hover-font-danger:hover {
    color: @colorDanger !important;
  }

  .hover-border-warning:hover {
    border-color: @colorWarning !important;
  }

  .hover-border-danger:hover {
    border-color: @colorDanger !important;
  }

  .column-hover:hover {
    cursor: pointer;
    text-decoration: underline;
  }

</style>
