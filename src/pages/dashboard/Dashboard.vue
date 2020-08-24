<template>
  <div style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div class="page-container">
      <div class="alarm-detail-content mar-btm-10 box-shadow">
        <span class="header6">所属区域：</span>
        <AreaCascadeComp
          v-model="searchLocation"
          :area-path="locationData"
          size="small"
          @change="searchChange"></AreaCascadeComp>
        <span class="font-size-12 font-gray-60 pad-top-5 pad-lft">
          <span class="el-icon-warning-outline color-white font-size-14 mar-rgt-5"></span>
          <span>注：以下所有数据均为该区域下的统计，您可通过筛选查看管辖范围内的其它区域</span>
        </span>
      </div>
      <!--      <el-row :gutter="24">-->
      <!--        <el-col :xs="24" :sm="24" class="pad-rgt-10">-->
      <!--          <div class="alarm-detail-content mar-btm-10 box-shadow area-row">-->
      <!--            <span class="header6">所属区域：</span>-->
      <!--            <AreaCascadeComp-->
      <!--              v-model="searchLocation"-->
      <!--              :area-path="locationData"-->
      <!--              size="small"-->
      <!--              @change="searchChange"></AreaCascadeComp>-->
      <!--            <span class="font-size-12 font-gray-60 pad-top-5 pad-lft">-->
      <!--              <span class="iconfont icon-beizhushuoming color-white font-size-14 mar-rgt-5"></span>-->
      <!--              <span>注：以下所有数据均为该区域下的统计，您可通过筛选查看管辖范围内的其它区域</span>-->
      <!--            </span>-->
      <!--          </div>-->
      <!--        </el-col>-->
      <!--      </el-row>-->
      <el-row :gutter="24" class="pad-btm">
        <el-col
          v-for="(item,index) in dashboardTitleData"
          :xs="24"
          :sm="6"
          :key="index"
          :class="item.colClass"
          style="min-width: 200px;min-height: 105px">
          <div :class="item.divClass" class="cursor-pointer box-shadow" @click="item.callback">
            <div :class="item.titleHoverClass" class="pad-top pad-lft-20">
              <el-row>
                <el-col :span="12">
                  <span class="header6">{{ item.name }}</span>
                </el-col>
                <el-col :span="12" class="text-align-right ">
                  <el-tooltip :content="item.tooltipContent" class="item" effect="dark" placement="top">
                    <span class="el-icon-warning-outline color-white font-size-14 pad-rgt"></span>
                  </el-tooltip>
                </el-col>
              </el-row>
            </div>
            <div class="pad-top pad-lft-20 pad-btm-30">
              <el-row>
                <el-col :span="item.alarmContrast?10:24">
                  <span :class="item.numberClass" class="header1">{{ item.number }}</span>
                  <span :class="item.titleHoverClass" class="pad-lft-10 header6 font-gray-40">{{ item.company }}</span>
                </el-col>
                <el-col v-if="item.alarmContrast" :span="14" class="text-align-right pad-top-10">
                  <div class="pad-rgt font-gray-70 font-size-12">
                    <span>同比昨天</span>
                    <span
                      :class="item.compare>0?'font-color-danger':(item.compare===0)?'font-gray-10':'font-color-success'"
                      class="font-weight-bold">{{ Math.abs(item.compare) }}{{ item.company }}</span>
                    <span
                      :class="item.compare>0?'font-color-danger font-weight-bold el-icon-top':(item.compare===0)?'font-gray-10':'font-color-success font-weight-bold el-icon-bottom'"
                      style="font-size: 13px;"></span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row id="alarmSearch" :gutter="24">
        <el-col v-loading="alarmGraphLoading" :xs="24" :sm="isAlarmSearch?16:24">
          <div class="alarm-detail-content box-shadow">
            <el-row :gutter="24">
              <el-col :xs="24" :sm="16">
                <div>
                  <div class="header5">告警趋势</div>
                  <div class="font-size-12 font-gray-60 pad-top-5">
                    <span>图表展示区域内所有房间告警数量的统计</span>
                  </div>
                </div>
              </el-col>
              <el-col :xs="24" :sm="8">
                <div class="text-align-right">
                  <el-select
                    v-model="alarmGraphTime"
                    size="small"
                    class="select-width"
                    @change="getAlarmGraph">
                    <el-option-group
                      v-for="group in graphOption"
                      :key="group.label"
                      :label="group.label">
                      <el-option
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-option-group>
                  </el-select>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="list-top alarm-detail-content mar-btm box-shadow">
            <div id="alarmTrend"></div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="isAlarmSearch?8:24">
          <div class="alarm-detail-content mar-btm position-relative box-shadow">
            <el-tabs v-model="activeName">
              <el-tab-pane label="告警房间" name="alarmRoom">
                <el-table
                  :show-header="false"
                  :max-height="tableMinHeight"
                  :style="{minHeight: tableMinHeight}"
                  :data="alarmRoomData">
                  <el-table-column
                    prop="value"
                    min-width="250px">
                    <template slot-scope="scope">
                      <img
                        :src="scope.row.imgUrl"
                        class="position-absolute"
                        width="30"
                        height="34">
                      <span class="pad-lft-30 mar-lft header6">{{ scope.row.roomName||'' }}</span>
                      <div class="header7 pad-lft-30 mar-lft font-gray-60">{{ scope.row.locationName||'' }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="value">
                    <template slot-scope="scope">
                      <div class="pad-top-5 text-align-right">
                        <span :class="scope.row.colorClass" class="header2">{{ scope.row.alarmCount||'0' }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="告警设备" name="alarmDevice">
                <el-table
                  :show-header="false"
                  :max-height="tableMinHeight"
                  :style="{minHeight: tableMinHeight}"
                  :data="alarmDeviceTypeData">
                  <el-table-column
                    prop="value"
                    min-width="250px">
                    <template slot-scope="scope">
                      <img
                        :src="scope.row.imgUrl"
                        class="position-absolute"
                        width="30"
                        height="34">
                      <div class="pad-lft-30 mar-lft header6" style="padding-top: 8px">{{ scope.row.name||'' }}
                      </div>
                      <div class="header7 pad-lft-30 mar-lft font-gray-60"></div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="value">
                    <template slot-scope="scope">
                      <div class="pad-top-5 text-align-right">
                        <span :class="scope.row.colorClass" class="header2">{{ scope.row.alarmCount||'0' }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="告警名称" name="alarmName">
                <el-table
                  :show-header="false"
                  :max-height="tableMinHeight"
                  :style="{minHeight: tableMinHeight}"
                  :data="alarmRuleData">
                  <el-table-column
                    prop="value"
                    min-width="250px">
                    <template slot-scope="scope">
                      <img
                        :src="scope.row.imgUrl"
                        class="position-absolute"
                        width="30"
                        height="34">
                      <div class="pad-lft-30 mar-lft header6" style="padding-top: 8px">{{
                      scope.row.alarmConfigName||'' }}
                      </div>
                      <div class="header7 pad-lft-30 mar-lft font-gray-60"></div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="value">
                    <template slot-scope="scope">
                      <div class="pad-top-5 text-align-right">
                        <span :class="scope.row.colorClass" class="header2">{{ scope.row.alarmCount||'0' }}</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
            <div class="position-absolute" style="right:25px;top: 22px;">
              <el-select
                v-model="alarmRoomTime"
                size="small"
                class="select-width"
                @change="searchTimeChange">
                <el-option value="lastSevenDays" label="最近七天"></el-option>
                <el-option value="thisWeek" label="本周"></el-option>
                <el-option value="lastWeek" label="上周"></el-option>
                <el-option value="thisMonth" label="本月"></el-option>
                <el-option value="lastMonth" label="上月"></el-option>
              </el-select>
            </div>
          </div>

        </el-col>
      </el-row>
      <el-row id="dashBoardChart" :gutter="24">
        <el-col :xs="24" :sm="rowSpan?24:12" class="mar-btm">
          <div class="alarm-detail-content  box-shadow">
            <el-row>
              <el-col :span="12">
                <div class="header5">房间类型及分布区域</div>
              </el-col>
              <el-col :span="12" class="text-align-right">
                <el-tooltip content="房间类型及分布区域(点击可查看房间类型列表或图表)" class="item" effect="dark" placement="top">
                  <span
                    class="el-icon-warning-outline color-white font-size-14 pad-rgt cursor-pointer"
                    @click="roomTypeShow()"></span>
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
          <el-row v-loading="roomChartLoading">
            <el-col :xs="24" :sm="roomTypeSpan?24:12">
              <div class="list-top alarm-detail-content box-shadow">
                <div id="roomNumber"></div>
              </div>
            </el-col>
            <el-col v-show="!roomTypeSpan" :xs="24" :sm="12">
              <div class="list-top alarm-detail-content box-shadow">
                <div v-show="!isRoomType" id="roomType"></div>
                <el-table
                  v-if="isRoomType"
                  :data="roomTypeData"
                  :height="TableChartHeight">
                  <el-table-column
                    prop="item"
                    label="房间类型">
                  </el-table-column>
                  <el-table-column
                    prop="count"
                    label="房间数量">
                  </el-table-column>
                  <el-table-column
                    prop="percent"
                    label="占比率">
                    <template slot-scope="scope">
                      {{ (scope.row.percent * 100).toFixed(2) + '%' }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-col>
        <el-col :xs="24" :sm="rowSpan?24:12">
          <div class="alarm-detail-content box-shadow">
            <el-row>
              <el-col :span="12">
                <div class="header5">设备类型及分布区域</div>
              </el-col>
              <el-col :span="12" class="text-align-right ">
                <el-tooltip content="设备类型及分布区域(点击可查看设备类型列表或图表)" class="item" effect="dark" placement="top">
                  <span
                    class="el-icon-warning-outline color-white font-size-14 pad-rgt cursor-pointer"
                    @click="deviceTypeShow()"></span>
                </el-tooltip>
              </el-col>
            </el-row>
          </div>
          <el-row v-loading="deviceChartLoading">
            <el-col :xs="24" :sm="deviceTypeSpan?24:12">
              <div class="list-top alarm-detail-content box-shadow">
                <div id="deviceNumber"></div>
              </div>
            </el-col>
            <el-col v-show="!deviceTypeSpan" :xs="24" :sm="12">
              <div class="list-top alarm-detail-content box-shadow">
                <div v-show="!isDeviceType" id="deviceType"></div>
                <el-table
                  v-if="isDeviceType"
                  :data="deviceTypeData"
                  :height="TableChartHeight">
                  <el-table-column
                    prop="item"
                    label="设备类型">
                  </el-table-column>
                  <el-table-column
                    prop="count"
                    label="设备数量">
                  </el-table-column>
                  <el-table-column
                    prop="percent"
                    label="占比率">
                    <template slot-scope="scope">
                      {{ (scope.row.percent * 100).toFixed(2) + '%' }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import {routerMeta} from '../../router/routerMeta';
  import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
  import {momentFormat} from '../../config/common';
  import moment from 'moment';
  import {checkRespCorrect, getElementTopOffset, messageHandle, momentTimeToString} from '../../utils';
  import {msgCode, msgContent} from '../../config/string';
  import AreaCascadeComp from '../../components/AreaCascadeComp';
  import {Chart} from '@antv/g2';
  import {getStorage, StorageKey} from '../../config/sessions';
  import elementResizeDetectorMaker from 'element-resize-detector';

  export default {
    name: 'Dashboard',
    components: {
      Breadcrumb, AreaCascadeComp
    },
    data() {
      return {
        searchLocation: 0,
        activeName: 'alarmRoom',
        locationData: [],
        alarmGraphLoading: false,
        rowSpan: false,
        roomCount: 0,
        deviceCount: 0,
        isArea: false,
        isAlarmSearch: true,
        roomChartLoading: false,
        deviceChartLoading: false,
        deviceTypeSpan: false,
        roomTypeSpan: false,
        isRoomType: false,
        isDeviceType: false,
        graphOption: [
          {
            options: [{
              value: 'lastOneMonth',
              label: '最近30天'
            }]
          }, {
            label: moment(new Date()).format(momentFormat.yearFormat) + '年',
            options: [
              {
                value: 'january',
                label: '一月'
              }, {
                value: 'february',
                label: '二月'
              }, {
                value: 'march',
                label: '三月'
              }, {
                value: 'april',
                label: '四月'
              },
              {
                value: 'may',
                label: '五月'
              }, {
                value: 'june',
                label: '六月'
              }, {
                value: 'july',
                label: '七月'
              }, {
                value: 'august',
                label: '八月'
              },
              {
                value: 'september',
                label: '九月'
              }, {
                value: 'october',
                label: '十月'
              }, {
                value: 'november',
                label: '十一月'
              }, {
                value: 'december',
                label: '十二月'
              }
            ]
          }
        ],
        alarmGraphTime: 'lastOneMonth',
        alarmRoomTime: 'lastSevenDays',
        alarmDeviceTypeTime: 'lastSevenDays',
        dashboardTitleData: [
          {
            name: '告警房间数',
            colClass: 'col-class',
            // divClass: 'alarm-room-class border-lft',
            divClass: 'alarm-room-class',
            tooltipContent: '当前仍处于告警状态的房间数量',
            titleHoverClass: 'alarm-title-hover',
            alarmContrast: true,
            numberClass: 'font-color-danger alarm-title-hover',
            number: 0,
            company: '间',
            compare: 0,
            callback: () => {
              this.$router.push({
                name: routerMeta.monitorRoom.name
              });
            }
          },
          {
            name: '告警设备数',
            colClass: 'col-class',
            divClass: 'alarm-room-class',
            tooltipContent: '当前仍处于告警状态的设备数量',
            titleHoverClass: 'alarm-title-hover',
            alarmContrast: true,
            numberClass: 'font-color-danger alarm-title-hover',
            number: 0,
            company: '个',
            compare: 0,
            callback: () => {
              this.$router.push({
                name: routerMeta.alarmDevice.name
              });
            }
          },
          {
            name: '上线房间数',
            colClass: 'col-class',
            divClass: 'alarm-room-class',
            tooltipContent: '当前已上线的房间数量',
            titleHoverClass: '',
            numberClass: '',
            number: 0,
            company: '间',
            callback: () => {
              this.$router.push({
                name: routerMeta.monitorRoom.name // TODO 跳转由 区域管理 => 房间监控列表 Henry 2020-06-22 22:11:59
              });
            }
          },
          {
            name: '上线设备数',
            colClass: 'col-class',
            divClass: 'alarm-room-class',
            tooltipContent: '当前已上线的设备数量',
            titleHoverClass: '',
            numberClass: '',
            number: 0,
            company: '个',
            callback: () => {
              this.$router.push({
                name: routerMeta.managementDevice.name
              });
            }
          }
        ],
        alarmRoomData: [],
        alarmDeviceTypeData: [],
        alarmRuleData: [],
        tableMinHeight: '0px',
        TableChartHeight: '0px',
        alarmTrendChart: {},
        alarmTrendData: [],
        roomTypeChart: {},
        roomTypeData: [],
        roomNumberChart: {},
        roomNumberData: [],
        deviceTypeChart: {},
        deviceTypeData: [],
        deviceNumberChart: {},
        deviceNumberData: []
      };
    },
    watch: {
      clientHeight() {
        this.getTableMinHeight();
      }
    },
    activated() {
      this.initData();
      this.TableChartHeight = window.innerHeight - 550 < 320 ? '324px' : (window.innerHeight - 550 + 4) + 'px';
    },
    mounted() {
      setTimeout(() => {
        this.getTableMinHeight();
      }, 0);
      // 监听告警饼状图div宽度
      const erd = elementResizeDetectorMaker();
      erd.listenTo($('#dashBoardChart'), (element) => {
        this.$nextTick(() => {
          const width = element.offsetWidth;
          if (width <= 1200) {
            this.rowSpan = true;
          }
          if (width >= 1400) {
            this.rowSpan = false;
          }
        });
      });
      // 监听告警top10宽度
      erd.listenTo($('#alarmSearch'), (element) => {
        this.$nextTick(() => {
          const width = element.offsetWidth;
          if (width <= 1300) {
            this.isAlarmSearch = false;
          }
          if (width >= 1360) {
            this.isAlarmSearch = true;
          }
        });
      });
    },
    methods: {
      initData() {
        this.getRoomNumber();
        this.getDeviceNumber();
        this.getAlarmRoomList();
        this.getAlarmDeviceTypeList();
        this.getAlarmRuleList();
        this.getAlarmGraph();
        this.getRoomTypeDistribution();
        this.getDeviceTypeDistribution();
        // this.chartHandle();
      },
      // 根据选中的区域搜索
      searchChange() {
        this.isRoomType = false;
        this.isDeviceType = false;
        this.initData();
      },
      // 根据选中的时间搜索告警房间、告警设备、告警名称
      searchTimeChange() {
        this.getAlarmRoomList();
        this.getAlarmDeviceTypeList();
        this.getAlarmRuleList();
      },
      // 显示隐藏房间类型图表或表格
      roomTypeShow() {
        this.isRoomType = !this.isRoomType;
      },
      // 显示隐藏设备类型图表或表格
      deviceTypeShow() {
        this.isDeviceType = !this.isDeviceType;
      },
      // 渲染图表前先把百分比少于0.02的数据归类到其他中
      chartDataHandle(data = []) {
        if (data.length < 0) return [];
        const newData = [];
        const otherObj = {
          item: '其他',
          count: 0,
          percent: 0
        };
        data.forEach(item => {
          if (item.percent < 0.02) {
            otherObj.count = (item.count || 0) + otherObj.count;
            otherObj.percent = (item.percent || 0) + otherObj.percent;
          } else {
            newData.push(item);
          }
        });
        if (otherObj.count > 0) {
          newData.push(otherObj);
        }
        return newData || [];
      },
      // 告警趋势图
      alarmTrendChartHandle() {
        if (Object.keys(this.alarmTrendChart).length > 0) {
          this.alarmTrendChart.destroy();
        }
        // region *****告警趋势图*****
        this.alarmTrendChart = new Chart({
          container: 'alarmTrend',
          forceFit: true,
          padding: ['auto', 'auto', 'auto', 'auto'],
          height: window.innerHeight - 800 < 300 ? '300' : window.innerHeight - 800
        });
        this.alarmTrendChart.source(this.alarmTrendData);
        this.alarmTrendChart.scale({
          // value: {
          //   min: 1
          // },
          name: {
            range: [0, 1]
          }
        });
        this.alarmTrendChart.axis('count', {
          label: {
            formatter: function formatter(val) {
              return val;
            }
          }
        });
        this.alarmTrendChart.tooltip({
          crosshairs: {
            type: 'line'
          }
        });
        // 自定义tooltip显示内容
        this.alarmTrendChart.on('tooltip:change', function(ev) {
          const items = ev.items;
          const origin = items[0];
          items.splice(0);
          items.push({
            ...origin,
            name: '告警次数：',
            value: origin.value
          });
        });
        this.alarmTrendChart.line().position('name*count').color('#FCD27E');
        // 节点圆圈
        this.alarmTrendChart.point().position('name*count').size(3).color('#EBEBEB').shape('circle').style({
          stroke: '#FAAD14',
          lineWidth: 1
        });
        this.alarmTrendChart.area().position('name*count').color('#FEEAC2');
        this.alarmTrendChart.render();
        // endregion
      },
      // 房间类型及分布区域图和房间类型数量饼状图
      roomNumberChartHandle() {
        // region *****房间类型及分布区域图*****
        if (Object.keys(this.roomNumberChart).length > 0) {
          this.roomNumberChart.destroy();
        }
        this.roomNumberChart = new Chart({
          container: 'roomNumber',
          forceFit: true,
          padding: ['auto', 'auto', 'auto', 'auto'], // ['auto', 'auto', 'auto', 100]
          height: window.innerHeight - 550 < 320 ? '320' : window.innerHeight - 550
        });
        this.roomNumberChart.source(this.roomNumberData);
        this.roomNumberChart.axis('name', {
          label: {
            offset: 12
          }
        });
        // 自定义tooltip显示内容
        this.roomNumberChart.on('tooltip:change', function(ev) {
          const items = ev.items;
          const origin = items[0];
          items.splice(0);
          items.push({
            ...origin,
            name: '房间数量：',
            value: origin.value
          });
        });
        this.roomNumberChart.coord().transpose();
        this.roomNumberChart.interval().position('name*count').size(20).label('count', {
          style: {
            fill: '#8d8d8d'
          },
          offset: 10
        });
        this.roomNumberChart.render();
        // endregion

        // region *****房间类型数量饼状图*****
        if (Object.keys(this.roomTypeChart).length > 0) {
          this.roomTypeChart.destroy();
        }
        this.roomTypeChart = new Chart({
          container: 'roomType',
          forceFit: true,
          height: window.innerHeight - 550 < 320 ? '320' : window.innerHeight - 550,
          animate: false,
          padding: ['auto', 'auto', 'auto', 'auto']
        });
        const roomTypeData = this.chartDataHandle(this.roomTypeData);
        this.roomTypeChart.source(roomTypeData, {
          percent: {
            formatter: function formatter(val) {
              val = (val * 100).toFixed(2) + '%';
              return val;
            }
          }
        });
        this.roomTypeChart.coord('theta', {
          radius: 0.6,
          innerRadius: 0.6
        });
        this.roomTypeChart.tooltip({
          showTitle: false,
          itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
        });
        // 辅助文本
        this.roomTypeChart.guide().html({
          position: ['50%', '50%'],
          html: `<div style="color:#8c8c8c;font-size: 12px;text-align: center;width: 10em;">房间数量<br><span style="color:#1A1A1A;font-weight:bold;font-size:24px">${this.roomCount}</span></div>`,
          alignX: 'middle',
          alignY: 'middle'
        });
        this.roomTypeChart.intervalStack().position('percent').color('item').label('percent', {
          formatter: function formatter(val, item) {
            return item.point.item + ': ' + val;
          }
        }).style({
          lineWidth: 1,
          stroke: '#fff'
        });
        // 自定义tooltip显示内容
        this.roomTypeChart.on('tooltip:change', function(ev) {
          const items = ev.items;
          const origin = items[0];
          items.splice(0);
          items.push({
            ...origin,
            name: '房间类型',
            value: origin.point.point.item
          });
          items.push({
            ...origin,
            name: '房间数量',
            value: origin.point.point.count
          });
          items.push({
            ...origin,
            name: '占比率',
            value: (origin.point.point.percent * 100).toFixed(2) + '%'
          });
        });
        this.roomTypeChart.render();
        // region 注释代码
        // this.roomTypeChart = new Chart({
        //   container: 'roomType',
        //   forceFit: true,
        //   height: window.innerHeight - 480 < 320 ? '320' : window.innerHeight - 480,
        //   animate: false
        // });
        // this.roomTypeChart.source(this.roomTypeData, {
        //   percent: {
        //     formatter: function formatter(val) {
        //       val = (val * 100).toFixed(2) + '%';
        //       return val;
        //     }
        //   }
        // });
        // this.roomTypeChart.coord('theta', {
        //   radius: 0.75,
        //   innerRadius: 0.6
        // });
        // this.roomTypeChart.tooltip({
        //   showTitle: false,
        //   itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
        // });
        // // 辅助文本
        // this.roomTypeChart.guide().html({
        //   position: ['50%', '50%'],
        //   html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">房间数量<br><span style="color:#8c8c8c;font-size:20px">${this.roomCount}</span></div>`,
        //   alignX: 'middle',
        //   alignY: 'middle'
        // });
        // this.roomTypeChart.intervalStack().position('percent').color('item').label('percent', {
        //   offset: -5,
        //   textStyle: {
        //     fill: 'rgba(0, 0, 0, .45)',
        //     fontSize: 12,
        //     shadowBlur: 2,
        //     shadowColor: 'rgba(0, 0, 0, .45)'
        //   },
        //   formatter: function formatter(val, item) {
        //     return val;
        //   }
        // }).style({
        //   lineWidth: 1,
        //   stroke: '#fff'
        // });
        // // 自定义tooltip显示内容
        // this.roomTypeChart.on('tooltip:change', function(ev) {
        //   const items = ev.items;
        //   const origin = items[0];
        //   items.splice(0);
        //   items.push({
        //     ...origin,
        //     name: '房间类型：',
        //     value: origin.point.point.item
        //   });
        //   items.push({
        //     ...origin,
        //     name: '房间数量：',
        //     value: origin.point.point.count
        //   });
        //   items.push({
        //     ...origin,
        //     name: '占比率：',
        //     value: (origin.point.point.percent * 100).toFixed(2) + '%'
        //   });
        // });
        // this.roomTypeChart.render();
        // endregion
      },
      // 设备类型及分布区域图和设备数量饼状图
      deviceTypeChartHandle() {
        // region *****设备类型及分布区域图*****
        if (Object.keys(this.deviceNumberChart).length > 0) {
          this.deviceNumberChart.destroy();
        }
        this.deviceNumberChart = new Chart({
          container: 'deviceNumber',
          forceFit: true,
          padding: ['auto', 'auto', 'auto', 'auto'],
          height: window.innerHeight - 550 < 320 ? '320' : window.innerHeight - 550
        });
        this.deviceNumberChart.source(this.deviceNumberData);
        this.deviceNumberChart.axis('name', {
          label: {
            offset: 12
          }
        });
        // 自定义tooltip显示内容
        this.deviceNumberChart.on('tooltip:change', function(ev) {
          const items = ev.items;
          const origin = items[0];
          items.splice(0);
          items.push({
            ...origin,
            name: '设备数量：',
            value: origin.value
          });
        });
        this.deviceNumberChart.coord().transpose();
        this.deviceNumberChart.interval().position('name*count').size(20).label('count', {
          style: {
            fill: '#8d8d8d'
          },
          offset: 10
        });
        this.deviceNumberChart.render();
        // endregion

        // region *****设备数量饼状图*****
        if (Object.keys(this.deviceTypeChart).length > 0) {
          this.deviceTypeChart.destroy();
        }
        this.deviceTypeChart = new Chart({
          container: 'deviceType',
          forceFit: true,
          height: window.innerHeight - 550 < 320 ? '320' : window.innerHeight - 550,
          animate: false,
          padding: ['auto', 'auto', 'auto', 'auto']
        });
        const deviceTypeData = this.chartDataHandle(this.deviceTypeData);
        this.deviceTypeChart.source(deviceTypeData, {
          percent: {
            formatter: function formatter(val) {
              val = (val * 100).toFixed(2) + '%';
              return val;
            }
          }
        });
        this.deviceTypeChart.coord('theta', {
          radius: 0.6,
          innerRadius: 0.6
        });
        this.deviceTypeChart.tooltip({
          showTitle: false,
          itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
        });
        // 辅助文本
        this.deviceTypeChart.guide().html({
          position: ['50%', '50%'],
          html: `<div style="color:#8c8c8c;font-size: 12px;text-align: center;width: 10em;">设备数量<br><span style="color:#1A1A1A;font-weight:bold;font-size:24px">${this.deviceCount}</span></div>`,
          alignX: 'middle',
          alignY: 'middle'
        });
        this.deviceTypeChart.intervalStack().position('percent').color('item').label('percent', {
          formatter: function formatter(val, item) {
            return item.point.item + ': ' + val;
          }
        }).style({
          lineWidth: 1,
          stroke: '#fff'
        });
        // 自定义tooltip显示内容
        this.deviceTypeChart.on('tooltip:change', function(ev) {
          const items = ev.items;
          const origin = items[0];
          items.splice(0);
          items.push({
            ...origin,
            name: '设备类型',
            value: origin.point.point.item
          });
          items.push({
            ...origin,
            name: '设备数量',
            value: origin.point.point.count
          });
          items.push({
            ...origin,
            name: '占比率',
            value: (origin.point.point.percent * 100).toFixed(2) + '%'
          });
        });
        this.deviceTypeChart.render();
        // endregion
      },
      // 所有画布重新渲染
      chartHandle() {
        this.alarmTrendChartHandle();
        this.roomNumberChartHandle();
        this.deviceTypeChartHandle();
      },
      // 计算 table 最小高度
      getTableMinHeight() {
        if (!window.innerHeight) return '0px';
        this.tableMinHeight = (window.innerHeight - 782 < 318 ? '318' : window.innerHeight - 782) + 'px'; // '520px';
      },

      // 获取告警房间数量和上线房间数量
      getRoomNumber() {
        const param = {
          locationId: this.searchLocation || 0
        };
        API.dashboard.roomNumber(param).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp || {};
            this.dashboardTitleData[0].number = data.alarmRoomCount || 0;
            this.dashboardTitleData[0].compare = data.compare || 0;
            this.dashboardTitleData[2].number = data.onLineRoomCount || 0;
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取告警设备数量和上线设备数量
      getDeviceNumber() {
        const param = {
          locationId: this.searchLocation || 0
        };
        API.dashboard.deviceNumber(param).then(resp => {
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp || {};
            this.dashboardTitleData[1].number = data.alarmDeviceCount || 0;
            this.dashboardTitleData[1].compare = data.compare || 0;
            this.dashboardTitleData[3].number = data.onLineDeviceCount || 0;
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取告警房间top10列表
      getAlarmRoomList() {
        const param = this.timeChange(this.alarmRoomTime);
        param['locationId'] = this.searchLocation || 0;
        API.dashboard.alarmRoomList(param).then(resp => {
          if (checkRespCorrect(resp)) {
            this.alarmRoomData = this.dataProcessing(resp.data) || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取告警设备类型top10列表
      getAlarmDeviceTypeList() {
        const param = this.timeChange(this.alarmRoomTime);
        param['locationId'] = this.searchLocation || 0;
        API.dashboard.alarmDeviceTypeList(param).then(resp => {
          if (checkRespCorrect(resp)) {
            this.alarmDeviceTypeData = this.dataProcessing(resp.data) || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取告警名称top10列表
      getAlarmRuleList() {
        const param = this.timeChange(this.alarmRoomTime);
        param['locationId'] = this.searchLocation || 0;
        API.dashboard.alarmRuleList(param).then(resp => {
          if (checkRespCorrect(resp)) {
            this.alarmRuleData = this.dataProcessing(resp.data) || [];
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取告警曲线图
      getAlarmGraph() {
        const param = this.timeChange(this.alarmGraphTime);
        param['locationId'] = this.searchLocation || 0;
        this.alarmGraphLoading = true;
        API.dashboard.alarmGraph(param).then(resp => {
          this.alarmGraphLoading = false;
          if (checkRespCorrect(resp)) {
            const {data = []} = resp || {};
            this.alarmTrendData = data.map(item => {
              return {
                name: momentTimeToString(item.time, momentFormat.smsDate),
                count: parseInt(item.alarmCount) || 0
              };
            });
            this.alarmTrendChartHandle();
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.alarmGraphLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 获取房间类型及分布区域
      getRoomTypeDistribution() {
        const param = {
          locationId: this.searchLocation || 0
        };
        this.roomChartLoading = true;
        API.dashboard.roomTypeDistribution(param).then(resp => {
          this.roomChartLoading = false;
          if (checkRespCorrect(resp)) {
            const {roomCount = [], roomType = [], total = 0} = resp.data || {};
            this.roomNumberData = roomCount.map(item => {
              return {
                name: item.name || '',
                count: parseInt(item.roomCount) || 0
              };
            });
            this.roomTypeData = roomType.map(item => {
              return {
                item: item.roomType || '未分类',
                count: parseInt(item.count) || 0,
                percent: item.percentage || 0
              };
            });
            this.roomCount = total;
            this.roomTypeSpan = this.roomTypeData.length <= 0;
            setTimeout(() => {
              this.roomNumberChartHandle();
            }, 0);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.roomChartLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 设备类型及分布区域
      getDeviceTypeDistribution() {
        const param = {
          locationId: this.searchLocation || 0
        };
        this.deviceChartLoading = true;
        API.dashboard.deviceTypeDistribution(param).then(resp => {
          this.deviceChartLoading = false;
          if (checkRespCorrect(resp)) {
            const {locationForDeviceAmountExts = [], totalAmountAndPercentage = []} = resp.data || {};
            this.deviceNumberData = locationForDeviceAmountExts.map(item => {
              return {
                name: item.locationName || '',
                count: parseInt(item.deviceAmount) || 0
              };
            });
            this.deviceTypeData = (totalAmountAndPercentage.percentages || []).map(item => {
              return {
                item: item.categoryName || '未分类',
                count: parseInt(item.amount) || 0,
                percent: item.percent || 0
              };
            });
            this.deviceCount = totalAmountAndPercentage.totalDeviceAmount || 0;
            this.deviceTypeSpan = this.deviceTypeData.length <= 0;
            setTimeout(() => {
              this.deviceTypeChartHandle();
            }, 0);
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.deviceChartLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 数据处理
      dataProcessing(data = []) {
        if (data.length <= 0) return;
        (data).forEach((item, index) => {
          const number = parseInt(index + 1);
          item.imgUrl = require(`../../assets/img/alarm-icon-${number}.png`);
          switch (number) {
            case 1:
              item.colorClass = 'font-color-danger';
              break;
            case 2:
              item.colorClass = 'font-color-warning';
              break;
            case 3:
              item.colorClass = 'font-color-light-green';
              break;
            default:
              item.colorClass = 'font-gray-10';
              break;
          }
        });
        return data;
      },
      // 时间筛选处理
      timeChange(value) {
        let startTime = '';
        let endTime = '';
        switch (value) {
          case 'lastSevenDays':
            // 前7天
            startTime = moment().subtract(6, 'days').format(momentFormat.dateTimeDetail);
            endTime = moment().format(momentFormat.dateTimeDetail);
            break;
          case 'thisWeek':
            // 本周
            startTime = moment().week(moment().week()).startOf('week').format(momentFormat.dateTimeDetail);
            endTime = moment().week(moment().week()).endOf('week').format(momentFormat.dateTimeDetail);
            break;
          case 'lastWeek':
            // 上周
            startTime = moment().week(moment().week() - 1).startOf('week').format(momentFormat.dateTimeDetail);
            endTime = moment().week(moment().week() - 1).endOf('week').format(momentFormat.dateTimeDetail);
            break;
          case 'thisMonth':
            // 本月
            startTime = moment().month(moment().month()).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(moment().month()).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'lastMonth':
            // 上月
            startTime = moment().month(moment().month() - 1).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(moment().month() - 1).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'lastOneMonth':
            // 最近30天
            startTime = moment().subtract(29, 'days').format(momentFormat.dateTimeDetail);
            endTime = moment().format(momentFormat.dateTimeDetail);
            break;
          case 'january':
            // 一月
            startTime = moment().month(0).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(0).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'february':
            // 二月
            startTime = moment().month(1).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(1).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'march':
            // 三月
            startTime = moment().month(2).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(2).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'april':
            // 四月
            startTime = moment().month(3).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(3).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'may':
            // 五月
            startTime = moment().month(4).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(4).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'june':
            // 六月
            startTime = moment().month(5).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(5).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'july':
            // 七月
            startTime = moment().month(6).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(6).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'august':
            // 八月
            startTime = moment().month(7).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(7).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'september':
            // 九月
            startTime = moment().month(8).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(8).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'october':
            // 十月
            startTime = moment().month(9).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(9).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'november':
            // 十一月
            startTime = moment().month(10).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(10).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          case 'december':
            // 十二月
            startTime = moment().month(11).startOf('month').format(momentFormat.dateTimeDetail);
            endTime = moment().month(11).endOf('month').format(momentFormat.dateTimeDetail);
            break;
          default:
            break;
        }
        return {startTime: startTime, endTime: endTime};
      }
    }
  };
</script>

<style scoped lang="less">

  .list-top {
    margin-top: 2px
  }

  .select-width {
    max-width: 110px;
  }

  .el-select-group__wrap {
    .el-select-group__title {
      font-size: 14px !important;
      color: @colorGray60 !important;
    }
  }

  .border-lft {
    border-left: 2px solid @colorDanger;
  }

  .alarm-room-class {
    // background: url(../../assets/img/alarm-room-bg-normal.png) right top no-repeat @colorWhite;
    background: @colorWhite;
    border-radius: @borderRadiusMain;
    opacity: 1;
    transition-duration: 0.5s;
  }

  .alarm-room-class:hover {
    //background: url(../../assets/img/alarm-room-bg-hover.png) right top no-repeat @colorDanger;

    //.alarm-title-hover {
    //color: @colorGray98 !important;
    //}
    box-shadow: 2px 4px 8px 2px @colorBlackAlpha1;

  }

  .col-class {
    padding-right: 10px;
    padding-top: 5px;
  }

  .col-class:hover {
    padding-right: 10px;
    padding-top: 2px;
  }

  .online-room-class {
    background: url(../../assets/img/online-room-bg-normal.png) right top no-repeat @colorWhite;
    border-radius: @borderRadiusSecond;
  }

  .alarm-device-class {
    background: url(../../assets/img/alarm-device-bg-normal.png) right top no-repeat @colorWhite;
    border-radius: @borderRadiusSecond;
    opacity: 1;
    transition-duration: 0.5s;
  }

  .alarm-device-class:hover {
    background: url(../../assets/img/alarm-device-bg-hover.png) right top no-repeat @colorDanger;

    .alarm-title-hover {
      color: @colorGray98 !important;
    }
  }

  .online-device-class {
    background: url(../../assets/img/online-device-bg-normal.png) right top no-repeat @colorWhite;
    border-radius: @borderRadiusSecond;
  }

  .letter-spacing {
    letter-spacing: 1px;
  }

  .box-shadow {
    box-shadow: 0 2px 4px 0 @colorBlackAlpha05;
  }

  .alarm-detail-content {
    border-radius: 2px 2px 0px 0px;
    background-color: @colorWhite;
    padding: 20px 24px 10px 24px;
  }

  .area-row {
    position: fixed;
    z-index: 999999;
  }

</style>
