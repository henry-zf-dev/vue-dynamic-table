<template>
  <el-form :label-width="`${labelWidth}px`" class="page-operation-form">
    <el-form-item v-for="item in formItemData" :key="item.id" :label="item.name">
      <div v-if="item.dataType===customFieldType[0].value">
        <el-input
          v-if="!item.symbols||!item.symbols.length"
          v-model="formModel[item.mark]"
          type="text"></el-input>
        <el-select
          v-else
          v-model="formModel[item.mark]"
          :multiple="item.multiple"
          placeholder="请选择">
          <el-option
            v-for="items in item.symbols"
            :key="items"
            :label="items"
            :value="items">
          </el-option>
        </el-select>
      </div>
      <div v-if="item.dataType===customFieldType[1].value">
        <el-input-number v-model="formModel[item.mark]" class="inputNumber" controls-position="right"></el-input-number>
      </div>
      <div v-if="item.dataType===customFieldType[2].value">
        <el-radio-group v-model="formModel[item.mark]">
          <el-radio label="true">是</el-radio>
          <el-radio label="false">否</el-radio>
        </el-radio-group>
      </div>
    </el-form-item>
  </el-form>
</template>

<script>
import { commonConfig } from '../config/common';

export default {
  name: 'ExtentForm',
  props: {
    formItemData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    formModel: {
      type: Object,
      default: () => {
        return {};
      }
    },
    labelWidth: {
      type: Number,
      default: 100
    }
  },
  data() {
    return {
      customFieldType: []
    };
  },
  created() {
    this.customFieldType = commonConfig.customFieldType;
  }
};
</script>

<style scoped>
  .inputNumber {
    width: 380px
  }
</style>
