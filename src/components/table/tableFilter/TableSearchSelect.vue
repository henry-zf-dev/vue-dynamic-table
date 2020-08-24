<template>
  <div class="table-search-select">
    <div
      v-for="(opt, idx) in options"
      :key="idx"
      class="search-opt-label"
      @click="change(opt)">
      <span>{{ opt.label }}: &nbsp;&nbsp;{{ inputText }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableSearchSelect',
  props: {
    searchResult: {
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
    inputText: {
      type: String,
      default: ''
    }
  },
  methods: {
    change(opt) {
      const exist = this.searchResult.find(sr => {
        return sr.key === opt.key;
      });
      if (!exist) {
        this.searchResult.push({
          key: opt.key,
          fieldType: 'input',
          label: opt.label,
          value: [this.inputText]
        });
      } else {
        const { value = [] } = exist;
        if (!value.includes(this.inputText)) {
          value.push(this.inputText);
        }
      }
      this.$emit('change');
    }
  }
};
</script>

<style scoped>

</style>
