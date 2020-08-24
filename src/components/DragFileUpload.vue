<template>
  <el-upload
    :ref="fileUploadRef"
    :disabled="disabled"
    :name="name"
    :class="className"
    :accept="accept"
    :limit="limit"
    :drag="drag"
    :list-type="listType"
    :file-list="destFileList || []"
    :action="actionUrl"
    :headers="reqHeaders"
    :data="reqData"
    :auto-upload="autoUpload"
    :before-upload="beforeUpload"
    :on-preview="onPreview"
    :on-exceed="onExceed"
    :on-remove="onRemove"
    :on-success="onSuccess">
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <div slot="tip" class="el-upload__tip text-align-center">{{ upLoadTitle }}</div>
  </el-upload>
</template>

<script>
import { baseUrl } from '../config/env';
import { getUserInfo } from '../utils';
import { fileUploadApi } from '../config/common';

export default {
  name: 'DragFileUpload',
  props: {
    className: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: 'file'
    },
    // 可接受的文件类型
    accept: {
      type: String,
      default: ''
    },
    fileUploadRef: {
      type: String,
      default: 'fileUploadRef'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    autoUpload: {
      type: Boolean,
      default: true
    },
    // 是否允许一次选多个文件（暂时不允许）
    // multiple: {
    //   type: Boolean,
    //   default: false
    // },
    drag: {
      type: Boolean,
      default: true
    },
    listType: {
      type: String,
      default: 'text'
    },
    // 允许上传的文件数量限制
    limit: {
      type: Number,
      default: null
    },
    // 允许上传的单个文件的大小限制，单位为MB
    sizeLimit: {
      type: Number,
      default: 10
    },
    upLoadTitle: {
      type: String,
      default: ''
    },
    // 请求接口的额外data设置
    reqData: {
      type: Object,
      default: () => {
        return { index: 0 };
      }
    },
    actionUrl: {
      type: String,
      default: fileUploadApi.fileInfo
    },
    fileList: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      // 请求接口的额外header设置
      reqHeaders: {
        token: getUserInfo().token
      }
    };
  },
  computed: {
    destFileList() {
      return this.fileList.map(file => {
        return {
          ...file,
          url: `${baseUrl}${file.url}`
        };
      });
    }
  },
  methods: {
    onPreview(file) {
      window.open(`${file.url}`, '_blank');
    },
    onExceed() {
      this.$notify({
        message: `只能上传 ${this.limit} 个文件！`,
        type: 'warning',
        duration: 3000
      });
    },
    // 用于父组件触发文件上传
    uploadSubmit() {
      this.$refs[this.fileUploadRef].submit();
    },
    beforeUpload(file) {
      // todo 头像上传，accept 字段无效，需要自行判断文件类型是否正确 Henry 2020-07-13 11:24:46
      if (file.size / 1024.00 / 1024.00 > this.sizeLimit) {
        this.$message.error(`单个文件大小不超过${this.sizeLimit}MB!`);
        return false;
      }
    },
    onRemove(file, fileList) {
      const idx = __.pluck(this.fileList, 'id').indexOf(file.id);
      if (~idx) {
        this.fileList.splice(idx, 1);
      }
      this.$emit('fileRemove', file, fileList);
    },
    onSuccess(rsp, file, fileList) {
      if (rsp.code === 0) {
        const { url, id } = rsp.data || {};
        this.fileList.push({ name: file.name, url: url, id: id });
      } else {
        this.$message({ message: rsp.message, type: 'error' });
      }
      this.$emit('fileUploadSuccess', rsp, file, fileList);
    }
  }
};
</script>

<style scoped>

</style>
