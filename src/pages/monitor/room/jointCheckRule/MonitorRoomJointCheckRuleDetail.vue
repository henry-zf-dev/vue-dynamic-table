<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="jointCheckRuleData.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="jointCheckRuleInfo-tab">
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
                    <div v-if="scope.row.key==='rules'">
                      <div v-for="(rule,index) in (scope.row.value||[])" :key="index" class="mar-top">
                        <span class="header7 font-gray-70">{{ rule.deviceName }}{{ rule.stateName }}{{ rule.operatorsName }}{{ rule.expectedValueName }}</span>
                      </div>
                    </div>
                    <div v-else>
                      <span class="header7 font-gray-70">{{ scope.row.value }}</span>
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
import { permissionConfig } from '../../../../config/permission';
import { checkRespCorrect, judgePermission, messageHandle, momentTimeToString } from '../../../../utils';
import { momentFormat } from '../../../../config/common';
import { commonString, msgCode, msgContent } from '../../../../config/string';
import { routerMeta } from '../../../../router/routerMeta';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import DetailPageLayout from '../../../../components/DetailPageLayout';

export default {
  name: 'MonitorRoomJointCheckRuleDetail',
  components: {
    Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'jointCheckRuleInfo-tab',
          label: '联检规则详情'
        }
      ],
      jointCheckRuleData: {},
      roomId: '',
      id: '',
      isCheck: '',
      baseInfoTableData: [
        {
          title: '名称',
          key: 'name',
          value: ''
        },
        {
          title: '开始执行动作',
          key: 'beginSceneName',
          value: ''
        },
        {
          title: '执行延迟时间',
          key: 'delay',
          value: ''
        },
        {
          title: '检测项',
          key: 'rules',
          value: ''
        },
        {
          title: '联检时长',
          key: 'timeout',
          value: ''
        },
        {
          title: '结束执行动作',
          key: 'endSceneName',
          value: ''
        },
        {
          title: '启用状态',
          key: 'isEnableName',
          value: ''
        }
      ]
    };
  },
  computed: {
    subtitle() {
      return {
        ...this.jointCheckRuleData,
        title: '房间联检规则',
        show: true
      };
    },
    breadcrumbOpts() {
      const breadcrumb = [
        {
          type: 'btn',
          label: '编辑',
          icon: 'icon-bianji',
          perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomJointCheckRuleManage,
          callback: () => {
            this.jointCheckRuleEdit();
          }
        },
        {
          type: 'btn',
          label: '删除',
          icon: 'icon-shanchu',
          perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomJointCheckRuleDelete,
          callback: () => {
            this.jointCheckRuleDeletes();
          }
        }
      ];
      const enable = Object.values(commonString.configEnable).find(e => {
        return this.jointCheckRuleData.isEnable !== e.value;
      }) || {};
      breadcrumb.push({
        type: 'btn',
        label: enable.label || commonString.unknown,
        icon: enable.icon || '',
        perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomJointCheckRuleManage,
        callback: () => {
          this.jointCheckRuleEnables(this.jointCheckRuleData, enable);
        }
      });
      return breadcrumb;
    }
  },
  created() {
    this.roomId = this.$route.params.rid || '';
    this.id = this.$route.params.jid || '';
    this.isCheck = this.$route.params.isCheck || ''; // 用于判断权限和是否自检规则跳转过来
    this.getJointCheckRuleDetail();
  },
  methods: {
    judgePerm: judgePermission,
    getJointCheckRuleDetail() {
      this.pageLoading = true;
      API.jointCheckRule.jointCheckRuleDetail({ roomId: this.roomId, id: this.id }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.jointCheckRuleData = {
            ...data,
            createdTime: momentTimeToString(data.createdTime),
            updatedTime: momentTimeToString(data.updatedTime),
            delay: (data.delay || '0') + '秒',
            isEnableName: data.isEnable === 'Y' ? '启用' : '禁用',
            timeout: Math.floor(data.timeout / 60) + '分钟' + (data.timeout - Math.floor(data.timeout / 60) * 60) + '秒'
          };
          this.baseInfoTableData.forEach(item => {
            item.value = this.jointCheckRuleData[item.key] || '';
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    jointCheckRuleEdit() { // 房间联检编辑
      if (this.isCheck) {
        this.$router.push({
          name: routerMeta.systemRoomJointCheckRuleListEdit.name,
          params: {
            rid: this.roomId,
            sid: this.id,
            isCheck: this.isCheck
          }
        });
      } else {
        this.$router.push({
          name: routerMeta.monitorRoomJointCheckRuleEdit.name,
          params: {
            rid: this.roomId,
            jid: this.id
          }
        });
      }
    },
    jointCheckRuleEnables(row, enableConfig) { // 房间联检禁用/启用
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          id: row.id,
          roomId: this.roomId
        };
        API.jointCheckRule.jointCheckRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getJointCheckRuleDetail();
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '房间联检规则' + enableConfig.label + '成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    jointCheckRuleDeletes() { // 房间删除
      this.$confirm('确认要删除房间联检规则' + this.jointCheckRuleData.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.jointCheckRule.jointCheckRuleDelete({ id: this.id }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间联检规则删除成功' });
            if (this.isCheck) {
              this.$router.push({
                name: routerMeta.systemRoomJointCheckRuleList.name,
                params: this.$route.params
              });
            } else {
              this.$router.push({
                name: routerMeta.monitorRoomJointCheckRule.name,
                params: this.$route.params
              });
            }
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    }
  }
};
</script>

<style scoped>

</style>
