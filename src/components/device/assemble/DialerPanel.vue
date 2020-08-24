<template>
  <div class="dialer-panel-container">
    <div class="dialer-input-container">
      <div>
        <el-input
          ref="phoneNum"
          v-model="phoneNum"
          size="medium"
          clearable
          placeholder="请输入会议号码"
          class="dialer-input"
          @focus="phoneNumFocus"></el-input>
        <el-button type="info" size="medium" class="dialer-clear-btn" @click="clickClearBtn">
          <i class="iconfont icon-zujiantubiao-guanbi"></i>
        </el-button>
      </div>
      <div v-if="showPassword" class="mar-top-10">
        <el-input
          ref="password"
          v-model="password"
          size="medium"
          clearable
          placeholder="如需密码，请输入会议密码"
          @focus="passwordFocus"></el-input>
      </div>
    </div>
    <el-row class="ban-long-touch mar-top-20">
      <el-col
        v-for="(num, idx) in phoneNums"
        :span="8"
        :key="idx"
        class="text-align-center mar-btm">
        <div class="dialer-num-btn" @click="phoneNumClicked(num)">{{ num }}</div>
      </el-col>
    </el-row>
  </div>
</template>

<script>

export default {
  name: 'DialerPanel',
  props: {
    showPassword: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      phoneNum: '',
      phoneNums: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'],
      password: '',
      focusInput: 'phoneNum'
    };
  },
  watch: {
    phoneNum() {
      this.$emit('phoneNumChanged', this.phoneNum);
    },
    password() {
      this.$emit('passwordChanged', this.password);
    }
  },
  mounted() {
    this.$refs['phoneNum'].focus();
  },
  methods: {
    phoneNumFocus() {
      this.focusInput = 'phoneNum';
    },
    passwordFocus() {
      this.focusInput = 'password';
    },
    // 输入手机号码
    phoneNumClicked(num) {
      switch (this.focusInput) {
        case 'phoneNum':
          this.phoneNum = this.phoneNum + num;
          break;
        case 'password':
          this.password = this.password + num;
          break;
        default:
          break;
      }
    },
    // 清除拨号
    clickClearBtn() {
      if (!this.phoneNum) return;
      this.phoneNum = this.phoneNum.substring(0, this.phoneNum.length - 1);
    }
  }
};
</script>

<style scoped lang="less">

</style>
