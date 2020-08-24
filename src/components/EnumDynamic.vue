<template>
  <div>
    <el-button
      type="primary"
      size="small"
      @click="addEnum">添加枚举
    </el-button>
    <div v-for="(dynamic, idx) in dynamicData" :key="idx" class="mar-top-5">
      <el-row>
        <el-col :span="21" class="pad-rgt-10">
          <el-input
            v-model="dynamic.value"
            class="mar-rgt-5"
            size="medium"
            placeholder="请填写枚举值"></el-input>
            <!--          <el-input-number v-if="dataType === commConfig.customFieldType[1].value" class="width-100 mar-rgt-5" size="medium"-->
            <!--                    v-model="dynamic.value" controls-position="right" placeholder="请填写枚举值"></el-input-number>-->
            <!--          <el-radio-group v-if="dataType === commConfig.customFieldType[2].value" v-model="dynamic.value">-->
            <!--            <el-radio label="是"></el-radio>-->
            <!--            <el-radio label="否"></el-radio>-->
            <!--          </el-radio-group>-->
        </el-col>
        <el-col :span="3">
          <el-button
            type="danger"
            size="medium"
            icon="el-icon-delete"
            circle
            @click="deleteEnum(idx)"></el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { commonConfig } from '../config/common';

export default {
  name: 'EnumDynamic',
  props: {
    dataType: {
      type: String,
      default: ''
    },
    dynamicData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      commConfig: commonConfig
    };
  },
  methods: {
    addEnum() {
      this.$emit('enumDynamicChanged', 'add');
    },
    deleteEnum(idx) {
      this.$emit('enumDynamicChanged', 'delete', idx);
    }
  }
};
</script>

<style scoped>

</style>
