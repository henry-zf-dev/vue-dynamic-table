<template>
  <div class="login-page">
    <div class="login-page-bg"></div>
    <div v-if="!isSSO">
      <div class="login-container">
        <el-row v-loading="fullscreenLoading">
          <el-col :span="8">
            <img
              v-if="tenant === tenantConfig.EZPRO"
              class="login-page-logo-image"
              src="../assets/img/login-left-green.png">
            <img
              v-if="tenant === tenantConfig.OPPO"
              class="login-page-logo-image"
              src="../assets/img/login-back-left.png">
          </el-col>
          <el-col :span="16" style="padding: 80px 100px;">
            <div class="header1">登录</div>
            <div class="mar-top-30">
              <div>
                <el-input
                  v-if="isLogin"
                  v-model="loginData.userNameInput"
                  class="width-100"
                  placeholder="用户名/手机号码"
                  @focus="userNameFocus=true"
                  @blur="userNameFocus===false"
                  @keyup.enter.native="clickLoginEnter"></el-input>
                <el-row v-else>
                  <el-col :span="16">
                    <el-input
                      v-model="loginData.userNameInput"
                      class="width-100"
                      placeholder="手机号码"
                      @focus="userNameFocus=true"
                      @blur="userNameFocus===false"
                      @keyup.enter.native="clickLoginEnter"></el-input>
                  </el-col>
                  <el-col :span="8" class="text-align-center">
                    <el-button
                      v-if="!isLogin"
                      :loading="codeLoading"
                      type="text"
                      @click="getVerifyCode">
                      {{ verifyName }}
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              <div class="mar-top-10 mar-btm-10">
                <el-input
                  v-if="isLogin"
                  v-model="loginData.pswInput"
                  type="password"
                  placeholder="密码"
                  class="width-100"
                  show-password
                  @focus="passwordFocus===true"
                  @blur="passwordFocus===false"
                  @keyup.enter.native="clickLoginEnter"></el-input>
                <el-input
                  v-else
                  v-model="loginData.verifyCode"
                  type="password"
                  placeholder="验证码"
                  class="width-100"
                  @focus="passwordFocus===true"
                  @blur="passwordFocus===false"
                  @keyup.enter="clickLogin"></el-input>
              </div>
              <el-divider></el-divider>
              <div class="mar-top">
                <el-row>
                  <el-col :span="16">
                    <el-input
                      v-model="captchaFromCode"
                      class="width-100"
                      placeholder="图片验证码"
                      @focus="userNameFocus=true"
                      @blur="userNameFocus===false"
                      @keyup.enter.native="clickLoginEnter"></el-input>
                  </el-col>
                  <el-col :span="8">
                    <img
                      v-if="captchaCode"
                      :src="captchaCode"
                      style="height: 40px;"
                      class="cursor-pointer width-100 color-gray-96"
                      @click="switchCaptcha">
                  </el-col>
                </el-row>
              </div>
              <div v-show="false" class="mar-top">
                <el-checkbox v-if="isLogin" v-model="rememberPassword" class="mar-top-10" @change="sessionPassword">
                  记住密码
                </el-checkbox>
              </div>
            </div>
            <el-button type="primary" class="login-button" @click="clickLogin">登录</el-button>
            <!--<div class="text-align-center mar-top-20">-->
            <!--<span class="header7 font-gray-70">其他登录方式：</span>-->
            <!--<span class="mar-lft header7 font-gray-70 cursor-pointer"-->
            <!--:class="isLogin ? 'iconfont icon-duanxinyanzhengma' : 'iconfont icon-zhanghaodenglu'"-->
            <!--@click="otherLogin">-->
            <!--{{isTitle}}-->
            <!--</span>-->
            <!--</div>-->
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-else class="header4 font-gray-70 pad-all-20">认证授权中......</div>
  </div>
</template>

