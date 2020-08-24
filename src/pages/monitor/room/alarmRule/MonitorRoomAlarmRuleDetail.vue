<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="alarmData.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="alarmRuleInfo-tab">
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
                    <div v-if="scope.row.key==='ruleList'">
                      <div v-for="(rule,index) in (scope.row.value||[])" :key="index">
                        <span class="header7 font-gray-40">{{ rule.name }}</span>
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
  import {permissionConfig} from '../../../../config/permission';
  import {checkRespCorrect, judgePermission, messageHandle, momentTimeToString} from '../../../../utils';
  import {momentFormat} from '../../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../../config/string';
  import {routerMeta} from '../../../../router/routerMeta';
  import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
  import DetailPageLayout from '../../../../components/DetailPageLayout';

  export default {
    name: 'MonitorRoomAlarmRuleDetail',
    components: {
      Breadcrumb, DetailPageLayout
    },
    data() {
      return {
        pageLoading: true,
        breadcrumbHeight: 0,
        pageTabs: [
          {
            value: 'alarmRuleInfo-tab',
            label: '告警规则详情'
          }
        ],
        alarmData: {},
        roomId: '',
        alarmId: '',
        isAlarm: '',
        baseInfoTableData: [
          {
            title: '名称',
            key: 'name',
            value: ''
          },
          {
            title: '触发条件',
            key: 'existCondition',
            value: ''
          },
          {
            title: '告警项',
            key: 'alarmContent',
            value: ''
          },
          {
            title: '异常条件',
            key: 'runModeContent',
            value: ''
          },
          {
            title: '告警级别',
            key: 'level',
            value: ''
          },
          {
            title: '启用状态',
            key: 'isEnableName',
            value: ''
          },
          {
            title: '沉默周期',
            key: 'silenceCycle',
            value: ''
          },
          {
            title: '通知方式',
            key: 'notificationWay',
            value: ''
          },
          {
            title: '通知日期',
            key: 'daysOfWeekName',
            value: ''
          },
          {
            title: '通知时间',
            key: 'time',
            value: ''
          },
          {
            title: '告警解决方法',
            key: 'solutionName',
            value: ''
          },
          {
            title: '备注',
            key: 'remark',
            value: ''
          }
        ]
      };
    },
    computed: {
      subtitle() {
        return {
          ...this.alarmData,
          title: '房间告警规则',
          show: true
        };
      },
      breadcrumbOpts() {
        const breadcrumb = [
          {
            type: 'btn',
            label: '编辑',
            icon: 'icon-bianji',
            perm: this.isAlarm ? permissionConfig.system : permissionConfig.monitorRoomAlarmManage,
            callback: () => {
              this.roomAlarmEdit();
            }
          },
          {
            type: 'btn',
            label: '删除',
            icon: 'icon-shanchu',
            perm: this.isAlarm ? permissionConfig.system : permissionConfig.monitorRoomAlarmDelete,
            callback: () => {
              this.roomAlarmDelete();
            }
          }
        ];
        const enable = Object.values(commonString.configEnable).find(e => {
          return this.alarmData.isEnable !== e.value;
        }) || {};
        breadcrumb.push({
          type: 'btn',
          label: enable.label || commonString.unknown,
          icon: enable.icon || '',
          perm: this.isAlarm ? permissionConfig.system : permissionConfig.monitorRoomAlarmManage,
          callback: () => {
            this.modifyEnableStatus(this.alarmData, enable);
          }
        });
        return breadcrumb;
      }
    },
    created() {
      this.roomId = this.$route.params.rid || '';
      this.alarmId = this.$route.params.aid || '';
      this.isAlarm = this.$route.params.isAlarm || ''; // 用于判断权限和跳转，是否从告警规则菜单跳转的
      this.getAlarmRuleDetail();
    },
    methods: {
      judgePerm: judgePermission,
      getAlarmRuleDetail() {
        this.pageLoading = true;
        API.alarmRule.roomAlarmRuleDetail({id: this.alarmId, roomId: this.roomId}).then(resp => {
          this.pageLoading = false;
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {detection = {}, solution = {}} = data;
            this.alarmData = {
              ...data,
              createdTime: momentTimeToString(data.createdTime),
              updatedTime: momentTimeToString(data.updatedTime),
              isEnableName: data.isEnable === 'Y' ? '启用' : '禁用',
              existCondition: data.existCondition === 'Y' ? '有' : '无',
              level: data.level === 'high' ? '紧急' : '一般',
              silenceCycle: data.silenceCycle + '分钟',
              runModeContent: data.duration <= 0 ? '只要有异常' : `持续异常${data.duration || ''}分钟`,
              notificationWay: (data.notificationWay || []).map(item => {
                return item === 'sms' ? '短信' : (item === 'email' ? '邮件' : 'TT');
              }).join('、'),
              alarmContent: `${detection.deviceName || ''} ${detection.stateName || ''} ${detection.operatorsName || ''} ${detection.expectedValueName || ''}`,
              daysOfWeekName: (data.daysOfWeek || []).map(item => {
                let name = '';
                switch (item) {
                  case '1':
                    name = '星期一';
                    break;
                  case '2':
                    name = '星期二';
                    break;
                  case '3':
                    name = '星期三';
                    break;
                  case '4':
                    name = '星期四';
                    break;
                  case '5':
                    name = '星期五';
                    break;
                  case '6':
                    name = '星期六';
                    break;
                  case '7':
                    name = '星期天';
                    break;
                  default:
                    break;
                }
                return name;
              }).join('、'),
              time: '每天 ' + data.startTime + ' 至 ' + data.endTime,
              solutionName: solution.description || '',
              remark: data.remark || ''
            };
            this.baseInfoTableData.forEach(item => {
              item.value = this.alarmData[item.key] || '';
            });
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
          }
        }).catch(err => {
          this.pageLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      roomAlarmEdit() { // 编辑
        if (this.isAlarm) { // todo 用于判断权限和跳转，是否从告警规则菜单跳转的
          this.$router.push({
            name: routerMeta.systemRoomAlarmListEdit.name,
            params: {
              aid: this.alarmId,
              rid: this.roomId
            }
          });
        } else {
          this.$router.push({
            name: routerMeta.monitorRoomAlarmEdit.name,
            params: {
              aid: this.alarmId,
              rid: this.roomId
            }
          });
        }
      },
      // 修改启用/禁用状态
      modifyEnableStatus(row, enableConfig = {}) {
        this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            isEnable: enableConfig.value,
            id: row.id
          };
          API.alarmRule.alarmRuleEnable(params).then(resp => {
            if (checkRespCorrect(resp)) {
              this.getAlarmRuleDetail();
              messageHandle({code: msgCode.EDIT_SAVE, msg: '房间告警规则' + enableConfig.label + '成功'});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      },
      roomAlarmDelete() { // 房间告警删除
        this.$confirm(`确定要删除告警规则：${this.alarmData.name}吗?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.alarmRule.roomAlarmRuleDeleteById({id: this.alarmId, roomId: this.roomId}).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.DEL_SAVE, msg: '房间告警规则删除成功'});
              if (this.isAlarm) { // todo 用于判断权限和跳转，是否从告警规则菜单跳转的
                this.$router.push({
                  name: routerMeta.roomAlarmRole.name,
                  params: this.$route.params
                });
              } else {
                this.$router.push({
                  name: routerMeta.monitorRoomAlarm.name,
                  params: this.$route.params
                });
              }
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      }
    }
  };
</script>

<style scoped>

</style>
