<template>
  <div class="table-filter-datetime pad-rgt-10">
    <el-date-picker
      v-model="value2"
      :type="type"
      :format="format"
      :value-format="valueFormat"
      :picker-options="pickerOptions"
      size="small"
      range-separator="至"
      start-placeholder="开始时间"
      end-placeholder="结束时间"
      @change="change">
    </el-date-picker>
  </div>
</template>

<script>
export default {
  name: 'TableFilterDatetime',
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
    },
    type: {
      type: String,
      default: 'datetimerange'
    },
    format: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    },
    valueFormat: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    }
  },
  data() {
    return {
      value2: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }
        ]
      }
    };
  },
  watch: {
    value: {
      handler(val) {
        this.value2 = [val.begin, val.end];
      },
      immediate: true
    }
  },
  methods: {
    change(val) {
      if (val) {
        this.$emit('change', { begin: this.value2[0], end: this.value2[1] });
      } else {
        this.$emit('change', { begin: '', end: '' });
      }
    },
    clear() {
      this.$emit('change', { begin: '', end: '' });
    }
  }
};
</script>

<style scoped>

</style>
