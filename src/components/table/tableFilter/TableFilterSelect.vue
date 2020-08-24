<template>
  <div class="table-filter-select">
    <el-select
      v-if="multiple"
      v-model="vModelMulti"
      :placeholder="`请选择${placeholder}`"
      :multiple="true"
      :collapse-tags="true"
      size="small"
      clearable
      @change="change">
      <el-option
        v-for="opt in options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value">
      </el-option>
    </el-select>
    <el-select
      v-else
      v-model="vModel"
      :placeholder="`请选择${placeholder}`"
      size="small"
      clearable
      @change="change">
      <el-option
        v-for="opt in options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value">
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  name: 'TableFilterSelect',
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
      default: true
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      vModel: '',
      vModelMulti: []
    };
  },
  watch: {
    value: {
      handler(val) {
        if (this.multiple) {
          this.vModelMulti = val || [];
        } else {
          if (val && val.length) {
            this.vModel = val[0];
          } else {
            this.vModel = '';
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    change(val) {
      if (val && val.length) {
        this.$emit('change', this.multiple ? val : [val]);
      } else {
        this.$emit('change', []);
      }
    }
  }
};
</script>

<style scoped>

</style>
