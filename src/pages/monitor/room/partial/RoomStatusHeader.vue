<template>
  <div :class="scoreStatus.bgClass" class="room-status-header">
    <div class="room-score-content">
      <el-tooltip
        :open-delay="800"
        :content="scoreStatus.tooltip"
        :visible-arrow="false"
        placement="top-start">
        <div class="display-inline-block">
          <span :class="scoreStatus.fontClass" class="font-size-24">{{ roomInfo.score }}</span>
          <span class="room-score-label">分</span>
        </div>
      </el-tooltip>
    </div>
    <div v-if="systemStatus.subtitle" class="room-system-status mar-top-5 limited-text">
      <el-tooltip
        :open-delay="800"
        :content="systemStatus.subtitle"
        :visible-arrow="false"
        placement="top">
        <span>{{ systemStatus.subtitle }}</span>
      </el-tooltip>
    </div>
    <img :src="scoreStatus.img" class="room-score-img">
  </div>
</template>

<script>
  import {commonString} from '../../../../config/string';

  export default {
    name: 'RoomStatusHeader',
    props: {
      roomInfo: {
        type: Object,
        default: () => {
          return {};
        }
      }
    },
    computed: {
      scoreStatus() {
        const scoreStatus = {
          fontClass: '', bgClass: '', tooltip: '', img: ''
        };
        if (__.isEmpty(this.roomInfo) || this.roomInfo.score >= 85) {
          scoreStatus.fontClass = 'font-color-success';
          scoreStatus.tooltip = '房间各项功能正常，请继续保持';
          scoreStatus.bgClass = 'room-score-normal';
          scoreStatus.img = require('../../../../assets/img/room-health-normal.png');
        } else if (this.roomInfo.score >= 60 && this.roomInfo.score < 85) {
          scoreStatus.fontClass = 'font-color-warning';
          scoreStatus.tooltip = '当前系统状态较差，请立即处理当前告警！';
          scoreStatus.bgClass = 'room-score-warning';
          scoreStatus.img = require('../../../../assets/img/room-health-warning.png');
        } else {
          scoreStatus.fontClass = 'font-color-danger';
          scoreStatus.tooltip = '请火速处理当前告警，刻不容缓！';
          scoreStatus.bgClass = 'room-score-danger';
          scoreStatus.img = require('../../../../assets/img/room-health-danger.png');
        }
        return scoreStatus;
      },
      systemStatus() {
        return {
          title: commonString.systemStatus.inactive.label,
          subtitle: this.roomInfo.roomStatusContent || '',
          show: false
        };
      }
    }
  };
</script>

<style scoped lang="less">
  .room-status-header {
    position: relative;
    padding: @paddingMain @paddingMain @paddingMedium @paddingMain;
    border-radius: @borderRadiusSecond;

    .room-score-content {
      font-weight: bold;

      .room-score-label {
        color: @colorGray10;
        font-size: 22px;
      }
    }

    .room-system-status {
      font-size: @sizeSecond;
      color: @colorGray40;
    }

    .room-score-img {
      position: absolute;
      top: @paddingMedium;
      right: @paddingMedium;
    }
  }

  .room-score-normal {
    background: linear-gradient(180deg, @colorSuccessAlpha2 0%, @colorWhite 100%);
  }

  .room-score-warning {
    background: linear-gradient(180deg, @colorWarningAlpha2 0%, @colorWhite 100%);
  }

  .room-score-danger {
    background: linear-gradient(180deg, @colorDangerAlpha2 0%, @colorWhite 100%);
  }

</style>
