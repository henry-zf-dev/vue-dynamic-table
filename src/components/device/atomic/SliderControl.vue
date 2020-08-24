<template>
  <el-slider
    v-model="watchedModel"
    :min="min"
    :max="max"
    :marks="computedMarks"
    :show-tooltip="false"
    class="pad-lft pad-rgt"
    @change="sliderChanged"></el-slider>
</template>

<script>
import { deepCopyWithJson } from '../../../utils';

export default {
  name: 'SliderControl',
  props: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    marks: {
      type: Object,
      default: () => {
        return {};
      }
    },
    markColor: {
      type: String,
      default: '#666666'
    },
    model: {
      type: Number,
      default: 0
    },
    defaultParams: {
      type: Object,
      default: () => {
        return {};
      }
    },
    paramKey: {
      type: String,
      default: ''
    },
    expectKey: {
      type: String,
      default: ''
    },
    method: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      watchedModel: 0
    };
  },
  computed: {
    computedMarks() {
      const computedMarks = {};
      Object.keys(this.marks).forEach(key => {
        computedMarks[key] = {
          style: {
            color: this.markColor
          },
          label: this.marks[key]
        };
      });
      return computedMarks;
    }
  },
  watch: {
    model: {
      handler() {
        this.watchedModel = deepCopyWithJson(this.model);
      },
      immediate: true
    }
  },
  methods: {
    sliderChanged(value) {
      const ctrParam = {
        method: this.method,
        params: {
          ...this.defaultParams,
          [this.paramKey]: value
        }
      };
      const expParam = {
        method: this.method,
        paramKey: this.paramKey,
        expectKey: this.expectKey || this.paramKey,
        value: value
      };
      this.$emit('sliderChanged', ctrParam, expParam);
    }
  }
};
</script>

<style scoped lang="less">

</style>
