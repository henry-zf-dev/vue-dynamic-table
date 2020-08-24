<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="supConFrom.deviceEsn"
      :subtitle="subtitle"></Breadcrumb>
    <div class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs">
          <div slot="subCtrInfo-tab">
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
import { checkRespCorrect, messageHandle, judgePermission, momentTimeToString } from '../../../utils';
import { commonString, msgCode, msgContent } from '../../../config/string';
import { permissionConfig } from '../../../config/permission';
import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
import DetailPageLayout from '../../../components/DetailPageLayout';

export default {
  name: 'SubControlDetail',
  components: {
    Breadcrumb, DetailPageLayout
  },
  data() {
    return {
      pageLoading: true,
      breadcrumbHeight: 0,
      pageTabs: [
        {
          value: 'subCtrInfo-tab',
          label: '分控详情'
        }
      ],
      supConId: '',
      supConFrom: {},
      baseInfoTableData: [
        {
          title: '别名',
          key: 'name',
          value: ''
        },
        {
          title: '类型',
          key: 'type',
          value: ''
        },
        {
          title: 'esn',
          key: 'deviceEsn',
          value: ''
        },
        {
          title: 'token',
          key: 'deviceToken',
          value: ''
        },
        {
          title: '地址',
          key: 'centralControlUrl',
          value: ''
        },
        {
          title: '版本号',
          key: 'version',
          value: ''
        },
        {
          title: '最大房间容量',
          key: 'roomLimit',
          value: ''
        },
        {
          title: '已用房间容量',
          key: 'roomCount',
          value: ''
        },
        {
          title: '最大设备数量',
          key: 'deviceLimit',
          value: ''
        },
        {
          title: '已用设备数量',
          key: 'deviceCount',
          value: ''
        },
        {
          title: '最后连接时间',
          key: 'lastActiveTime',
          value: ''
        }, {
          title: '备注',
          key: 'remark',
          value: ''
        }, {
          title: '状态',
          key: 'disableName',
          value: ''
        }
      ]
    };
  },
  computed: {
    subtitle() {
      return {
        ...this.supConFrom,
        title: '分控',
        show: true
      };
    },
    breadcrumbOpts() {
      const breadcrumb = [];
      const enable = Object.values(commonString.configEnable).find(e => {
        return this.supConFrom.isEnable !== e.value;
      }) || {};
      breadcrumb.push({
        type: 'btn',
        label: enable.label || commonString.unknown,
        icon: enable.icon || '',
        perm: permissionConfig.system,
        callback: () => {
          this.supConEnableStatus(this.supConFrom, enable);
        }
      });
      return breadcrumb;
    }
  },
  created() {
    this.supConId = this.$route.params.sid || '';
    this.getSubCtrDetail();
  },
  methods: {
    judgePerm: judgePermission,
    getSubCtrDetail() { // 获取详情
      this.pageLoading = true;
      API.subControl.subControlDetail({ id: this.supConId }).then(resp => {
        this.pageLoading = false;
        if (checkRespCorrect(resp)) {
          const { data = {} } = resp;
          this.supConFrom = {
            ...data,
            disableName: data.isEnable === 'Y' ? '启用' : '禁用',
            centralControlUrl: data.centralControlUrl ? data.centralControlUrl : '未知',
            createdTime: momentTimeToString(data.createdTime),
            updatedTime: momentTimeToString(data.updatedTime),
            lastActiveTime: momentTimeToString(data.lastActiveTime),
            roomLimit: data.roomLimit ? data.roomLimit : '未知',
            roomCount: data.roomCount ? data.roomCount : '未知',
            deviceLimit: data.deviceLimit ? data.deviceLimit : '未知',
            deviceCount: data.deviceCount ? data.deviceCount : '未知'
          };
          this.baseInfoTableData.forEach(item => {
            item.value = this.supConFrom[item.key] || '';
          });
        } else {
          messageHandle({ code: resp.code, msg: resp.message || msgContent.QUERY });
        }
      }).catch(err => {
        this.pageLoading = false;
        messageHandle({ code: msgCode.SYSTEM });
      });
    },
    supConEnableStatus(command, enableConfig = {}) { // 启用停用
      this.$confirm('确认要' + enableConfig.label + '分控' + this.supConFrom.deviceEsn + '吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        const params = {
          isEnable: enableConfig.value,
          id: this.supConId
        };
        API.subControl.subControlDelete(params).then(resp => {
          if (checkRespCorrect(resp)) {
            messageHandle({ code: msgCode.EDIT_SAVE, msg: '分控' + enableConfig.label + '成功' });
            this.getSubCtrDetail();
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
