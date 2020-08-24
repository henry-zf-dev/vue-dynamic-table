<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="deviceForm.name"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="baseInfo-tab">
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
          <div slot="extentInfo-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="deviceForm.schema">
                <el-table-column
                  prop="name"
                  width="320"
                  label="name">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <span class="header7 font-gray-40">{{ scope.row[scope.row.mark]==='true'?'是':(scope.row[scope.row.mark]==='false'?'否':scope.row[scope.row.mark]) }}</span>
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
import { routerMeta } from '../../../router/routerMeta';
import { checkRespCorrect, judgePermission, messageHandle, momentTimeToString } from '../../../utils';
import { commonString, msgCode, msgContent } from '../../../config/string';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import DetailPageLayout from '../../../components/DetailPageLayout';

export default {
  name: 'DeviceDetail',
  components: {
    Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'baseInfo-tab',
          label: '基本信息'
        },
        {
          value: 'extentInfo-tab',
          label: '设备详情'
        }
      ],
      deviceForm: {},
      deviceParams: {},
      baseInfoTableData: [
        {
          title: '品牌',
          key: 'brandName',
          value: ''
        },
        {
          title: '系列',
          key: 'seriesName',
          value: ''
        },
        {
          title: '型号',
          key: 'modelName',
          value: ''
        },
        {
          title: 'IP',
          key: 'ipContent',
          value: ''
        },
        {
          title: '序列号',
          key: 'serialNumber',
          value: ''
        },
        {
          title: 'mac地址',
          key: 'mac',
          value: ''
        },
        {
          title: '固件版本',
          key: 'firmwareVersion',
          value: ''
        },
        {
          title: '所属房间',
          key: 'areaRoomName',
          value: ''
        }
      ]
    };
  },
  computed: {
    subtitle() {
      return {
        ...this.deviceForm,
        createdPerson: '系统',
        title: '设备',
        show: true
      };
    },
    breadcrumbOpts() {
      return [
        {
          type: 'btn',
          label: '编辑',
          icon: 'icon-bianji',
          callback: () => {
            this.goEdit();
          }
        }
      ];
    }
  },
  created() {
    this.deviceParams = { ...this.$route.params };
    this.getDeviceDetail();
  },
  methods: {
    judgePerm: judgePermission,
    getDeviceDetail() {
      this.pageLoading = true;
      API.device.deviceDetail(this.deviceParams).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          const { additionalInfo = {} } = data;
          this.deviceForm = {
            ...data,
            createdTime: momentTimeToString(data.createdTime),
            updatedTime: momentTimeToString(data.updatedTime),
            areaRoomName: (data.roomLocationName || '') + '-' + (data.roomName || ''),
            firmwareVersion: additionalInfo.firmwareVersion || '',
            mac: additionalInfo.mac || '',
            serialNumber: additionalInfo.serialNumber || '',
            ipContent: __.pluck(data.ipParam || [], 'remoteIP').join('、')
          };
          this.baseInfoTableData.forEach(item => {
            item.value = this.deviceForm[item.key] || '';
          });
          this.deviceForm.schema = (data.schema || []).map(item => {
            let dataArray = data.serverExt ? data.serverExt[item.mark] : '';
            if (data instanceof Array) {
              dataArray = dataArray.join(',');
            }
            return {
              ...item,
              [item.mark]: dataArray,
              name: item.name + '：'
            };
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    goEdit() {
      this.$router.push({
        name: routerMeta.managementDeviceEdit.name,
        params: {
          did: this.deviceParams.did
        }
      });
    }
  }
};
</script>

<style scoped>

</style>
