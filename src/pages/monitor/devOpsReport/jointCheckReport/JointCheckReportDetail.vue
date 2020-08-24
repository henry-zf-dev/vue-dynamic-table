<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :title="jointCheckData.jointCheckName"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="jointCheckInfo-tab">
            <div class="page-detail-table">
              <el-table
                :show-header="false"
                :data="baseInfoTableData">
                <el-table-column
                  prop="title"
                  label="key">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <span v-if="scope.row.key==='remark'" class="header7">{{ scope.row.value }}</span>
                    <span v-else :class="scope.row.value?'font-color-success':'font-color-danger'" class="header7">{{ scope.row.value?'通过':'不通过' }}</span>
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
import { commonString, msgCode, msgContent } from '../../../../config/string';
import { checkRespCorrect, messageHandle, momentTimeToString } from '../../../../utils';
import Breadcrumb from '../../../../components/breadcrumb/Breadcrumb';
import DetailPageLayout from '../../../../components/DetailPageLayout';

export default {
  name: 'JointCheckReportDetail',
  components: {
    Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'jointCheckInfo-tab',
          label: '联检情况'
        }
      ],
      jointCheckData: {},
      reportId: '',
      tableMinHeight: '',
      baseInfoTableData: [
        {
          title: '',
          key: 'level',
          value: ''
        }
      ]
    };
  },
  computed: {
    subtitle() {
      return {
        show: true,
        text: `联检时间：${this.jointCheckData.createdTime}`
      };
    }
  },
  created() {
    this.reportId = this.$route.params.jid || '';
    this.getJointCheckDetail();
  },
  methods: {
    getJointCheckDetail() {
      this.pageLoading = true;
      API.room.roomJointCheckDetail({ id: this.reportId }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.jointCheckData = {
            ...data,
            jointCheckName: data['jointInspectionName'] || commonString.unknown,
            createdTime: momentTimeToString(data.createdTime)
          };
          this.baseInfoTableData = (data.report || []).map(item => {
            return {
              title: `${item.deviceName || ''}${item.stateName || ''}${item.operatorsName || ''}${item.expectedValueName || ''}`,
              key: 'flagtext',
              value: item.flag
            };
          });
          this.baseInfoTableData.push({
            title: '备注',
            key: 'remark',
            value: data.remark || ''
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    }
  }
};
</script>

<style scoped lang="less">
</style>
