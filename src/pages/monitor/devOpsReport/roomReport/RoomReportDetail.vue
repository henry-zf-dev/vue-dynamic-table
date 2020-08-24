<template>
  <div :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="roomReportData.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <div class="pad-all font-size-16 font-gray-40" style="line-height: 22px">
          <span class="iconfont icon-beizhushuoming font-size-20 mar-rgt-5"></span>
          {{ chartDescription }}
          <el-radio-group v-model="reportType" size="small" class="float-right">
            <el-radio-button label="自检"></el-radio-button>
            <el-radio-button label="告警"></el-radio-button>
          </el-radio-group>
        </div>
        <div id="roomChart"></div>
        <div v-show="reportType==='自检'" class="mar-top-30 position-relative">
          <div class="table-container">
            <EZTable
              v-loading="selfTestHistoryTimesTableLoading"
              :table-id="selfTestHistoryTimesTableId"
              :filters="selfTestHistoryTimesFilters"
              :columns="selfTestHistoryTimesColumnConfig"
              :rows="selfTestHistoryTimesData"
              :selection="false"
              :fit-table="false"
              @filterChange="getSelfTestHistoryTimesData"
              @pageChanged="getSelfTestHistoryTimesData"
              @sizeChanged="getSelfTestHistoryTimesData"
              @sortChanged="getSelfTestHistoryTimesData"
            ></EZTable>
          </div>
        </div>
        <div v-show="reportType==='告警'" class="mar-top-30 position-relative">
          <div class="table-container">
            <EZTable
              v-loading="alarmHistoryTimesTableLoading"
              :table-id="alarmHistoryTimesTableId"
              :filters="alarmHistoryTimesFilters"
              :columns="alarmHistoryTimesColumnConfig"
              :rows="alarmHistoryTimesData"
              :selection="false"
              :fit-table="false"
              @filterChange="getAlarmHistoryTimesData"
              @pageChanged="getAlarmHistoryTimesData"
              @sizeChanged="getAlarmHistoryTimesData"
              @sortChanged="getAlarmHistoryTimesData"
            ></EZTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import { Chart } from '@antv/g2';
import { pageTabConfig, tableIdConfig, tableOptBtnConfig } from '../../../../config/common';
import {
  arrUnique, assembleTableOptBtn,
  checkRespCorrect, getTableCfgFromStorage,
  getTableConfig,
  getTableState, judgePermission,
  messageHandle, momentTimeToString, updateTableState
} from '../../../../utils';
import EZTable from '../../../../components/table/EZTable';
import { msgCode, msgContent } from '../../../../config/string';
import { permissionConfig } from '../../../../config/permission';
import { routerMeta } from '../../../../router/routerMeta';

