<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :title="selfRuleData.alarmConfigName"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="alarmInfo-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="baseInfoTableData">
                <el-table-column
                  prop="title"
                  width="320"
                  label="key">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <div v-if="scope.row.key==='checkList'">
                      <div v-for="(item,index) in (scope.row.value||[])" :key="index">
                        <el-row>
                          <el-col :span="12">
                            <div class="header7 font-gray-40">{{ '['+(item.checkName||'')+']触发' }}
                              <span style="color: red">一次</span>
                            </div>
                          </el-col>
                          <el-col :span="12">
                            <div class="header7 font-gray-40">
                              <span class="pad-lft-30">时间：{{ item.createdTime }}</span>
                            </div>
                          </el-col>
                          <br>
                        </el-row>
                      </div>
                    </div>
                    <div v-else-if="scope.row.key==='level'">
                      <div class="header7 font-gray-40">
                        <TableCircle
                          :type="selfRuleData.level===commonString.alarmPriority.urgent.value?commonString.alarmPriority.urgent.type:'unknown'"></TableCircle>
                        {{
                          selfRuleData.level===commonString.alarmPriority.urgent.value?commonString.alarmPriority.urgent.label:commonString.alarmPriority.normal.label
                        }}
                      </div>
                    </div>
                    <div v-else>
                      <span class="header7 font-gray-40">{{ scope.row.value }}</span>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </DetailPageLayout>
      </div>
    </div>
  </div>
</template>

<script>
  import Breadcrumb from '../../components/breadcrumb/Breadcrumb';
  import {checkRespCorrect, messageHandle, momentTimeToString} from '../../utils';
  import {momentFormat} from '../../config/common';
  import {commonString, msgCode, msgContent} from '../../config/string';
  import TableCircle from '../../components/table/TableCircle';
  import DetailPageLayout from '../../components/DetailPageLayout';

  export default {
    name: 'AlarmRecordDetail',
    components: {
      Breadcrumb, TableCircle, DetailPageLayout
    },
    data() {
      return {
        commonString: commonString,
        breadcrumbHeight: 0,
        pageLoading: true,
        pageTabs: [
          {
            value: 'alarmInfo-tab',
            label: '告警详情'
          }
        ],
        selfRuleData: {},
        baseInfoTableData: [
          {
            title: '告警名称',
            key: 'alarmConfigName',
            value: ''
          },
          {
            title: '告警级别',
            key: 'level',
            value: ''
          },
          {
            title: '恢复类型',
            key: 'restoreSourceText',
            value: ''
          },
          {
            title: '设备IP',
            key: 'ipContent',
            value: ''
          },
          {
            title: '告警解决方案',
            key: 'solutionContent',
            value: ''
          },
          {
            title: '备注',
            key: 'remark',
            value: ''
          },
          {
            title: '房间',
            key: 'roomName',
            value: ''
          },
          {
            title: '区域',
            key: 'locationName',
            value: ''
          }
        ],
        alarmId: ''
      };
    },
    computed: {
      subtitle() {
        return {
          ...this.selfRuleData,
          title: '告警记录',
          show: true
        };
      }
    },
    created() {
      this.alarmId = this.$route.params.aid || '';
      this.deviceAlarmDetail();
    },
    methods: {
      deviceAlarmDetail() {
        this.pageLoading = true;
        API.alarm.deviceAlarmDetail({id: this.alarmId}).then(resp => {
          this.pageLoading = false;
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {solution = {}, ipParam = []} = data;
            this.selfRuleData = {
              ...resp.data,
              createdTime: momentTimeToString(data.createdTime),
              updatedTime: momentTimeToString(data.updatedTime),
              solutionContent: solution.description || '',
              restoreSourceText: data.restoreSource ? (data.restoreSource === 1 ? '系统恢复' : '手动恢复') : '',
              ipContent: __.pluck(ipParam, 'remoteIP').join('; '),
              remark: data.remark || ''
            };
            (this.baseInfoTableData || []).forEach(item => {
              item.value = this.selfRuleData[item.key] || '';
            });
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.pageLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      }
    }
  };
</script>

<style scoped lang="less">
  .row-hover:hover {
    background-color: @colorBgWhite;
  }
</style>
