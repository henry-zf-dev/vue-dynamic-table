<template>
  <div class="login-page">
    <div class="login-page-bg"></div>
    <div class="login-container">
      <el-row v-loading="fullscreenLoading">
        <el-col :span="8">
          <img class="login-page-logo-image" src="../assets/img/login-left-green.png">
        </el-col>
        <el-col :span="16" style="padding: 80px 100px;">
          <div class="header1">登录</div>
          <div class="mar-top-30">
            <div>
              <el-input
                v-model="loginForm.username"
                class="width-100"
                placeholder="请输入用户名"
                @focus="userNameFocus = true"
                @blur="userNameFocus = false"
                @keyup.enter.native="clickLogin"></el-input>
            </div>
            <div class="mar-top-10 mar-btm-10">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                class="width-100"
                show-password
                @focus="passwordFocus = true"
                @blur="passwordFocus = false"
                @keyup.enter.native="clickLogin"></el-input>
            </div>
          </div>
          <el-button type="primary" class="login-button" @click="clickLogin">登录</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {checkRespCorrect, messageHandle} from '../utils';
  import {msgCode, msgContent} from '../config/string';
  import {setStorage, StorageKey} from '../config/sessions';
  import {routerMeta} from '../router/routerMeta';

  export default {
    name: 'Login',
    data() {
      return {
        fullscreenLoading: false,
        loginForm: {
          username: '',
          password: ''
        },
        userNameFocus: false,
        passwordFocus: false
      };
    },
    methods: {
      clickLogin() {
        this.fullscreenLoading = true;
        if (!this.loginForm.username.length) {
          this.$notify({
            message: '请输入用户名！',
            type: 'warning',
            duration: 1500
          });
          this.fullscreenLoading = false;
          return;
        }
        if (!this.loginForm.password.length) {
          this.$notify({
            message: '请输入密码！',
            type: 'warning',
            duration: 1500
          });
          this.fullscreenLoading = false;
          return;
        }
        this.fullscreenLoading = false;
        setStorage(StorageKey.token, 'token');
        this.$router.push({name: routerMeta.domain.name});
        return;
        // eslint-disable-next-line no-unreachable
        const req = {
          password: this.loginForm.password,
          username: this.loginForm.username.trim()
        };
        API.user.login(req).then(resp => {
          this.fullscreenLoading = false;
          if (checkRespCorrect(resp)) {
            this.afterLogin(resp.data);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.LOGIN});
          }
        }).catch(err => {
          this.fullscreenLoading = false;
          messageHandle({code: msgCode.LOGIN});
        });
      },
      afterLogin(data = {}) {
        const {userId, username, email, role = {}, permissions = [], token} = data;
        // 存放到缓存中
        setStorage(StorageKey.userId, userId);
        setStorage(StorageKey.username, username);
        setStorage(StorageKey.userEmail, email);
        setStorage(StorageKey.userRole, role);
        setStorage(StorageKey.userPermissions, permissions);
        setStorage(StorageKey.token, token);
        setStorage(StorageKey.tokenTime, new Date().getTime());
        setStorage(StorageKey.tokenExpire, false);
        // 判断是否要返回到之前的页面
        if (this.$route.query.redirect === location.hostname) {
          this.$router.go(-1);
        } else {
          this.$router.push({name: routerMeta.domain.name});
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
