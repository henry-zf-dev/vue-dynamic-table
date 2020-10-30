<template>
  <transition name="el-notification-fade">
    <div
      v-show="visible"
      :style="{top: top, right: `${positionRight}px`}"
      :class="shakeClass"
      class="custom-notify-container"
      @mouseenter="mouseenter"
      @mouseleave="mouseleave">
      <div v-if="type === 'alarmTrigger'">
        <div class="alarm-notify-container">
          <i class="el-icon-warning alarm-type-icon font-color-warning"></i>
          <div class="alarm-notify-content">
            <div class="alarm-notify-title">
              <span @click="clickTitle">{{ data.title }}</span>
            </div>
            <div class="alarm-notify-title">
              <span @click="clickSubtitle">{{ data.subtitle }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="type === 'alarmRestore'">
        <div class="alarm-notify-container">
          <i class="el-icon-success alarm-type-icon font-color-success"></i>
          <div class="alarm-notify-content">
            <div class="alarm-notify-title">
              <span @click="clickTitle">{{ data.title }}</span>
            </div>
            <div class="alarm-notify-title">
              <span @click="clickSubtitle">{{ data.subtitle }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="default-notify-container">
          <i :class="notifyTypeIconClass" class="notify-type-icon"></i>
          <span class="notify-message">{{ message }}</span>
        </div>
      </div>
      <i class="notify-close-icon iconfont icon-zujiantubiao-guanbi" @click.stop="close"></i>
    </div>
  </transition>
</template>

<script>

  export default {
    name: 'CustomNotify',
    data() {
      return {
        visible: false,
        type: '',
        message: '',
        positionRight: -350,
        positionTop: 16,
        duration: 3500,
        shake: false,
        hover: false,
        closed: false,
        onclose: () => {},
        timer: null,
        data: {
          title: '',
          subtitle: '',
          titleCallback: null,
          subtitleCallback: null,
          extra: {
            roomId: ''
          }
        }
      };
    },
    computed: {
      top() {
        return `${this.positionTop}px`;
      },
      notifyTypeIconClass() {
        switch (this.type) {
          case 'success':
            return 'el-icon-success font-color-success';
          case 'info':
            return 'el-icon-info font-color-info';
          case 'warning':
            return 'el-icon-warning font-color-warning';
          case 'error':
            return 'el-icon-error font-color-danger';
          default:
            return 'el-icon-success font-color-success';
        }
      },
      shakeClass() {
        return this.shake && !this.hover ? 'animate__animated animate__headShake animate__infinite' : '';
      }
    },
    mounted() {
      setTimeout(() => {
        this.positionRight = 16;
      }, 100);
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          this.close();
        }, this.duration);
      }
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy() {
      this.clearTimer();
      document.removeEventListener('keydown', this.keydown);
    },
    methods: {
      clearTimer() {
        clearTimeout(this.timer);
      },
      startTimer() {
        if (this.duration > 0) {
          this.timer = setTimeout(() => {
            this.close();
          }, this.duration);
        }
      },
      mouseenter() {
        this.hover = true;
        this.clearTimer();
      },
      mouseleave() {
        this.hover = false;
        this.startTimer();
      },
      close() {
        if (this.closed) return;
        this.closed = true;
        this.visible = false;
        this.onclose();
        this.$el.addEventListener('transitionend', this.destroyElement);
      },
      destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      keydown(e) {
        // ESC 关闭消息
        if (e.which === 27) {
          this.close();
        }
      },
      clickTitle() {
        if (typeof this.data.titleCallback === 'function') {
          this.data.titleCallback();
        }
      },
      clickSubtitle() {
        if (typeof this.data.subtitleCallback === 'function') {
          this.data.subtitleCallback();
        }
      }
    }
  };
</script>

<style scoped lang="less">

  .custom-notify-container {
    position: fixed;
    box-sizing: border-box;
    padding: @paddingMedium @paddingMain;
    background: @colorWhite;
    box-shadow: 0 2px 12px 0 @colorBlackAlpha1;
    border: 1px solid @colorGray90;
    border-radius: @borderRadiusLarge;
    transition: opacity .3s, transform .3s, top .3s, right .3s;
    -webkit-transition: opacity .3s, transform .3s, top .3s, right .3s;
    -moz-transition: opacity .3s, transform .3s, top .3s, right .3s;
    -o-transition: opacity .3s, transform .3s, top .3s, right .3s;
    width: 330px;
    z-index: 2000;
  }

  .default-notify-container {
    .notify-type-icon {
      font-size: 24px;
      position: absolute;
      top: 14px;
      left: @paddingMedium;
    }
    .notify-message {
      font-size: @sizeMain;
      color: @colorGray40;
      margin-left: @paddingMain;
    }
  }

  .alarm-notify-container {

    .alarm-type-icon {
      position: absolute;
      top: 15px;
      left: 15px;
      font-size: 25px;
    }

    .alarm-notify-content {
      padding: 5px 5px 0 25px;

      .alarm-notify-title {
        font-size: @sizeMain;
        cursor: pointer;
        text-decoration: underline;
        color: @colorGray40;
      }

      .alarm-notify-title:hover {
        color: @colorPrimary;
      }
    }
  }

  .remote-call-container {
    .remote-call-title {
      font-size: @sizeRegular;
      font-weight: bold;
      color: @colorGray10;
    }

    .remote-call-subtitle {
      font-size: @sizeSecond;
      color: @colorGray40;
      margin-top: 5px;
    }

    .remote-call-opt-container {
      margin-top: 10px;

      .remote-call-opt-btn {
        height: 30px;
        width: 40px;
        border-radius: 50%;
        padding-top: 10px;
        background: @colorSuccess;
        text-align: center;
        color: @colorWhite;
        display: inline-block;
        cursor: pointer;

        i {
          font-size: 20px;
        }
      }

      .remote-call-connect-btn {
        color: @colorWhite;
        margin-right: 15px;
      }

      .remote-call-connect-btn:hover {
        background: #19B373;
      }

      .remote-call-hangup-btn {
        background: @colorDanger;
      }

      .remote-call-hangup-btn:hover {
        background: #E34836;
      }
    }

    .remote-call-detail-btn {
      position: absolute;
      right: 20px;
      bottom: 12px;
      border-radius: 20px;
      background: @colorGray96;
      font-size: @sizeMain;
      color: @colorGray40;
      text-align: center;
      cursor: pointer;
      padding: 10px 16px;
    }

    .remote-call-detail-btn:hover {
      background: @colorGray90;
    }

  }

  .notify-close-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    color: @colorGray70;
    font-size: @sizeSecond;
    cursor: pointer;
  }

  .notify-close-icon:hover {
    color: @colorPrimary;
    font-size: @sizeMain;
  }

</style>
