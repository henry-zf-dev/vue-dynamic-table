<template>
  <div class="device-management-page" style="padding-top: 60px">
    <Breadcrumb :opt-data="breadcrumbOpts"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :table-id="tableId"
          :filters="filters"
          :columns="columnConfig"
          :rows="deviceDataList"
          @filterChange="getDeviceList"
          @pageChanged="getDeviceList"
          @sizeChanged="getDeviceList"
          @sortChanged="getDeviceList">
          <div slot="customOpts">
            <el-tooltip :open-delay="300" content="设备Excel导出" placement="top">
              <el-button
                class="iconfont icon-zujiantubiao-daochu table-filter-opt-btn"
                @click="deviceExport">
              </el-button>
            </el-tooltip>
          </div>
        </EZTable>
      </div>
      <el-dialog
        :visible.sync="isLocalImport"
        :show-close="false"
        :close-on-press-escape="false"
        title="本地导入设备相关信息"
        width="500px">
        <DragFileUpload
          ref="deviceImportRef"
          :action-url="actionUrl"
          :auto-upload="false"
          :limit="1"
          accept=".json"
          up-load-title="设备文件"
          @fileUploadSuccess="deviceImportSuccess"></DragFileUpload>
        <!--        <div class="mar-top-10 mar-lft-30">-->
        <!--          <span class="mar-rgt-10">设备类型:</span>-->
        <!--          <el-select style="width: 285px" v-model="deviceType">-->
        <!--            <el-option value="category" label="设备类型"></el-option>-->
        <!--            <el-option value="brand" label="设备厂家"></el-option>-->
        <!--            <el-option value="model" label="设备型号"></el-option>-->
        <!--            <el-option value="series" label="设备系列"></el-option>-->
        <!--            <el-option value="general" label="通用命令"></el-option>-->
        <!--          </el-select>-->
        <!--        </div>-->
        <FormOptBtn
          :is-in-dialog="true"
          class="mar-top-20"
          @formCancel="closeDialog"
          @formSubmit="deviceImportSubmit"></FormOptBtn>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import {
    checkRespCorrect,
    messageHandle,
    deepCopyWithJson,
    getTableState,
    updateTableState,
    assembleTableOptBtn,
    getGeneralStatus,
    getTableConfig,
    momentTimeToString, getTableCfgFromStorage, downloadFileApi
  } from '../../../utils';
  import {
    commonConfig,
    fileDownloadApi,
    fileUploadApi,
    momentFormat,
    tableIdConfig,
    tableOptBtnConfig
  } from '../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import {permissionConfig} from '../../../config/permission';
  import {StorageKey, getStorage} from '../../../config/sessions';
  import {routerMeta} from '../../../router/routerMeta';
  import {getUserInfo} from '../../../utils';
  import {baseUrl} from '../../../config/env';
  import DragFileUpload from '../../../components/DragFileUpload';
  import FormOptBtn from '../../../components/FormOptBtn';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import EZTable from '../../../components/table/EZTable';
  import moment from 'moment';

  export default {
    name: 'DeviceManagement',
    components: {
      DragFileUpload, FormOptBtn, Breadcrumb, EZTable
    },
    data() {
      return {
        tableId: tableIdConfig.managerDevice,
        columnConfig: [],
        actionUrl: fileUploadApi.deviceSync,
        commonString: commonString,
        headersUpload: '',
        isLocalImport: false,
        deviceType: '', // 导入类型
        deviceDataList: [], // 设备列表
        tableLoading: true,
        filters: []
      };
    },
    computed: {
      breadcrumbOpts() {
        return [
          {
            type: 'dropdown',
            label: '设备导入',
            icon: 'icon-bendidaoru',
            perm: permissionConfig.managementDevice,
            items: [
              {
                label: '本地导入',
                icon: 'icon-bendidaoru',
                command: 'local'
              }
            ],
            callback: (command) => {
              this.deviceImport(command);
            }
          }
        ];
      }
    },
    activated() {
      this.headersUpload = {'token': getUserInfo().token};
      this.initTableConfig();
      this.getDeviceList();
    },
    methods: {
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.deviceDetail(data);
                break;
              case tableOptBtnConfig.edit.type:
                this.editDevice(data);
                break;
              default:
                break;
            }
          });
        };
        assembleConfig(getTableCfgFromStorage(this.tableId));
        getTableConfig(this.tableId).then((config) => {
          assembleConfig(config);
        }).catch(err => {
        });
      },
      closeDialog() {
        this.isLocalImport = false;
      },
      getDeviceList() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters = [], sort = []} = getTableState(this.tableId);
        const searchBox = {
          pageNo, pageSize, filters, sort
        };
        API.device.deviceList(searchBox).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items = [], pageInfo = {}} = resp.data || {};
            // 设备在线状态
            const connValues = Object.values(commonString.connectionStatus);
            this.deviceDataList = items.map(device => {
                const connectionStatus = connValues.find(c => {
                  return c.value === device.isOnline;
                }) || {};
                const {serverExt = {}} = device;
                return {
                  ...device,
                  ...serverExt,
                  isOnlineText: connectionStatus.label,
                  isOnlineIcon: connectionStatus.icon,
                  updatedTime: momentTimeToString(device.updatedTime)
                };
              }
            );
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({
                code: resp.code, msg: resp.message || msgContent.QUERY
              }
            );
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      deviceDetail(row) {
        this.$router.push({
          name: routerMeta.managementDeviceDetail.name,
          params: {
            did: row.id
          }
        });
      },
      editDevice(row) {
        this.$router.push({
          name: routerMeta.managementDeviceEdit.name,
          params: {
            did: row.id
          }
        });
      },
      // 设备导入相关
      deviceImport(command) {
        switch (command) {
          case 'cloud':
            API.setting.deviceSync().then(resp => {
              if (checkRespCorrect(resp)) {
                this.getDeviceList();
                messageHandle({code: resp.code, msg: '云端同步设备库成功'});
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              messageHandle({code: msgCode.SYSTEM});
            });
            break;
          case 'local':
            this.isLocalImport = true;
            break;
          default:
            break;
        }
      },
      deviceImportSubmit() {
        const upload = this.$refs['deviceImportRef'];
        if (!upload) return;
        upload.uploadSubmit();
      },
      deviceImportSuccess(res, file) { // 上传设备文件成功file
        if (checkRespCorrect(res)) {
          messageHandle({code: res.code, msg: '设备文件导入成功'});
          this.closeDialog();
          this.getDeviceList();
        } else {
          messageHandle({code: res.code, msg: res.message || msgContent.UPLOAD});
        }
      },
      // 设备Excel导出
      deviceExport() {
        const {filters = []} = getTableState(this.tableId);
        const param = {
          data: {
            filters: filters
          }
        };
        downloadFileApi(fileDownloadApi.exportDevice, param, 'post');
      }
    }
  };
</script>

<style scoped>
  .el-dropdown-menu {
    width: 117px;
  }
</style>
