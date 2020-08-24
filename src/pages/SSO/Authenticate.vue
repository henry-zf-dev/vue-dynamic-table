<template>
  <div></div>
</template>

<script>
import { checkRespCorrect, messageHandle } from '../../utils';
import { msgCode, msgContent } from '../../config/string';
import { apiType, ssoUrlConfig } from '../../config/common';

export default {
  name: 'Authenticate',
  data() {
    return {
      SSOLoading: false
    };
  },
  watch: {
    SSOLoading() {
      if (this.SSOLoading) {
        this.$loading({
          lock: true,
          text: '认证授权中...'
        });
      }
    }
  },
  created() {
    this.getSSOUrl();
  },
  methods: {
    getSSOUrl() {
      this.SSOLoading = true;
      API.setting.getSSOUrl().then(resp => {
        this.SSOLoading = false;
        if (checkRespCorrect(resp)) {
          const { tokenCheckHost = '', authenticateUrl = '' } = resp.data || {};
          if (!tokenCheckHost || !authenticateUrl) {
            // messageHandle({code: msgCode.SYSTEM});
            // TODO 临时方案 如果接口返回错误，则默认到正式SSO授权
            this.redirect(ssoUrlConfig.prod);
          } else {
            this.redirect(`${tokenCheckHost}${authenticateUrl}`);
          }
        } else {
          // messageHandle({code: resp.code, msg: resp.message || msgContent.SYSTEM});
          this.redirect(ssoUrlConfig.prod);
        }
      }).catch(err => {
        this.SSOLoading = false;
        this.redirect(ssoUrlConfig.prod);
        // messageHandle({code: msgCode.SYSTEM});
      });
    },
    redirect(url = '') {
      if (!url) return;
      const { protocol, hostname, port } = window.location;
      const ptc = protocol.substring(0, protocol.length - 1); // 去除 ':'
      const p = port ? `%3A${port}` : '';
      const redirectUrl = `${url}?from_url=${ptc}%3A%2F%2F${hostname}${p}%2F${apiType.core}%2Fsso%2Fcallback%2Fuser%2Flogin`;
      console.log('##### redirectUrl #####', redirectUrl);
      window.location.href = redirectUrl;
    }
  }
};
</script>

<style scoped>

</style>
