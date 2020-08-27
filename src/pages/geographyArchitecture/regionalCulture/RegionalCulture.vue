<template>
  <div class="regional-culture-page" style="padding-top: 60px">
    <Breadcrumb :opt-data="defaultOptBtn"></Breadcrumb>
    <div class="page-container">
      <div class="table-container">
        <EZTable
          v-loading="tableLoading"
          :custom-empty="true"
          :table-id="tableId"
          :filters="filters"
          :columns="columns"
          :rows="tableData"
          @filterChange="getTableData"
          @pageChanged="getTableData"
          @sizeChanged="getTableData"
          @sortChanged="getTableData">
          <div slot="empty">
            <EmptyContent :opt-data="defaultOptBtn"></EmptyContent>
          </div>
        </EZTable>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    assembleTableOptBtn,
    checkRespCorrect,
    getTableCfgFromStorage,
    getTableConfig,
    getTableState,
    messageHandle,
    updateTableState
  } from '../../../utils';
  import {tableIdConfig, tableOptBtnConfig} from '../../../config/common';
  import {msgCode, msgContent} from '../../../config/string';
  import Breadcrumb from '../../../components/breadcrumb/Breadcrumb';
  import EmptyContent from '../../../components/EmptyContent';
  import EZTable from '../../../components/table/EZTable';
  import {routerMeta} from "../../../router/routerMeta";

  export default {
    name: 'RegionalCulture',
    components: {
      Breadcrumb, EZTable, EmptyContent
    },
    data() {
      return {
        pageTitle: '地域文化',
        tableLoading: true,
        tableId: tableIdConfig.regionalCulture,
        columns: [],
        filters: [],
        tableData: []
      };
    },
    computed: {
      defaultOptBtn() {
        return [
          {
            type: 'btn',
            label: `新增${this.pageTitle}`,
            icon: 'icon-tianjia',
            callback: () => {
              this.jumpToAddPage();
            }
          }
        ]
      }
    },
    created() {
      this.initTableConfig();
      this.getTableData();
    },
    methods: {
      initTableConfig() {
        const assembleConfig = ({columns = [], filters = []}) => {
          this.columns = columns;
          this.filters = filters;
          assembleTableOptBtn(columns, ({type = '', data = {}}) => {
            if (!type) return;
            switch (type) {
              case tableOptBtnConfig.detail.type:
                this.jumpToDetailPage(data.id);
                break;
              case tableOptBtnConfig.edit.type:
                this.jumpToEditPage(data.id);
                break;
              case tableOptBtnConfig.delete.type:
                this.deleteTableItem(data);
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
      // 获取列表数据源
      getTableData() {
        this.tableLoading = true;
        const {pageNo = 1, pageSize = 10, filters, sort} = getTableState(this.tableId);
        const params = {
          pageNo, pageSize, filters, sort
        };
        API.regionalCulture.regionalCultureList(params).then(resp => {
          this.tableLoading = false;
          if (checkRespCorrect(resp)) {
            const {items, pageInfo = {}} = resp.data || {};
            this.tableData = (items || []).map(item => {
              return {
                ...item
              };
            });
            updateTableState(this.tableId, {total: pageInfo.total || 0});
          } else {
            messageHandle({code: resp.code, msg: resp.message || msgContent.QUERY});
          }
        }).catch(err => {
          this.tableLoading = false;
          messageHandle({code: msgContent.SYSTEM});
        });
      },
      // 删除列表数据
      deleteTableItem(data = {}) {
        this.$confirm(`确认要删除${this.pageTitle} ${data.name} 吗？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(() => {
          API.regionalCulture.regionalCultureDelete({id: data.id}).then(resp => {
            if (checkRespCorrect(resp)) {
              messageHandle({code: msgCode.DEL_SAVE, msg: `${this.pageTitle}删除成功`});
              this.initTableConfig();
              this.getTableData();
            } else {
              messageHandle({code: resp.code, msg: resp.message || msgContent.MUTATION});
            }
          }).catch(err => {
            messageHandle({code: msgCode.SYSTEM});
          });
        }).catch(() => {
        });
      },
      jumpToDetailPage(id) {
        this.$router.push({
          name: routerMeta.famousArchitectureDetail.name,
          params: {id: id}
        });
      },
      jumpToAddPage() {
        this.$router.push({
          name: routerMeta.famousArchitectureAdd.name
        });
      },
      jumpToEditPage(id) {
        this.$router.push({
          name: routerMeta.famousArchitectureEdit.name,
          params: {id: id}
        });
      }
    }
  }
</script>

<style scoped>

</style>
