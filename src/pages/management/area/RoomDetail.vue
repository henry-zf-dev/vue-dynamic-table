<template>
  <div v-loading="pageLoading" :style="{paddingTop: `${breadcrumbHeight}px`}">
    <Breadcrumb
      v-if="!hideBreadcrumb"
      v-model="breadcrumbHeight"
      :opt-data="breadcrumbOpts"
      :title="title"
      :subtitle="subtitle"></Breadcrumb>
    <div :class="{'pad-no': hideBreadcrumb}" class="page-container">
      <div class="page-detail-container">
        <DetailPageLayout :tabs="pageTabs" :fit-page="true" page-id="roomDetailPage">
          <div slot="baseInfo-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="baseInfoTableData">
                <el-table-column
                  prop="title"
                  width="260"
                  label="key">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <div v-if="scope.row.key==='subCtrInfo'">
                      <span class="header7 font-gray-40">{{ roomForm['subCtrName'] || commonString.unknown }}</span>
                      <span
                        v-if="roomForm['subCtrUrl']"
                        class="header7 font-color-primary mar-lft-40 cursor-pointer"
                        @click="jumpToSupCon">跳转至分控</span>
                    </div>
                    <span v-else class="header7 font-gray-40">{{ scope.row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <div slot="extentInfo-tab">
            <div class="page-detail-table">
              <el-table :show-header="false" :data="extentData">
                <el-table-column
                  prop="name"
                  width="260"
                  label="name">
                </el-table-column>
                <el-table-column
                  prop="value"
                  label="value">
                  <template slot-scope="scope">
                    <span class="header7 font-gray-70">{{ scope.row[scope.row.mark]==='true'?'是':(scope.row[scope.row.mark]==='false'?'否':scope.row[scope.row.mark]) }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <el-button
            v-if="hideBreadcrumb"
            slot="tabMoreOpt"
            type="info"
            size="small"
            class="iconfont icon-bianji room-detail-edit-btn"
            @click="roomEdit">&nbsp;编辑
          </el-button>
        </DetailPageLayout>
      </div>
    </div>
  </div>
</template>

<script>
  import {routerMeta} from '../../../router/routerMeta';
  import {
    checkRespCorrect,
    getGeneralStatus,
    messageHandle,
    momentTimeToString,
    subControlToken
  } from '../../../utils';
  import {commonConfig} from '../../../config/common';
  import {commonString, msgCode, msgContent} from '../../../config/string';
  import {permissionConfig} from '../../../config/permission';
  import {baseUrl} from '../../../config/env';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import DetailPageLayout from '../../../components/DetailPageLayout';

  export default {
    name: 'RoomDetail',
    components: {Breadcrumb, DetailPageLayout},
    props: {
      // 是否隐藏面包屑
      hideBreadcrumb: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        commonString: commonString,
        commonConfig: commonConfig,
        breadcrumbHeight: 0,
        pageLoading: true,
        areaId: '',
        roomId: '',
        title: '',
        pageTabs: [
          {
            value: 'baseInfo-tab',
            label: '基本信息'
          },
          {
            value: 'extentInfo-tab',
            label: '扩展信息'
          }
        ],
        roomForm: {},
        baseInfoTableData: [
          {
            title: '房间Id',
            key: 'id',
            value: ''
          },
          {
            title: '容量',
            key: 'capacity',
            value: ''
          },
          {
            title: '所属区域',
            key: 'ancestorsName',
            value: ''
          },
          {
            title: '管理员',
            key: 'roomAdmin',
            value: ''
          },
          {
            title: '监控状态',
            key: 'roomStatus',
            value: ''
          },
          {
            title: '启用状态',
            key: 'usableStatus',
            value: ''
          },
          {
            title: '分控',
            key: 'subCtrInfo',
            value: ''
          },
          {
            title: '第三方ID',
            key: 'thirdPartyId',
            value: ''
          }
        ],
        extentData: [],
        serverExt: {}
      };
    },
    computed: {
      subtitle() {
        return {
          ...this.roomForm,
          title: '房间',
          show: true
        };
      },
      breadcrumbOpts() {
        return [
          {
            type: 'btn',
            label: '房间编辑',
            icon: 'icon-bianji',
            perm: permissionConfig.managementAreaManage,
            callback: () => {
              this.roomEdit();
            }
          }
          // {
          //   type: 'dropdown',
          //   label: '可用状态',
          //   icon: 'icon-bendidaoru',
          //   items: [
          //     {
          //       label: '上线',
          //       icon: 'icon-shangxian',
          //       command: '1'
          //     },
          //     {
          //       label: '下线',
          //       icon: 'icon-xiaxian',
          //       command: '2'
          //     },
          //     {
          //       label: '改造',
          //       icon: 'icon-gaizao',
          //       command: '3'
          //     },
          //   ],
          //   callback: (command) => {
          //     this.roomStatusEdit(command);
          //   }
          // }
        ];
      }
    },
    created() {
      const {lid = '', rid = ''} = this.$route.params;
      this.areaId = lid;
      this.roomId = rid;
      this.getRoomDetail();
    },
    methods: {
      goBack() { // 返回上一页
        this.$router.push({
          name: routerMeta.managementArea.name
        });
      },
      jumpToSupCon() { // 跳转
        if (!this.roomForm.centralControlUrl) return;
        subControlToken(this.roomFor.centralControlUrl, this.roomForm.id);
        // window.open(row.centralControlUrl);
      },
      // todo 先注释掉上线下线改造修改状态，目前不演示
      // roomStatusEdit(status) { //根据ID修改房间状态
      //   let statusName = '';
      //   todo 根据 status 映射 label
      //   this.$confirm(`你确定把房间${this.roomForm.name}的状态修改为${statusName}吗？`, '修改房间状态', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',
      //   }).then(() => {
      //     API.area.roomStatusEdit({
      //       id: this.roomForm.id,
      //       state: status
      //     }).then(resp => {
      //       if (checkRespCorrect(resp)) {
      //         messageHandle({code: msgCode.EDIT_SAVE, msg: '房间状态修改成功'});
      //         this.getRoomTableData();
      //       } else {
      //         messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION})
      //       }
      //     }).catch(err => {
      //       messageHandle({code: msgCode.SYSTEM})
      //     });
      //   })
      // },
      assembleBaseInfo(data = {}) {
        this.baseInfoTableData.forEach(bi => {
          bi.value = data[bi.key] || '';
        });
      },
      getRoomDetail() { // 根据ID获取房间详情
        this.pageLoading = true;
        API.area.roomDetail({id: this.roomId}).then(resp => {
          this.pageLoading = false;
          if (checkRespCorrect(resp)) {
            const {data = {}} = resp;
            const {
              useStatus, managerList = [], ancestorsName = '',
              name = '', centralControl = {}, createdTime, updatedTime
            } = data;
            const {name: centralCtrName = '', deviceEsn = '', centralControlUrl = ''} = centralControl;
            const roomStatus = getGeneralStatus(data);
            const usableValues = Object.values(commonString.roomUseStatus);
            const usableStatus = usableValues.find(s => {
              return s.value === useStatus;
            }) || {};
            this.roomForm = {
              ...data,
              roomStatus: roomStatus.label,
              usableStatus: usableStatus.label || '',
              roomAdmin: __.pluck(managerList, 'actualName').join(' 、 '),
              subCtrName: `${deviceEsn} ${centralCtrName ? `(${centralCtrName})` : ''}`,
              subCtrUrl: centralControlUrl,
              createdTime: momentTimeToString(createdTime),
              updatedTime: momentTimeToString(updatedTime)
            };
            this.assembleBaseInfo(this.roomForm);
            this.title = ancestorsName + '-' + name; // 拼接房间详情标题
            this.getExpandList();
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.pageLoading = false;
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      getExpandList() { // 获取自定义属性数据
        API.setting.customFieldList({pageNo: 1, pageSize: 0}).then(resp => {
          if (checkRespCorrect(resp)) {
            (resp.data.items || []).forEach((item) => {
              if (item.scope === commonConfig.customFieldScope[1].value) {
                let data = (this.roomForm.serverExt || {})[item.mark] || '';
                if (data instanceof Array) {
                  data = data.join(',');
                }
                this.extentData.push({
                  ...item,
                  [item.mark]: data // (this.roomForm.serverExt || {})[item.mark] || ''
                });
              }
            });
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          messageHandle({code: msgCode.SYSTEM});
        });
      },
      roomDelete() {
        this.$confirm(`删除后将为您清空该房间${this.roomForm.name}的所有信息，且无法撤销，请再次确认！`, '删除房间？', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.area.roomDelete({
            id: this.roomId
          }).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.DEL_SAVE, msg: '房间删除成功'});
              this.goBack();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(() => {
        });
      },
      roomEdit() {
        this.$router.push({
          name: routerMeta.managementRoomEdit.name,
          params: {
            withExtraParent: this.hideBreadcrumb,
            lid: this.roomForm.pid,
            rid: this.roomForm.id
          }
        });
      }
    }
  };
</script>

<style scoped lang="less">

</style>
