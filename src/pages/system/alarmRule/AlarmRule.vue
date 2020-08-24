<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="alarm-rule-page">
    <BreadcrumbTab
      v-model="breadcrumbHeight"
      :current-tab="currentTab"
      :tab-data="tabData"
      :opt-data="breadcrumbOpts"
      @switchTab="switchTab"></BreadcrumbTab>
    <div class="page-container">
      <div class="table-container">
        <div v-if="currentTab === alarmRuleTab.globalAlarmRule">
          <keep-alive>
            <GlobalAlarmRule></GlobalAlarmRule>
          </keep-alive>
        </div>
        <div v-if="currentTab === alarmRuleTab.roomAlarmRule">
          <keep-alive>
            <RoomAlarmRule></RoomAlarmRule>
          </keep-alive>
        </div>
      </div>
    </div>
    <!--    <el-dialog :title="roomAlarmTitle" :visible.sync="isAlarmDialog" width="60%">-->
    <!--      <EZTable-->
    <!--        v-loading="isTableLoading" :table-id="tableId"-->
    <!--        :hide-filter="true" :columns="columnConfig" :rows="alarmData"-->
    <!--        @pageChanged="getAlarmList"-->
    <!--        @sizeChanged="getAlarmList"-->
    <!--      ></EZTable>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
  import {getUrlParam, updateRouteParamState} from '../../../modules/urlParamStoreHdl';
  import {permissionConfig} from '../../../config/permission';
  import {routerMeta} from '../../../router/routerMeta';
  import BreadcrumbTab from '../../../components/breadcrumb/BreadcrumbTab';
  import {pageTabConfig} from '../../../config/common';
  import EmptyContent from '../../../components/EmptyContent';
  import GlobalAlarmRule from './global/GlobalAlarmRule';
  import RoomAlarmRule from './room/RoomAlarmRule';
  import {mapState} from 'vuex';

  export default {
    name: 'AlarmRule',
    components: {
      BreadcrumbTab, EmptyContent,
      GlobalAlarmRule, RoomAlarmRule
    },
    data() {
      return {
        breadcrumbHeight: 0,
        alarmRuleTab: pageTabConfig.alarmRule,
        currentTab: '',
        tabData: [
          {
            name: pageTabConfig.alarmRule.globalAlarmRule,
            perm: permissionConfig.system,
            label: '全局告警'
          },
          {
            name: pageTabConfig.alarmRule.roomAlarmRule,
            perm: permissionConfig.system,
            label: '所有房间告警'
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
          case this.alarmRuleTab.globalAlarmRule:
            this.breadcrumbOpts = [
              {
                type: 'btn',
                label: '新增告警规则',
                icon: 'icon-tianjia',
                perm: permissionConfig.system,
                callback: () => {
                  this.$router.push({
                    name: routerMeta.systemGlobalAlarmAdd.name
                  });
                }
              }
            ];
            break;
          case this.alarmRuleTab.roomAlarmRule:
            this.breadcrumbOpts = [];
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
        updateRouteParamState(this.$route.name, {tab: getUrlParam('tab')});
        const {tab} = this.routeParamState[this.$route.name] || {};
        this.currentTab = tab || this.alarmRuleTab.globalAlarmRule;
      },
      // 切换告警列表
      switchTab(tab) {
        this.currentTab = tab;
        // tab 切换后清空 tableState
        updateRouteParamState(this.$route.name, {tab: tab, pageNo: '', pageSize: '', sort: ''});
      }
    }
  };
</script>

<style scoped>

</style>
