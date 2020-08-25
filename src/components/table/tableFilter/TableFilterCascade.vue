<template>
  <el-cascader
    v-model="vModel"
    :options="cascadedOptions"
    :props="{multiple: multiple, checkStrictly: true}"
    size="small"
    clearable
    collapse-tags
    popper-class="table-filter-cascade"
    @change="change"></el-cascader>
</template>

<script>
import { commonString } from '../../../config/string';
import { assembleTreeFromArray } from '../../../utils';

export default {
  name: 'TableFilterCascade',
  model: {
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default: () => {
        return [];
      }
    },
    options: {
      type: Array,
      default: () => {
        return [];
      }
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cascadedOptions: [],
      vModel: []
    };
  },
  watch: {
    value: {
      handler(val) {
        const path = _.pluck(val, 'path') || [];
        if (this.multiple) {
          this.vModel = path;
        } else {
          this.vModel = path[0] || [];
        }
      },
      immediate: true
    }
  },
  created() {
    this.initOptions();
  },
  methods: {
    initOptions() {
      this.cascadedOptions = assembleTreeFromArray({ srcData: this.options, filter: true });
    },
    change(value) {
      let srcValue = [];
      const destValue = [];
      if (this.multiple) {
        // 子层的优先级高于父层，所以如果选了子层，那么需要将父层过滤掉
        const judgeContain = (src = []) => {
          let contain = false;
          for (let i = 0; i < value.length; i++) {
            if (value[i].length > src.length &&
                src.every(val => value[i].includes(val))) {
              contain = true;
              break;
            }
          }
          return contain;
        };
        value.forEach(v => {
          !judgeContain(v) && (srcValue.push(v));
        });
      } else {
        value.length && (srcValue = [value]);
      }
      const getOptByVal = (val) => {
        return this.options.find(opt => {
          return opt.value === val;
        });
      };
      srcValue.forEach(val => {
        const fullPath = [];
        val.forEach(v => {
          const opt = getOptByVal(v);
          opt && (fullPath.push(opt.label || commonString.unknown));
        });
        const last = _.last(val);
        last && (destValue.push({
          value: last,
          path: val,
          pathStr: fullPath.join('/')
        }));
      });
      this.$emit('change', destValue);
    }
  }
};
</script>

<style scoped>

</style>
