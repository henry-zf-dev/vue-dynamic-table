<template>
  <div
    :style="{
      minHeight: `${minHeight}px`,
      boxShadow: showBorder ? '0 0 0 2px #F5F5F5 inset' : 'none'
    }"
    class="empty-content-container">
    <div class="empty-content-content">
      <img
        v-show="!hideImage"
        :style="{width: `${imageSize}px`, height: `${imageSize}px`}"
        src="../assets/img/empty-state.png"
        class="mar-btm-20">
      <div class="content-empty-text">{{ emptyText }}</div>
      <div v-if="optData.length > 0" class="mar-top-20">
        <div v-for="(opt, idx) in optData" :key="idx" class="display-inline-block">
          <el-button
            v-if="opt.type === 'btn'"
            :class="opt.icon"
            class="iconfont mar-lft-5 mar-rgt-5"
            size="medium"
            type="info"
            @click="opt.callback">
            <span class="mar-lft-10">{{ opt.label }}</span>
          </el-button>
          <el-dropdown
            v-if="opt.type === 'dropdown'"
            @command="opt.callback">
            <el-button
              :class="opt.icon"
              class="iconfont mar-lft-5 mar-rgt-5"
              size="medium"
              type="info">
              <span class="mar-lft-10">{{ opt.label }}</span>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(item, idx) in opt.items"
                :key="idx"
                :class="item.icon"
                :command="item.command"
                class="iconfont">
                <span class="mar-lft-10">{{ item.label }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'EmptyContent',
    props: {
      minHeight: {
        type: Number,
        default: 600
      },
      hideImage: {
        type: Boolean,
        default: false
      },
      imageSize: {
        type: Number,
        default: 200
      },
      emptyText: {
        type: String,
        default: '暂无数据'
      },
      showBorder: {
        type: Boolean,
        default: false
      },
      optData: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    data() {
      return {};
    },
    methods: {

    }
  };
</script>

<style scoped lang="less">

  .empty-content-container {
    text-align: center;
    border-radius: @borderRadiusSecond;
    width: 100%;
    display: table;

    .empty-content-content {
      display: table-cell;
      vertical-align: middle;

      .content-empty-text {
        font-size: @sizeMain;
        font-weight: bold;
        color: @colorGray70;
        text-align: center;
      }

      .el-dropdown-menu {
        width: 200px;
      }

      .content-empty-btn {
        font-size: @sizeMain;
        font-weight: bold;
        border-radius: @borderRadiusMain;
        height: 48px;
        width: 200px;
      }
    }
  }

</style>
