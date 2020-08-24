<template>
  <div class="multiple-selector-component">
    <div v-if="title" class="header6 font-weight-regular mar-btm">选择{{ title }}
      <span v-if="!showRequired" class="font-gray-70">（非必填）</span>
    </div>
    <el-input
      v-if="showSearch"
      v-model="searchText"
      :placeholder="`搜索${title}名称`"
      size="medium"
      prefix-icon="el-icon-search"
      class="width-100 mar-btm">
    </el-input>
    <el-tree
      :ref="id"
      :default-expanded-keys="expandedKey"
      :data="treeData"
      :filter-node-method="filterNode"
      :props="treeProp"
      style="max-height: 350px; overflow: auto"
      show-checkbox
      node-key="id"
      highlight-current
      @check="nodeChecked">
      <span slot-scope="{node, data}">
        <el-tooltip :content="node.label" :open-delay="800" placement="top-start">
          <div slot="content">
            <span>{{ node.label }}</span>
          </div>
          <span class="el-tree-node__label">{{ node.label }}</span>
        </el-tooltip>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { assembleTreeFromArray } from '../utils';

export default {
  name: 'MultipleSelector',
  props: {
    id: {
      type: String,
      default: 'multipleSelect'
    },
    // 标志 srcData 结构需要转换为树形结构
    isTree: {
      type: Boolean,
      default: false
    },
    treeProp: {
      type: Object,
      default: () => {
        return {
          label: 'name'
        };
      }
    },
    treeNodeKey: {
      type: String,
      default: 'id'
    },
    expandedKey: {
      type: Array,
      default: () => {
        return ['root'];
      }
    },
    showSearch: {
      type: Boolean,
      default: false
    },
    showRequired: {
      type: Boolean,
      default: false
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    unit: {
      type: String,
      default: '个'
    },
    // 选择后是否只返回叶子节点
    checkLeafOnly: {
      type: Boolean,
      default: false
    },
    srcData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    selectData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      searchText: ''
    };
  },
  computed: {
    treeData() {
      if (this.srcData.length) {
        return [
          {
            [this.treeProp.label]: `请选择（共${this.srcData.length}${this.unit}${this.title}）`,
            id: 'root',
            children: this.isTree ? assembleTreeFromArray({ srcData: this.srcData }) : this.srcData
          }
        ];
      } else {
        return [];
      }
    }
  },
  watch: {
    selectData() {
      this.setTreeCheckedNode();
    },
    searchText(val) {
      this.$refs[this.id].filter(val);
    }
  },
  mounted() {
    this.setTreeCheckedNode();
  },
  updated() {
    // 相关依赖数据源(srcData、selectData)于发送变化后，主动设置 checkedNode
    this.setTreeCheckedNode();
  },
  methods: {
    // 为了解决全选、半选的问题，根据已选的节点数据，手动设置 tree checkedNode
    setTreeCheckedNode() {
      const tree = this.$refs[this.id];
      if (tree) {
        // 先清空所有勾选项
        tree.setCheckedKeys([]);
        const selectData = this.isTree ? __.pluck(this.selectData, 'id') : this.selectData;
        const checkedKeys = [];
        selectData.forEach(key => {
          const node = tree.getNode(key);
          if (node && node.isLeaf) {
            checkedKeys.push(key);
          }
        });
        tree.setCheckedKeys(checkedKeys, true);
      }
    },
    filterNode(value, data) {
      if (!value) return true;
      return data[this.treeProp.label].indexOf(value) !== -1;
    },
    nodeChecked(node, detail) {
      const { checkedNodes = [], halfCheckedNodes = [] } = detail;
      const nodes = __.union(checkedNodes, halfCheckedNodes);
      this.selectData.length = 0;
      if (this.isTree) {
        nodes.forEach(n => {
          n.id !== 'root' && (this.selectData.push(n));
        });
      } else {
        if (!this.checkLeafOnly) {
          nodes.forEach(n => {
            n.id !== 'root' && (this.selectData.push(n.id));
          });
        } else {
          const tree = this.$refs[this.id];
          nodes.forEach(n => {
            const node = tree.getNode(n.id);
            if (n.id !== 'root' && node && node.isLeaf) {
              this.selectData.push(n.id);
            }
          });
        }
      }
      // todo 用于父级组件做特殊处理,如二次确认
      this.$emit('selectChange', node);
    }
  }
};
</script>

<style lang="less">
  .multiple-selector-component {

    .el-tree-node__content {
      height: 40px;
      border-radius: 8px;

      label.el-checkbox {
        margin-left: 20px;
        margin-right: 0 !important;
      }

      .el-tree-node__label {
        margin-left: @paddingMain;
        font-size: @sizeMain;
        color: @colorGray10;
      }

      .el-tree-node__expand-icon {
        position: absolute;
        right: 10px;
        font-size: 15px;
      }
    }

    .el-tree-node__content:hover {
      background: @colorBgWhite !important;
    }

  }

</style>
