<template>
  <div
    :class="computedClass"
    :style="{background: computedColor, height: `${size}px`, width: `${size}px`, lineHeight: `${size}px`}"
    class="table-circle">
    {{ trimmedTitle }}
  </div>
</template>

<script>
import { statusColorConfig } from '../../config/common';

export default {
  name: 'TableCircle',
  props: {
    size: {
      type: Number,
      default: 12
    },
    type: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    trim: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    trimmedTitle() {
      return this.trim ? (this.title || '').substring(0, 1).toUpperCase() || '' : this.title;
    },
    computedClass() {
      if (this.color) return this.color;
      if (this.type && statusColorConfig[this.type]) return statusColorConfig[this.type].bg;
      return '';
    },
    computedColor() {
      if (this.color || this.type) return '';
      const random = Math.floor(Math.random() * 9);
      // 在固定的颜色里面随机
      const color = [
        'rgba(75,211,171,1)', 'rgba(85,138,239,1)', 'rgba(68,216,160,1)',
        'rgba(75,211,200,1)', 'rgba(99,115,230,1)', 'rgba(145,207,21,1)',
        'rgba(78,180,223,1)', 'rgba(75,211,191,1)', 'rgba(116,140,232,1)'
      ];
      return color[random];
    }
  }
};
</script>

<style scoped lang="less">

  .table-circle {
    display: inline-block;
    text-align: center;
    border-radius: 50%;
    font-size: @sizeMain;
    font-weight: bold;
    color: @colorWhite;
  }

</style>
