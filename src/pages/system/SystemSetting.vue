<template>
  <div class="system-setting-page" style="padding-top: 60px">
    <BreadcrumbTab :current-tab="currentTab" :tab-data="tabData" @switchTab="switchTab"></BreadcrumbTab>
    <div class="page-container">
      <div class="table-container">
        <div v-if="currentTab === systemSettingTab.roomTypeSetting">
          <keep-alive>
            <RoomTypeSetting></RoomTypeSetting>
          </keep-alive>
        </div>
        <div v-if="currentTab === systemSettingTab.customFieldSetting">
          <keep-alive>
            <CustomFieldSetting></CustomFieldSetting>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BreadcrumbTab from '../../components/breadcrumb/BreadcrumbTab';
import EmailSetting from './setting/EmailSetting';
import MessageSetting from './setting/MessageSetting';
import BaseSetting from './setting/BaseSetting';
import CustomFieldSetting from './setting/CustomFieldSetting';
import RoomTypeSetting from './setting/RoomTypeSetting';
import { permissionConfig } from '../../config/permission';
import { getUrlParam, updateRouteParamState } from '../../modules/urlParamStoreHdl';
import { mapState } from 'vuex';
import { pageTabConfig } from '../../config/common';

export default {
  name: 'SystemSetting',
  components: {
    BreadcrumbTab, EmailSetting, MessageSetting,
    BaseSetting, CustomFieldSetting, RoomTypeSetting
  },
  data() {
    return {
      systemSettingTab: pageTabConfig.systemSetting,
      currentTab: '',
      tabData: [
        {
          name: pageTabConfig.systemSetting.roomTypeSetting,
          perm: permissionConfig.system,
          label: '房间类型'
        },
        {
          name: pageTabConfig.systemSetting.customFieldSetting,
          perm: permissionConfig.system,
          label: '字段配置'
        }
      ]
    };
  },
  computed: {
    ...mapState(['routeParamState'])
  },
  activated() {
    this.initTab();
  },
  methods: {
    initTab() {
      updateRouteParamState(this.$route.name, { tab: getUrlParam('tab') });
      const { tab } = this.routeParamState[this.$route.name] || {};
      this.currentTab = tab || this.systemSettingTab.roomTypeSetting;
    },
    // 切换告警列表
    switchTab(tab) {
      this.currentTab = tab;
      // tab 切换后清空 tableState
      updateRouteParamState(this.$route.name, { tab: tab, pageNo: '', pageSize: '', sort: '' });
    }
  }
};
</script>

<style scoped>

</style>