<script>
import { tenant } from '../config/env';
import { tenantConfig } from '../config/common';
import { checkRespCorrect, messageHandle } from '../utils';
import { rulesTel } from '../utils/validate';
import { msgCode, msgContent } from '../config/string';
import { StorageKey, setStorage } from '../config/sessions';
import { routerMeta } from '../router/routerMeta';
import { commonString } from '../config/string';
import { assembleRouterPermission, handleDefaultRoute } from '../modules/routePermHdl';

export default {
  name: 'Login',
  data() {
    return {
      tenant: tenant,
      tenantConfig: tenantConfig,
      isSSO: true,
      loginData: {
        userNameInput: '',
        pswInput: '',
        verifyCode: ''
      },
      fullscreenLoading: false,
      verifyName: '获取验证码',
      userNameFocus: false,
      passwordFocus: false,
      rememberPassword: false,
      isLogin: true,
      codeLoading: false,
      isTitle: '短信验证码登录',
      captchaCode: '', // 用来存放图片验证码
      captchaFromCode: '', // 输入图片验证码的地方，用来对比存放图片验证码
      captchaKey: ''
    };
  },
  watch: {
    isLogin() {
      this.isTitle = this.isLogin ? '短信验证码登录' : '账号密码登录';
    }
  },
  mounted() {
    this.captchaCode = '';
  },
  created() {
    // 清空 BodyAdmin 的 ws 断连提示 Henry 2020-03-24 14:25:05
    this.$store.commit('updateWsReconnecting', false);

    const { token = '' } = this.$route.query || {};
    if (!token) {
      this.isSSO = false;
      this.getImgCaptcha();
      // this.loginData.userNameInput = getCookie(cookieKey.userName);
      // this.loginData.pswInput = getCookie(cookieKey.password);
      if (this.loginData.userNameInput || this.loginData.pswInput) {
        this.rememberPassword = true;
      }
    } else {
      console.log('##### sso token #####', token);
      this.isSSO = true;
      this.loginWithSsoToken(token);
    }
  },
  methods: {
    // 获取图片验证码
    getImgCaptcha() {
      API.user.imgCaptcha().then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.captchaCode = data.captchaImg || '';
          this.captchaKey = data.captchaKey || '';
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.SYSTEM });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    switchCaptcha() {
      this.getImgCaptcha();
    },
    sessionPassword() { // 记住账号密码
      if (this.rememberPassword) {
        // setCookie(cookieKey.userName, this.loginData.userNameInput);
        // setCookie(cookieKey.password, this.loginData.pswInput);
      } else {
        // clearCookie();
      }
    },
    getVerifyCode() { // 发送验证码
      if (!this.loginData.userNameInput.length) {
        this.$notify({
          message: '请输入手机号码！',
          type: 'warning',
          duration: 1500
        });
        return;
      }
      // 验证手机格式
      if (!rulesTel(this.loginData.userNameInput)) {
        this.$message.warning('请输入正确的手机号码');
        return;
      }
      if (!this.captchaFromCode) {
        this.$notify({
          message: '图片验证码不能为空，请输入！',
          type: 'warning',
          duration: 1500
        });
        this.fullscreenLoading = false;
        return;
      }
      const reqObj = {
        tel: this.loginData.userNameInput.trim(),
        type: 'login'
      };
      this.codeLoading = true;
      API.user.sendSms(reqObj).then(resp => {
        this.setTimer();
        if (checkRespCorrect(resp)) {
          this.$message.success('验证码发送成功');
        } else {
          messageHandle({ code: resp.code, msg: resp.message || '验证码发送失败，请检查手机号码!' });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    setTimer() { // 计时器
      let i = 1;
      const timer = setInterval(() => {
        i = i + 1;
        const time = 60 - i;
        this.verifyName = '重新获取 (' + time + 's)';
        if (time === 0) {
          this.verifyName = '获取验证码';
          this.codeLoading = false;
          clearTimeout(timer);
        }
      }, 1000);
    },
    clickLoginEnter() {
      if (this.loginData.userNameInput.length && this.loginData.pswInput.length && this.captchaFromCode) {
        this.clickLogin();
      }
    },
    clickLogin() {
      this.fullscreenLoading = true;
      this.sessionPassword();
      if (!this.loginData.userNameInput.length) {
        this.$notify({
          message: '请输入用户名或手机号码！',
          type: 'warning',
          duration: 1500
        });
        this.fullscreenLoading = false;
        return;
      }
      if (this.isLogin) {
        if (!this.loginData.pswInput.length) {
          this.$notify({
            message: '请输入密码！',
            type: 'warning',
            duration: 1500
          });
          this.fullscreenLoading = false;
          return;
        }
      } else {
        if (!this.loginData.verifyCode) {
          this.$notify({
            message: '请输入验证码！',
            type: 'warning',
            duration: 1500
          });
          this.fullscreenLoading = false;
          return;
        }
      }
      if (!this.captchaFromCode) {
        this.$notify({
          message: '图片验证码不能为空，请输入！',
          type: 'warning',
          duration: 1500
        });
        this.fullscreenLoading = false;
        return;
      }
      const req = {
        password: this.loginData.pswInput,
        code: this.loginData.verifyCode,
        username: this.loginData.userNameInput.trim(),
        captcha: this.captchaFromCode,
        captchaKey: this.captchaKey
      };
      API.user.login(req).then(resp => {
        this.fullscreenLoading = false;
        if (checkRespCorrect(resp)) {
          this.afterLogin(resp.data);
        } else {
          this.captchaFromCode = '';
          this.getImgCaptcha();
          messageHandle({ code: resp.code, msg: resp.message || msgContent.LOGIN });
        }
      }).catch(err => {
        this.fullscreenLoading = false;
        messageHandle({ code: msgCode.LOGIN });
      });
    },
    // 使用 SSO 回调的 token 登录总控系统
    loginWithSsoToken(token = '') {
      API.user.authenticate({ token: token }).then(resp => {
        this.fullscreenLoading = false;
        if (checkRespCorrect(resp)) {
          this.afterLogin(resp.data);
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        console.log('##### err #####', err);
        this.fullscreenLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 获取设备storeKey
    getDeviceStoreKey() {
      API.device.deviceStoreKeyAll().then(resp => {
        if (checkRespCorrect(resp)) {
          setStorage(StorageKey.genComm, resp.data);
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 输入用户名或密码登录或者第三方认证登录后的处理
    afterLogin(data = {}) {
      const { userId, username, email, role = {}, permissions = [], token } = data;
      // 修改vuex中的token为初始值
      this.$store.state.tokenCount = true;
      // 存放到缓存中
      setStorage(StorageKey.userId, userId);
      setStorage(StorageKey.username, username);
      setStorage(StorageKey.userEmail, email);
      setStorage(StorageKey.userRole, role);
      setStorage(StorageKey.userPermissions, permissions);
      setStorage(StorageKey.token, token);
      setStorage(StorageKey.tokenTime, new Date().getTime());
      setStorage(StorageKey.tokenExpire, false);
      // 获取所有设备的store key
      this.getDeviceStoreKey();
      // 登录后的路由权限相关判断
      assembleRouterPermission(permissions);
      // 判断是否要返回到之前的页面
      // 默认获取第一个路由跳转
      const { route = {} } = handleDefaultRoute();
      if (this.$route.query.redirect === location.hostname) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: route.name });
      }
    }
  }
};
</script>

<style scoped lang="less">
  .login-page {

    .login-page-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      background-size: 100% 100%;
      background: url('../assets/img/login-background.png') center center no-repeat;
    }

    .login-container {
      width: 900px;
      height: 550px;
      position: absolute;
      left: 50%;
      top: 50%;
      border-radius: 4px;
      transform: translate(-50%, -50%);
      background: @colorWhite;
    }

    .login-page-logo-image {
      width: 300px;
      height: 550px;
      object-fit: none;
    }

    .login-button {
      width: 100%;
      height: 48px;
      font-size: 20px;
      margin-top: 45px;
    }

  }
</style>
