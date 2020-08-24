<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}">
    <BreadcrumbTab
      v-model="breadcrumbHeight"
      :current-tab="currentTab"
      :tab-data="tabData"
      @switchTab="switchTab"></BreadcrumbTab>
    <div class="page-container">
      <div class="table-container">
        <div v-if="currentTab === systemLogTab.operationLog">
          <keep-alive>
            <OperationLog></OperationLog>
          </keep-alive>
        </div>
        <div v-if="currentTab === systemLogTab.deviceLog">
          <keep-alive>
            <DeviceLog></DeviceLog>
          </keep-alive>
        </div>
        <div v-if="currentTab === systemLogTab.roomLog">
          <keep-alive>
            <RoomLog></RoomLog>
          </keep-alive>
        </div>
        <div v-if="currentTab === systemLogTab.selfCheckLog">
          <keep-alive>
            <SelfCheckLog></SelfCheckLog>
          </keep-alive>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BreadcrumbTab from '../../../components/breadcrumb/BreadcrumbTab';
import { permissionConfig } from '../../../config/permission';
import { getUrlParam, updateRouteParamState } from '../../../modules/urlParamStoreHdl';
import OperationLog from './OperationLog';
import DeviceLog from './DeviceLog';
import RoomLog from './RoomLog';
import SelfCheckLog from './SelfCheckLog';
import { pageTabConfig } from '../../../config/common';
import { mapState } from 'vuex';

export default {
  name: 'SystemLog',
  components: {
    BreadcrumbTab, OperationLog, DeviceLog, RoomLog, SelfCheckLog
  },
  data() {
    return {
      breadcrumbHeight: 0,
      systemLogTab: pageTabConfig.systemLog,
      currentTab: '',
      tabData: [
        {
          name: pageTabConfig.systemLog.operationLog,
          perm: permissionConfig.monitorAllSystemLog,
          label: '操作日志'
        },
        {
          name: pageTabConfig.systemLog.deviceLog,
          perm: permissionConfig.monitorAllSystemLog,
          label: '设备日志'
        },
        {
          name: pageTabConfig.systemLog.roomLog,
          perm: permissionConfig.monitorAllSystemLog,
          label: '房间日志'
        }
        // {
        //   name: pageTabConfig.systemLog.selfCheckLog,
        //   perm: permissionConfig.monitorAllSystemLog,
        //   label: '自检日志'
        // }
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
      // 在路由 query 中获取 tab 信息，如果有，则赋值到 routeParam 中
      // 因为存在跨越父子路由跳转的情况，比如房间报表查看详情，要跳转到自检日志页面
      // 而在 BodyAdmin 中对于非父子关系的路由跳转，会清空 routeParam，
      // 所以需要做一下处理 Henry 2020-05-28 23:20:18
      updateRouteParamState(this.$route.name, { tab: getUrlParam('tab') });
      const { tab } = this.routeParamState[this.$route.name] || {};
      this.currentTab = tab || this.systemLogTab.operationLog;
    },
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