export default {
  name: 'RoomReport',
  components: {
    Breadcrumb, EZTable
  },
  data() {
    return {
      breadcrumbHeight: 0,
      reportId: '',

      // region ********自检历史次数配置属性********
      selfTestHistoryTimesTableLoading: false,
      selfTestHistoryTimesData: [],
      selfTestHistoryTimesFilters: [],
      selfTestHistoryTimesTableId: tableIdConfig.monitorRoomReportSelfCheckStatistic,
      selfTestHistoryTimesColumnConfig: [],
      // endregion

      // region ********自检告警历史次数配置属性********
      alarmHistoryTimesTableLoading: false,
      alarmHistoryTimesData: [],
      alarmHistoryTimesFilters: [],
      alarmHistoryTimesTableId: tableIdConfig.monitorRoomReportAlarmStatistic,
      alarmHistoryTimesColumnConfig: [],
      // endregion

      roomReportData: {},
      roomId: '',
      reportType: '自检',
      chartDescription: '图表说明：颜色越深，代表该时间段下该自检规则未通过的次数越多',
      chartData: [],
      labelData: [],
      chart: {},
      dateTimeData: ['0:00-0:59', '1:00-1:59', '2:00-2:59', '3:00-3:59', '4:00-4:59', '5:00-5:59', '6:00-6:59', '7:00-7:59', '8:00-8:59', '9:00-9:59', '10:00-10:59', '11:00-11:59', '12:00-12:59', '13：00-13:59', '14:00-14:59', '15:00-15:59', '16:00-16:59', '17:00-17:59', '18:00-18:59', '19:00-19:59', '20:00-20:59', '21:00-21:59', '22:00-22:59', '23:00-23:59']
    };
  },
  computed: {
    subtitle() {
      return {
        show: true,
        text: `生成时间：${this.roomReportData.createdTime}`
      };
    },
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '打印报告',
          icon: 'el-icon-printer',
          perm: permissionConfig.monitorAllDevOpsReport,
          callback: () => {
            this.roomReportPrint();
          }
        }
      ];
    }
  },
  watch: {
    reportType() {
      // 销毁画布对象
      this.chart.destroy();
      if (this.reportType === '自检') {
        this.chartDescription = '图表说明：颜色越深，代表该时间段下该自检规则未通过的次数越多';
      } else {
        this.chartDescription = '图表说明：颜色越深，代表该时间段下该告警次数越多';
      }
      this.dataHandle();
    }
  },
  created() {
    this.reportId = this.$route.params.rid;
    this.roomId = this.$route.params.roomId;
    this.initData();
  },
  mounted() {
    // this.chartHandle();
  },
  methods: {
    judgePerm: judgePermission,
    initData() { // 初始化
      this.reportDetail();
      this.selfTestHistoryTimesTableConfig();
      this.alarmHistoryTimesTableConfig();
    },
    // 打印报告
    roomReportPrint() {
      // window.print();
    },
    // 获取运维报告详情
    reportDetail() {
      API.devOpsReport.roomReportDetail({ id: this.reportId }).then(resp => {
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.roomReportData = {
            ...data,
            createdTime: momentTimeToString(data.createdTime)
          };
          this.dataHandle();
          this.getSelfTestHistoryTimesData();
          this.getAlarmHistoryTimesData();
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        messageHandle({ code: msgCode.SYSTEM });
      });
    },

    // region ************自检历史次数处理*************
    selfTestHistoryTimesTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.selfTestHistoryTimesColumnConfig = columns;
        this.selfTestHistoryTimesFilters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.selfTestHistoryDetail(data);
              break;
            default:
              break;
          }
        });
      };
      assembleConfig(getTableCfgFromStorage(this.selfTestHistoryTimesTableId));
      getTableConfig(this.selfTestHistoryTimesTableId).then((config) => {
        assembleConfig(config);
      }).catch(err => {
      });
    },
    // 获取自检历史次数
    getSelfTestHistoryTimesData() {
      this.selfTestHistoryTimesTableLoading = true;
      const { pageNo = 1, pageSize = 10, filters = [], sort = [] } = getTableState(this.selfTestHistoryTimesTableId);
      const pageParam = {
        pageNo, pageSize, filters, sort,
        roomId: this.roomId,
        time: this.roomReportData.generationTime
      };
      API.devOpsReport.roomReportSelfCheckTriggerCount(pageParam).then(resp => {
        this.selfTestHistoryTimesTableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.selfTestHistoryTimesData = (items || []).map(item => {
            return {
              ...item
            };
          });
          updateTableState(this.selfTestHistoryTimesTableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.selfTestHistoryTimesTableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 查看详情
    selfTestHistoryDetail() {
      this.$router.push({
        name: routerMeta.monitorSystemLog.name,
        query: {
          tab: pageTabConfig.systemLog.selfCheckLog
        }
      });
    },
    // endregion

    // region ***********告警历史次数处理*************
    alarmHistoryTimesTableConfig() {
      const assembleConfig = ({ columns = [], filters = [] }) => {
        this.alarmHistoryTimesColumnConfig = columns;
        this.alarmHistoryTimesFilters = filters;
        assembleTableOptBtn(columns, ({ type = '', data = {} }) => {
          if (!type) return;
          switch (type) {
            case tableOptBtnConfig.detail.type:
              this.alarmDetail(data);
              break;
            default:
              break;
          }
        });
      };
      assembleConfig(getTableCfgFromStorage(this.alarmHistoryTimesTableId));
      getTableConfig(this.alarmHistoryTimesTableId).then((config) => {
        assembleConfig(config);
      }).catch(err => {
      });
    },
    // 获取告警历史次数
    getAlarmHistoryTimesData() {
      this.alarmHistoryTimesTableLoading = true;
      const { pageNo = 1, pageSize = 10, filters = [], sort = [] } = getTableState(this.alarmHistoryTimesTableId);
      const pageParam = {
        pageNo, pageSize, filters, sort,
        roomId: this.roomId,
        time: this.roomReportData.generationTime
      };
      API.devOpsReport.roomReportAlarmTriggerCount(pageParam).then(resp => {
        this.alarmHistoryTimesTableLoading = false;
        if (checkRespCorrect(resp)) {
          const { items = [], pageInfo = {} } = resp.data || {};
          this.alarmHistoryTimesData = (items || []).map(item => {
            return {
              ...item
            };
          });
          updateTableState(this.alarmHistoryTimesTableId, { total: pageInfo.total || 0 });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.alarmHistoryTimesTableLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    // 查看详情
    alarmDetail(row) {
      this.$router.push({
        name: routerMeta.alarmRecord.name
      });
    },
    // endregion

    // region **************G2色块图处理**************
    // 数据处理成色块图需要的结构及加载
    dataHandle() {
      const { ruleReports = [], alarmReports = [] } = this.roomReportData.info || {};
      const data = this.reportType === '自检' ? ruleReports : alarmReports;
      // const idList = arrUnique(__.pluck(data || [], 'id'));
      this.labelData = arrUnique(__.pluck(data || [], 'name'));
      this.chartData = [];
      (this.labelData || []).forEach((item, index) => {
        // this.labelData.push((data || []).find(items => items.id === item).name);
        (data || []).forEach(val => {
          if (item === val.name) {
            this.chartData.push({
              x: val.time,
              y: index,
              count: this.reportType === '自检' ? val.failedNum : val.triggerNum,
              name: val.name,
              triggerNum: val.triggerNum || 0
            });
          }
        });
      });
      this.chartHandle();
    },
    chartHandle() {
      // 初始化图表
      this.chart = new Chart({
        container: 'roomChart',
        autoFit: true,
        height: 600,
        forceFit: true, // 自适应宽度
        animate: false, // 关闭图表动画
        padding: [20, 20, 100, 110]
      });
      // 防止因页面太小，图表变形
      const e = document.createEvent('Event');
      e.initEvent('resize', true, true);
      window.dispatchEvent(e);
      // 给图表赋值
      this.chart.source(this.chartData);
      // 定义X轴
      this.chart.scale('x', {
        type: 'cat',
        values: this.dateTimeData
      });
      // 定义Y轴
      this.chart.scale('y', {
        type: 'cat',
        values: this.labelData
      });
      this.chart.scale('count', {
        // alias: '自检次数',
        nice: true
      });
      this.chart.axis('x', {
        tickLine: null,
        grid: { // 网格线
          type: 'line',
          lineStyle: {
            stroke: '#f0f0f0',
            lineWidth: 1,
            lineDash: [4, 4]
          },
          align: 'center'
        }
      });
      this.chart.axis('y', {
        label: { // 自定义Y轴Label
          offset: 10, // 与图表之间的宽度
          formatter: val => {
            return val.length > 9 ? val.substring(0, 7) + '...' : val;
          }
        },
        grid: { // 网格线
          type: 'line',
          lineStyle: {
            stroke: '#f0f0f0',
            lineWidth: 1,
            lineDash: [4, 4]
          },
          align: 'center'
        }
      });
      // 鼠标悬浮显示
      this.chart.tooltip({
        showMarkers: false,
        showTitle: false // 默认标题不显示
      });
      // 自定义tooltip显示内容
      const self = this;
      this.chart.on('tooltip:change', function(ev) {
        const items = ev.items;
        const origin = items[0];
        items.splice(0);
        items.push({
          ...origin,
          name: self.reportType + '名称：',
          value: origin.point.point.name
        });
        items.push({
          ...origin,
          name: self.reportType + '时段：',
          // marker: true, //标题显示颜色
          value: origin.title
        });
        switch (self.reportType) {
          case '自检':
            items.push({
              ...origin,
              name: self.reportType + '总次数：',
              value: origin.point.point.triggerNum
            });
            items.push({
              ...origin,
              name: self.reportType + '未通过数：'
            });
            break;
          case '告警':
            items.push({
              ...origin,
              name: self.reportType + '次数：'
            });
            break;
          default:
            break;
        }
      });
      // 图形形状，需要渲染的值，样式
      this.chart
        .polygon()
        .position('x*y')
        .color('count', '#FEF5D2-#FACC14-#E77A0F')
        .label('count', {
          offset: -2,
          style: {
            fill: '#fff',
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, .45)'
          }
        })
        .style({
          lineWidth: 1,
          stroke: '#fff'
        });
      this.chart.render();
    }
    // endregion
  }
};
</script>

<style scoped>
  .width-47 {
    width: 47%;
    left: 52%;
  }
</style>
