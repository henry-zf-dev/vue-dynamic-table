<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="selfCheckData.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="selfCheckRuleInfo-tab">
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
                    <span class="header7 font-gray-40">{{ scope.row.value }}</span>
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
  name: 'MonitorRoomSelfCheckRuleDetail',
  components: {
    Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'selfCheckRuleInfo-tab',
          label: '自检规则详情'
        }
      ],
      selfCheckData: {},
      roomId: '',
      ruleId: '',
      isCheck: '',
      baseInfoTableData: [
        {
          title: '名称',
          key: 'name',
          value: ''
        },
        {
          title: '触发条件',
          key: 'sceneName',
          value: ''
        },
        {
          title: '设备名称',
          key: 'deviceName',
          value: ''
        },
        {
          title: '设备自检项',
          key: 'stateName',
          value: ''
        },
        {
          title: '设备正常值',
          key: 'operatorsName',
          value: ''
        },
        {
          title: '异常条件',
          key: 'duration',
          value: ''
        },
        {
          title: '启用状态',
          key: 'isEnableName',
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
        ...this.selfCheckData,
        title: '房间自检规则',
        show: true
      };
    },
    breadcrumbOpts() {
      const breadcrumb = [
        {
          type: 'btn',
          label: '编辑',
          icon: 'icon-bianji',
          perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomSelfCheckManage,
          callback: () => {
            this.selfCheckEdit();
          }
        },
        {
          type: 'btn',
          label: '删除',
          icon: 'icon-shanchu',
          perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomSelfCheckDelete,
          callback: () => {
            this.selfCheckDelete();
          }
        }
      ];
      const enable = Object.values(commonString.configEnable).find(e => {
        return this.selfCheckData.isEnable !== e.value;
      }) || {};
      breadcrumb.push({
        type: 'btn',
        label: enable.label || commonString.unknown,
        icon: enable.icon || '',
        perm: this.isCheck ? permissionConfig.system : permissionConfig.monitorRoomSelfCheckManage,
        callback: () => {
          this.selfCheckEnable(this.selfCheckData, enable);
        }
      });
      return breadcrumb;
    }
  },
  created() {
    this.roomId = this.$route.params.rid || '';
    this.ruleId = this.$route.params.sid || '';
    this.isCheck = this.$route.params.isCheck || '';// 用于判断权限和是否自检规则跳转过来
    this.getSelfCheckRuleDetail();
  },
  methods: {
    judgePerm: judgePermission,
    getSelfCheckRuleDetail() {
      this.pageLoading = true;
      API.selfCheckRule.roomSelfCheckRuleDetail({ roomId: this.roomId, ruleId: this.ruleId }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.selfCheckData = {
            ...data,
            createdTime: momentTimeToString(data.createdTime),
            updatedTime: momentTimeToString(data.updatedTime),
            isEnableName: data.isEnable === 'Y' ? '启用' : '禁用',
            sceneName: data.sceneName || '无',
            duration: data.duration > 0 ? '持续异常' + data.duration + '分钟' : '只要出现一次',
            operatorsName: (data.operatorsName || '') + data.expectedValueName,
            remark: data.remark || ''
          };
          this.baseInfoTableData.forEach(item => {
            item.value = this.selfCheckData[item.key] || '';
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    selfCheckEdit() { // 房间自检编辑
      if (this.isCheck) {
        this.$router.push({
          name: routerMeta.systemRoomSelfCheckListEdit.name,
          params: {
            rid: this.roomId,
            sid: this.ruleId
          }
        });
      } else {
        this.$router.push({
          name: routerMeta.monitorRoomSelfCheckEdit.name,
          params: {
            rid: this.roomId,
            sid: this.ruleId
          }
        });
      }
    },
    selfCheckEnable(row, enableConfig) { // 房间自检禁用/启用
      this.$confirm('确认要' + enableConfig.label + '' + row.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          ruleId: row.id,
          roomId: this.roomId
        };
        API.selfCheckRule.roomSelfCheckRuleEnable(params).then(resp => {
          if (checkRespCorrect(resp)) {
            this.getSelfCheckRuleDetail();
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '房间自检规则' + enableConfig.label + '成功' });
          } else {
            messageHandle({ code: resp.code, msg: resp.message || msgContent.MUTATION });
          }
        }).catch(err => {
          messageHandle({ code: msgCode.SYSTEM });
        });
      }).catch(err => {
      });
    },
    selfCheckDelete() {
      this.$confirm('确认要删除房间自检规则' + this.selfCheckData.name + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        API.selfCheckRule.roomSelfCheckRuleDelete({ ruleId: this.ruleId, roomId: this.roomId }).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.DEL_SAVE, msg: '房间自检规则删除成功' });
            if (this.isCheck) {
              this.$router.push({
                name: routerMeta.systemRoomSelfCheckList.name,
                params: this.$route.params
              });
            } else {
              this.$router.push({
                name: routerMeta.monitorRoomSelfCheck.name,
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
