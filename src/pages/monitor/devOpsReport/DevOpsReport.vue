<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}" class="self-check-record-page">
    <BreadcrumbTab
      v-model="breadcrumbHeight"
      :current-tab="currentTab"
      :tab-data="tabData"
      :subtitle="breadcrumbSubtitle"
      @switchTab="switchTab"></BreadcrumbTab>
    <div class="page-container">
      <div class="table-container">
        <div v-if="currentTab === devOpsReportTab.selfCheckReport">
          <keep-alive>
            <SelfCheckReport></SelfCheckReport>
          </keep-alive>
        </div>
        <div v-if="currentTab === devOpsReportTab.jointCheckReport">
          <keep-alive>
            <JointCheckReport></JointCheckReport>
          </keep-alive>
        </div>
        <div v-if="currentTab === devOpsReportTab.roomReport">
          <keep-alive>
            <RoomReport></RoomReport>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {getUrlParam, updateRouteParamState} from '../../../modules/urlParamStoreHdl';
  import {pageTabConfig} from '../../../config/common';
  import {permissionConfig} from '../../../config/permission';
  import TableCircle from '../../../components/table/TableCircle';
  import BreadcrumbTab from '../../../components/breadcrumb/BreadcrumbTab';
  import EZTable from '../../../components/table/EZTable';
  import SelfCheckReport from './selfCheckReport/SelfCheckReport';
  import JointCheckReport from './jointCheckReport/JointCheckReport';
  import RoomReport from './roomReport/RoomReport';
  import {mapState} from 'vuex';

  export default {
    name: 'DevOpsReport',
    components: {
      TableCircle, BreadcrumbTab, EZTable,
      SelfCheckReport, JointCheckReport, RoomReport
    },
    data() {
      return {
        breadcrumbHeight: 0,
        devOpsReportTab: pageTabConfig.devOpsReport,
        currentTab: '',
        tabData: [
          // todo 自检报告和联检报告先注释，现在 oppo 还没有上线这两个报告
          // {
          //   name: pageTabConfig.devOpsReport.selfCheckReport,
          //   perm: permissionConfig.monitorAllDevOpsReport,
          //   label: '自检报告'
          // },
          {
            name: pageTabConfig.devOpsReport.jointCheckReport,
            perm: permissionConfig.monitorAllDevOpsReport,
            label: '联检报告'
          }
          //, 
          // {
          //   name: pageTabConfig.devOpsReport.roomReport,
          //   perm: permissionConfig.monitorAllDevOpsReport,
          //   label: '房间报告'
          // }
        ],
        breadcrumbSubtitle: ''
      };
    },
    computed: {
      ...mapState(['routeParamState'])
    },
    watch: {
      currentTab(tab) {
        switch (tab) {
          case this.devOpsReportTab.jointCheckReport:
          case this.devOpsReportTab.roomReport:
            this.breadcrumbSubtitle = '';
            break;
          case this.devOpsReportTab.selfCheckReport:
            this.breadcrumbSubtitle = '自检报告是衡量房间每天运行状况的重要指标，次日00:00:00生成报告';
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
        this.currentTab = tab || this.devOpsReportTab.jointCheckReport;
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

<style scoped lang="less">

</style>
