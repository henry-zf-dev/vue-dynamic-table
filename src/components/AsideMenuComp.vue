<template>
  <div ref="asideMenuCompRef" class="aside-menu-comp">
    <div class="aside-menu-content pad-top-5">
      <el-tree
        :ref="asideMenuRef"
        :data="menuDataWithPerm"
        :default-expanded-keys="[currentMenuKey]"
        :current-node-key="currentMenuKey"
        :auto-expand-parent="true"
        :highlight-current="true"
        class="aside-menu-simple-tree"
        node-key="value"
        @node-click="clickNode">
        <span slot-scope="{node, data}" class="aside-menu-tree-node">
          <span :class="data.icon" class="aside-menu-tree-node-icon iconfont"></span>
          <span class="aside-menu-tree-node-label mar-lft-5">{{ data.label }}</span>
          <span v-if="data.badge" class="aside-menu-tree-node-badge">{{ data.badge }}</span>
          <span v-if="data.children" class="aside-menu-tree-more-icon">
            <i
              :class="[node.expanded ? 'collapse-icon-inactive' : 'collapse-icon-active']"
              class="iconfont icon-zujiantubiao-xinxijiegou-xiangxia"></i>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import { judgePermission } from '../utils';
import { permissionConfig } from '../config/permission';

const elementResizeDetectorMaker = require('element-resize-detector');

export default {
  name: 'AsideMenuComp',
  model: {
    event: 'change'
  },
  props: {
    menuData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    currentMenuKey: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      permConfig: permissionConfig,
      asideMenuRef: 'asideMenuRef',
      menuDataWithPerm: []
    };
  },
  watch: {
    currentMenuKey: {
      handler() {
        if (!this.$refs[this.asideMenuRef]) return;
        this.$refs[this.asideMenuRef].setCurrentKey(this.currentMenuKey);
      },
      immediate: true
    },
    menuData: {
      handler() {
        this.getMenuDataWithPerm();
      },
      immediate: true
    }
  },
  mounted() {
    const areaTreeComp = this.$refs['asideMenuCompRef'];
    if (!areaTreeComp) return;
    const erd = elementResizeDetectorMaker();
    erd.listenTo(areaTreeComp, (element) => {
      this.$emit('change', element.offsetWidth, element.offsetHeight);
    });
  },
  methods: {
    getMenuDataWithPerm() {
      this.menuDataWithPerm = [];
      this.menuData.forEach(menu => {
        const { perm = '', children = [] } = menu;
        const hasParentPerm = judgePermission(perm) || !perm;
        if (!children.length) {
          hasParentPerm && this.menuDataWithPerm.push(menu);
        } else {
          let hasChildrenPerm = false;
          const destChildren = [];
          children.forEach(child => {
            const { perm = '' } = child;
            if (judgePermission(perm) || !perm) {
              hasChildrenPerm = true;
              destChildren.push(child);
            }
          });
          hasChildrenPerm && this.menuDataWithPerm.push({
            ...menu,
            children: destChildren
          });
        }
      });
    },
    clickNode(nodeData) {
      if (!nodeData.value) return;
      this.$emit('asideMenuClick', nodeData.value);
    }
  }
};
</script>

<style scoped>

</style>
