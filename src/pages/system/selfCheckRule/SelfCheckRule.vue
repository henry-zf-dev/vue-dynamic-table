<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="self-check-rule-page">
    <BreadcrumbTab
      v-model="breadcrumbHeight"
      :current-tab="currentTab"
      :tab-data="tabData"
      :opt-data="breadcrumbOpts"
      @switchTab="switchTab"></BreadcrumbTab>
    <div class="page-container">
      <div class="table-container">
        <div v-if="currentTab === selfCheckRuleTab.globalSelfCheckRule">
          <keep-alive>
            <GlobalSelfCheckRule></GlobalSelfCheckRule>
          </keep-alive>
        </div>
        <div v-if="currentTab === selfCheckRuleTab.roomSelfCheckRule">
          <keep-alive>
            <RoomSelfCheckRule></RoomSelfCheckRule>
          </keep-alive>
        </div>
        <div v-if="currentTab === selfCheckRuleTab.roomJointCheckRule">
          <keep-alive>
            <RoomJointCheckRule></RoomJointCheckRule>
          </keep-alive>
        </div>
        <div v-if="currentTab === selfCheckRuleTab.selfCheckRuleTemplate">
          <keep-alive>
            <SelfCheckRuleTemplate></SelfCheckRuleTemplate>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUrlParam, updateRouteParamState } from '../../../modules/urlParamStoreHdl';
import { permissionConfig } from '../../../config/permission';
import FormOptBtn from '../../../components/FormOptBtn';
import BreadcrumbTab from '../../../components/breadcrumb/BreadcrumbTab';
import EZTable from '../../../components/table/EZTable';
import GlobalSelfCheckRule from './global/GlobalSelfCheckRule';
import RoomSelfCheckRule from './room/RoomSelfCheckRule';
import RoomJointCheckRule from './room/RoomJointCheckRule';
import SelfCheckRuleTemplate from './template/SelfCheckRuleTemplate';
import { pageTabConfig } from '../../../config/common';
import { routerMeta } from '../../../router/routerMeta';
import { mapState } from 'vuex';

export default {
  name: 'SelfCheckRule',
  components: {
    FormOptBtn, BreadcrumbTab, EZTable,
    GlobalSelfCheckRule, RoomSelfCheckRule,
    RoomJointCheckRule, SelfCheckRuleTemplate
  },
  data() {
    return {
      breadcrumbHeight: 0,
      selfCheckRuleTab: pageTabConfig.selfCheckRule,
      currentTab: '',
      showTemplateOptDialog: false,
      tabData: [
        {
          name: pageTabConfig.selfCheckRule.globalSelfCheckRule,
          perm: permissionConfig.system,
          label: '全局自检'
        },
        {
          name: pageTabConfig.selfCheckRule.roomSelfCheckRule,
          perm: permissionConfig.system,
          label: '所有房间自检'
        },
        // todo 所有房间联检先注释，现在 oppo 还没有上线这功能
        {
          name: pageTabConfig.selfCheckRule.roomJointCheckRule,
          perm: permissionConfig.system,
          label: '所有房间联检'
        },
        {
          name: pageTabConfig.selfCheckRule.selfCheckRuleTemplate,
          perm: permissionConfig.system,
          label: '自检模板'
        }
      ],
      breadcrumbOpts: []
    };
  },
  computed: {
    ...mapState(['routeParamState'])
  },
  watch: {
    currentTab(tab) {
      switch (tab) {
        case this.selfCheckRuleTab.globalSelfCheckRule:
        case this.selfCheckRuleTab.roomSelfCheckRule:
        case this.selfCheckRuleTab.roomJointCheckRule:
          this.breadcrumbOpts = [];
          break;
        case this.selfCheckRuleTab.selfCheckRuleTemplate:
          this.breadcrumbOpts = [
            {
              type: 'btn',
              label: '新增自检模板',
              icon: 'icon-tianjia',
              perm: permissionConfig.system,
              callback: () => {
                this.$router.push({ name: routerMeta.systemSelfCheckTemplateAdd.name });
              }
            }
          ];
          break;
        default:
          break;
      }
    }
  },
  activated() {
    this.initTab();
  },
  methods: {
    initTab() {
      updateRouteParamState(this.$route.name, { tab: getUrlParam('tab') });
      const { tab } = this.routeParamState[this.$route.name] || {};
      this.currentTab = tab || this.selfCheckRuleTab.globalSelfCheckRule;
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
