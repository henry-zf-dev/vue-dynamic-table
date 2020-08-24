<template>
  <div style="padding-top: 60px">
    <Breadcrumb></Breadcrumb>
    <div class="page-container">

      <div class="position-relative">
        <div class="aside-menu-container">
          <AreaTreeComp
            v-model="areaTreeWidth"
            @currentNodeChange="currentAreaChange"
            @roomImport="roomImport"
            @roomExport="roomExport"
            @roomTempDownload="roomTempDownload">
          </AreaTreeComp>
        </div>
        <div :style="{width: `${areaTreeWidth}px`}" class="aside-menu-footer">
          <el-row class="text-align-center position-relative">
            <el-col :span="12">
              <el-button
                class="iconfont icon-bendidaoru aside-menu-footer-btn"
                type="text"
                @click="roomImport">&nbsp;&nbsp;导入房间
              </el-button>
            </el-col>
            <el-col :span="12">
              <el-button
                class="iconfont icon-zujiantubiao-daochu aside-menu-footer-btn"
                type="text"
                @click="roomTempDownload">&nbsp;&nbsp;下载模板
              </el-button>
            </el-col>
            <span class="aside-menu-footer-divider"></span>
          </el-row>
        </div>
        <div
          :style="{marginLeft: areaTreeCollapsed ? '0' : `${areaTreeWidth + 8}px`}"
          class="position-relative page-content-with-menu">
          <div class="table-container">
            <EZTable
              v-loading="tableLoading"
              :custom-empty="true"
              :table-id="tableId"
              :filters="filters"
              :columns="columnConfig"
              :rows="roomData"
              @filterChange="getRoomTableData"
              @pageChanged="getRoomTableData"
              @sizeChanged="getRoomTableData"
              @sortChanged="getRoomTableData">
              <div slot="empty">
                <EmptyContent
                  :opt-data="roomEmptyBtn"
                  empty-text="该区域还没有房间呢，快去添加吧!"></EmptyContent>
              </div>
              <div slot="customOpts">
                <el-tooltip :open-delay="300" content="房间Excel导出" placement="top">
                  <el-button
                    class="iconfont icon-zujiantubiao-daochu table-filter-opt-btn"
                    @click="roomExport">
                  </el-button>
                </el-tooltip>
              </div>
            </EZTable>
          </div>
          <AsideMenuCollapseIcon v-model="areaTreeCollapsed"></AsideMenuCollapseIcon>
        </div>
      </div>

      <el-dialog :visible.sync="showImportRoomDialog" title="导入房间" width="500px">
        <el-form size="medium" label-width="80px">
          <DragFileUpload
            ref="roomImportRef"
            :action-url="actionUrl"
            :req-data="{index: 0, type: importRoomType}"
            :auto-upload="false"
            :limit="1"
            accept=".xls,.xlsx"
            up-load-title="房间文件"
            @fileUploadSuccess="roomImportSuccess"></DragFileUpload>
          <el-form-item label="导入类型" class="mar-top">
            <el-select v-model="importRoomType" class="width-100">
              <el-option
                v-for="type in commonConfig.fileUploadType"
                :value="type.value"
                :label="type.label"
                :key="type.value"></el-option>
            </el-select>
          </el-form-item>
          <FormOptBtn
            :is-in-dialog="true"
            @formCancel="roomImportCancel"
            @formSubmit="roomImportSubmit"></FormOptBtn>
        </el-form>
      </el-dialog>
      <div v-if="showImportRoomDrawer" class="import-room-result-container">
        <el-drawer
          :visible.sync="showImportRoomDrawer"
          :before-close="roomImportDrawerClose"
          title="房间导入结果"
          direction="rtl"
          size="20%">
          <div class="mar-lft-20">
            <div
              class="color-gray-98 font-size-second font-gray-70 pad-top"
              style="height: 48px;border-top: 1px solid #e5e5e5">
              导入类型：{{ importRoomTypeLabel }}
            </div>
            <div class="mar-top-20 font-size-main font-gray-40">共有{{ importRoomResult.total }}条数据</div>
            <div class="header6 mar-top mar-btm">导入成功：
              <span class="font-color-danger">{{ importRoomResult.successCount }}条</span>
            </div>
            <div class="header6 mar-top mar-btm">导入失败：
              <span class="font-color-danger">{{ importRoomResult.faultCount }}条</span>
            </div>
            <el-divider></el-divider>
            <div class="header6 mar-top" style="height: 35px">数据不存在或关联数据缺失
            </div>
            <el-divider></el-divider>
            <el-table
              :show-header="false"
              :data="importRoomResult.roomError"
              height="500"
              class="room-error-table-cell">
              <el-table-column
                :show-overflow-tooltip="true"
                prop="title"
                label="key">
              </el-table-column>
            </el-table>
          </div>
        </el-drawer>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    assembleTableOptBtn,
    checkRespCorrect,
    downloadFileApi,
    getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    judgePermission,
    messageHandle,
    updatePageNo,
    updateTableState
  } from '../../../utils';
  import {commonConfig, fileDownloadApi, fileUploadApi, tableIdConfig, tableOptBtnConfig} from '../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import {permissionConfig} from '../../../config/permission';
  import MultipleSelector from '../../../components/MultipleSelector';
  import EmptyContent from '../../../components/EmptyContent';
  import FormOptBtn from '../../../components/FormOptBtn';
  import RoomTypeSelect from '../../../components/RoomTypeSelect';
  import {routerMeta} from '../../../router/routerMeta';
  import AreaTreeComp from '../../../components/AreaTreeComp';
  import AsideMenuCollapseIcon from '../../../components/AsideMenuCollapseIcon';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import DragFileUpload from '../../../components/DragFileUpload';
  import EZTable from '../../../components/table/EZTable';
  import {updateRouteParamState} from '../../../modules/urlParamStoreHdl';

  export default {
    name: 'AreaManagement',
    components: {
      Breadcrumb,
      EmptyContent,
      MultipleSelector,
      FormOptBtn,
      RoomTypeSelect,
      AreaTreeComp,
      AsideMenuCollapseIcon,
      DragFileUpload,
      EZTable
    },
    data() {
      return {
        commonConfig: commonConfig,
        commonString: commonString,

        // ========== 区域相关 ==========//
        areaTreeWidth: 250, // 初始值为默认最小宽度
        areaTreeCollapsed: false,
        currentAreaId: 0, // 标志当前进行操作的区域 id

        // ========== 房间相关 ==========//
        tableId: tableIdConfig.managerArea,
        tableLoading: true,
        columnConfig: [],
        tableOptBtn: [],
        filters: [],
        roomData: [],
        roomEmptyBtn: [
          {
            type: 'btn',
            label: '手动添加房间',
            icon: 'icon-tianjia',
            perm: permissionConfig.managementAreaManage,
            callback: () => {
              this.roomAdd();
            }
          }
        ],

        // 导入房间/模板下载
        showImportRoomDialog: false,
        actionUrl: fileUploadApi.roomImport,
        importRoomResult: {
          total: 10,
          faultCount: 10,
          successCount: 10,
          roomError: []
        },
        importRoomType: commonConfig.fileUploadType[0].value,
        showImportRoomDrawer: false
      };
    },
    computed: {
      importRoomTypeLabel() {
        const type = commonConfig.fileUploadType.find(t => {
          return t.value === this.importRoomType;
        }) || {};
        return type.label;
      }
    },
    activated() {
      this.initTableConfig();
      this.getRoomTableData();
    },
    methods: {
      judgePerm: judgePermission,
      // ========== 区域相关 ==========//
      currentAreaChange(val, clear = false) {
        // clear：是否需要重置 table page/size 状态
        if (this.currentAreaId !== val) {
          this.currentAreaId = val;
          this.getRoomTableData(clear);
        }
      },

      // ========== 房间相关 ==========//
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columnConfig = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.roomDetail(data);
                break;
              case tableOptBtnConfig.edit.type:
                this.roomEdit(data);
                break;
              case tableOptBtnConfig.delete.type:
                this.roomDelete(data);
                break;
              case tableOptBtnConfig.enable.type:
                this.roomUseStatus(data, commonString.roomUseStatus.enable);
                break;
              case tableOptBtnConfig.forbidden.type:
                this.roomUseStatus(data, commonString.roomUseStatus.forbidden);
                break;
              case tableOptBtnConfig.debugging.type:
                this.roomUseStatus(data, commonString.roomUseStatus.debugging);
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
      // 修改房间启用/禁用/调试状态
      roomUseStatus(row, enableConfig = {}) {
        let confirmName = '';
        switch (enableConfig.value) {
          case commonString.roomUseStatus.enable.value:
            confirmName = `改为${enableConfig.label}状态房间${row.name}将会被监控`;
            break;
          case commonString.roomUseStatus.forbidden.value:
            confirmName = `改为${enableConfig.label}状态房间${row.name}将不会被监控`;
            break;
          case commonString.roomUseStatus.debugging.value:
            confirmName = `改为${enableConfig.label}状态房间${row.name}将不会触发告警`;
            break;
          default:
            break;
        }
        this.$confirm(confirmName, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          const params = {
            useStatus: enableConfig.value,
            id: row.id
          };
          API.area.roomUseStatus(params).then(resp => {
            if (checkRespCorrect(resp)) {
              this.getRoomTableData(true);
              messageHandle({code: msgCode.EDIT_SAVE, msg: '房间状态改为' + enableConfig.label + '成功'});
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      },
      roomStatusEdit(row, status, name) { // 根据ID修改房间状态
        this.$confirm(`你确定把房间${row.name}的状态修改为${name}吗？`, '修改房间状态', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.area.roomModifyStatus({
            id: row.id,
            state: status
          }).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.EDIT_SAVE, msg: '房间状态修改成功'});
              this.getRoomTableData();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(err => {
        });
      },
      // 根据选中区域获取房间列表
      getRoomTableData(clearTable = false) {
        if (clearTable) {
          // 清空 tableState 和 routeParamState 中的 pageNo 参数
          updateTableState(this.tableId, {pageNo: 1});
          updateRouteParamState(this.$route.name, {pageNo: ''});
        }
        // 根据选中区域获取房间列表
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters = [], sort = []} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort,
          req: {}
        };
        params.req['locationId'] = this.currentAreaId || 0;
        API.area.roomList(params).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items = [], pageInfo = {}} = resp.data || {};
            const availableValues = Object.values(commonString.availableStatus);
            const usableValues = Object.values(commonString.roomUseStatus);
            this.roomData = items.map(item => {
              const availableStatus = availableValues.find(s => {
                return s.value === item.serviceStatus;
              }) || commonString.availableStatus.offline;
              const usableStatus = usableValues.find(s => {
                return s.value === item.useStatus;
              }) || commonString.roomUseStatus.enable;
              return {
                ...item,
                availableText: availableStatus.label,
                availableType: availableStatus.type,
                usableText: usableStatus.label,
                capacity: parseInt(item.capacity),
                capacityText: '容纳' + item.capacity + '人',
                roomAdminText: __.pluck((item.managerList || []), 'actualName').join('  '),
                labelText: __.pluck(item.labels || [], 'name').join('、')
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      roomAdd() {
        this.$router.push({
          name: routerMeta.managementRoomAdd.name,
          params: {lid: this.currentAreaId || 0}
        });
      },
      roomEdit(row) { // 编辑房间
        this.$router.push({
          name: routerMeta.managementRoomEdit.name,
          params: {
            lid: row.pid,
            rid: row.id
          }
        });
      },
      roomDetail(row) { // 跳转到详情界面
        this.$router.push({
          name: routerMeta.managementRoomDetail.name,
          params: {
            lid: row.pid,
            rid: row.id
          }
        });
      },
      roomDelete(row) {
        // inputPattern: new RegExp(row.name, 'g'),
        //   inputErrorMessage: '房间名称不相等，请重新输入',
        this.$prompt(`删除后将为您清空该房间{${row.name}}的所有信息，且无法撤销，请再次输入房间名称确认！`, '删除房间？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPlaceholder: '请输入房间名称'
        }).then(({value}) => {
          if (value === row.name) {
            API.area.roomDelete({
              id: row.id
            }).then(resp => {
              if (checkRespCorrect(resp)) {
                messageHandle({code: msgCode.DEL_SAVE, msg: '房间删除成功'});
                updatePageNo(this.tableId);
                this.getRoomTableData(true);
              } else {
                messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
              }
            }).catch(err => {
              messageHandle({code: msgCode.SYSTEM});
            });
          } else {
            messageHandle({code: msgCode.MUTATION, msg: '房间名称不一致，删除失败！'});
          }
        }).catch(() => {
        });
      },
      // 导出房间（全量/条件）
      roomExport() {
        const {filters = []} = getTableState(this.tableId);
        const param = {
          data: {
            filters: filters
          },
          params: {
            locationId: this.currentAreaId || 0
          }
        };
        downloadFileApi(fileDownloadApi.exportAllRoom, param, 'post');
      },
      // 导入房间/模板下载
      roomImport() {
        this.showImportRoomDialog = true;
      },
      roomTempDownload() {
        downloadFileApi(fileDownloadApi.downloadRoomTemplate);
      },
      roomImportCancel() {
        this.showImportRoomDialog = false;
      },
      roomImportSubmit() {
        const upload = this.$refs['roomImportRef'];
        if (!upload) return;
        upload.uploadSubmit();
      },
      roomImportSuccess(res, file) {
        if (checkRespCorrect(res)) {
          const {data} = res;
          this.importRoomResult = {
            total: data.total || 0,
            faultCount: data.faultCount || 0,
            successCount: data.successCount || 0,
            roomError: (data.messages || []).map((item, index) => {
              return {
                title: item,
                key: index
              };
            })
          };
          this.showImportRoomDialog = true;
          this.showImportRoomDrawer = true;
          this.getRoomTableData(true);
        } else {
          messageHandle({code: res.code, msg: res.message || msgContent.UPLOAD});
        }
      },
      roomImportDrawerClose(done) {
        this.$confirm('确认关闭导入结果提示界面吗？', '导入结果界面', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          done();
        }).catch(err => {
        });
      }
    }
  };

</script>

<style lang="less">

</style>
