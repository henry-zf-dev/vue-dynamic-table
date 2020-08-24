<template>
  <div class="table-filter-number pad-rgt-10">
    <el-input-number
      v-model="begin"
      :min="0"
      size="small"
      controls-position="right"
      @change="change"></el-input-number>
    <span class="font-gray-40 font-size-14">&nbsp;至&nbsp;</span>
    <el-input-number
      v-model="end"
      :min="0"
      size="small"
      controls-position="right"
      @change="change"></el-input-number>
  </div>
</template>

<script>
export default {
  name: 'TableFilterNumber',
  model: {
    event: 'change'
  },
  props: {
    value: {
      type: Object,
      default: () => {
        return {
          begin: '',
          end: ''
        };
      }
    }
  },
  data() {
    return {
      begin: 0,
      end: 0
    };
  },
  watch: {
    value(val) {
      this.begin = val.begin;
      this.end = val.end;
    }
  },
  methods: {
    clear() {
      this.$emit('change', {
        begin: 0,
        end: 0
      });
    },
    change() {
      this.$emit('change', {
        begin: this.begin,
        end: this.end
      });
    }
  }
};
</script>

<style scoped>

</style>
