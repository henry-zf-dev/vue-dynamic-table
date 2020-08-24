<template>
  <el-select
    :placeholder="placer"
    :class="className"
    :multiple="multiple"
    v-model="searchInfo.roomType"
    @change="roomTypeChange">
    <el-option v-if="isAll" value="">不限类型</el-option>
    <el-option v-for="item in roomTypeData" :key="item.id" :value="item.name" :label="item.name">
    </el-option>
  </el-select>
</template>

<script>
import { checkRespCorrect, messageHandle } from '../utils';
import { msgCode, msgContent } from '../config/string';

export default {
  name: 'RoomTypeSelect',
  props: {
    searchInfo: {
      type: Object,
      default: () => {
        return {
          roomType: ''
        };
      }
    },
    placer: {
      type: String,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    },
    isAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      roomTypeData: []
    };
  },
  created() {
    this.roomTypeList();
  },
  methods: {
    roomTypeChange() {
      if (this.isAll) {
        this.$emit('roomTypeChange');
      }
    },
    roomTypeList() { // 查询列表
      API.setting.roomTypeList({
        pageNo: 0,
        pageSize: 0
      }).then(resp => {
        if (checkRespCorrect(resp)) {
          this.roomTypeData = (resp.data.items || []).map(function(item) {
            return {
              ...item
            };
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    }
  }
};
</script>

<style scoped>

</style>
