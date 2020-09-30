<template>
  <div
    :class="{'pad-all-20': fullScreen}"
    :id="tableId"
    :ref="`${tableId}-container`"
    :style="{minHeight: `calc(100vh - ${breadcrumbHeight}px - ${paddingTop}px)`}"
    class="ez-table-component">
    <div :style="{paddingBottom: rows.length > 0 ? '65px' : ''}" class="table-content">
      <slot name="header"></slot>
      <EZTableFilter
        v-if="!hideFilter"
        :table-id="tableId"
        :filters="filters"
        :columns="columns"
        class="mar-btm-10"
        @fullScreenCtr="tableFullScreen"
        @filterChange="filterChange">
        <div slot="customOpts">
          <slot name="customOpts"></slot>
        </div>
      </EZTableFilter>
      <el-table
        :ref="tableId"
        :data="rows"
        :class="{'table-fixed-column': rows.length}"
        row-key="id"
        @selection-change="selectionChanged"
        @sort-change="sortChanged">
        <el-table-column
          v-if="selection"
          :reserve-selection="true"
          :selectable="selectable"
          type="selection"
          width="55"></el-table-column>
        <el-table-column v-if="expand" type="expand"></el-table-column>
        <el-table-column
          v-for="(c, idx) in columns"
          v-if="!c['hide']"
          :fixed="idx === 0 ? 'left' : (idx === columns.length -1 && c.opt ? 'right' : false)"
          :reserve-selection="true"
          :sortable="c.sort ? 'custom' : false"
          :prop="c.prop"
          :label="c.label"
          :width="idx === columns.length -1 && c.opt ? getWidthText(c.width) : ''"
          :min-width="getWidthText(c.minWidth || c.width)"
          :key="idx">
          <template slot-scope="scope">
            <EZColumn
              :horizontal="c.horizontal"
              :hover="c.hover"
              :children="c.children"
              :parent="c"
              :data="rows[scope.$index]"
              @listClickJump="listClickJump"></EZColumn>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="rows.length === 0">
        <slot v-if="customEmpty" name="empty"></slot>
        <EmptyContent v-else></EmptyContent>
      </div>
    </div>
    <el-pagination
      v-if="rows.length > 0"
      :style="{bottom: fullScreen ? '30px' : '10px'}"
      :page-sizes="pageSizes"
      :total="pageInfo.total"
      :current-page.sync="pageInfo.pageNo"
      :page-size.sync="pageInfo.pageSize"
      class="table-pagination"
      background
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="pageChanged"
      @size-change="sizeChanged">
    </el-pagination>
  </div>
</template>

<script>
  import { getTableState, updateTableState } from '../../utils';
  import { getUrlParam, updateRouteParamState } from '../../modules/urlParamStoreHdl';
  import EZTableFilter from './tableFilter/EZTableFilter';
  import EZColumn from './EZColumn.vue';
  import EmptyContent from '../EmptyContent';
  import { mapState } from 'vuex';

  export default {
    name: 'EZTable',
    components: { EZTableFilter, EZColumn, EmptyContent },
    props: {
      // table 的唯一标志，用于 store 的存取
      tableId: {
        type: String,
        default: ''
      },
      // row 数据的唯一字段标志
      uniqueKey: {
        type: String,
        default: 'id'
      },
      filters: {
        type: Array,
        default: () => {
          return [];
        }
      },
      columns: {
        type: Array,
        default: () => {
          return [];
        }
      },
      rows: {
        type: Array,
        default: () => {
          return [];
        }
      },
      selection: {
        type: Boolean,
        default: false
      },
      expand: {
        type: Boolean,
        default: false
      },
      operationBtn: {
        type: Array,
        default: () => {
          return [];
        }
      },
      selectionData: {
        type: Array,
        default: () => {
          return [];
        }
      },
      customEmpty: {
        type: Boolean,
        default: false
      },
      fitTable: {
        type: Boolean,
        default: true
      },
      hideFilter: {
        type: Boolean,
        default: false
      },
      paddingTop: {
        type: Number,
        default: 80
      },
      // 当 table pageNo/pageSize 更改后是否更新 routeParam 全局状态
      ignoreRouteCtr: {
        type: Boolean,
        default: false
      },
      // 标志是否开启 keepalive
      keepalive: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        routeName: '',
        pageInfo: {
          pageNo: 1,
          pageSize: 10,
          total: 0
        },
        pageSizes: [5, 10, 20, 30, 50],
        fullScreen: false
      };
    },
    computed: {
      ...mapState(['clientHeight', 'breadcrumbHeight', 'tableState', 'routeParamState'])
    },
    watch: {
      selectionData() {
        this.toggleSelection(this.selectionData);
      },
      tableState() {
        const { pageNo = 1, pageSize = 10, total = 0 } = getTableState(this.tableId);
        this.pageInfo = { pageNo, pageSize, total };
      }
    },
    created() {
      !this.keepalive && this.initData();
    },
    activated() {
      this.keepalive && this.initData();
    },
    methods: {
      initData() {
        if (this.ignoreRouteCtr) return;
        this.routeName = this.$route.name;
        // 先从 routeParamState 中取分页、排序等参数
        const { pageNo, pageSize, sort } = this.routeParamState[this.routeName] || {};
        updateTableState(this.tableId, { pageNo: parseInt(pageNo) || 1 });
        updateTableState(this.tableId, { pageSize: parseInt(pageSize) || 10 });
        updateTableState(this.tableId, { sort: JSON.parse(sort || '[]') });
      },
      // 列表点击跳转事件回调
      listClickJump(type, data) {
        this.$emit('listClickJump', type, data);
      },
      // 判断表格行是否可选
      selectable(row) {
        return row.canApplied === 'Y' || !row.canApplied;
      },
      getWidthText(width = 0) {
        return width ? `${width}px` : '';
      },
      filterChange() {
        this.$emit('filterChange');
      },
      tableFullScreen(full = false) {
        this.fullScreen = full;
        const container = this.$refs[`${this.tableId}-container`];
        if (full) {
          if (container.requestFullscreen) {
            container.requestFullscreen();
          } else if (container.webkitRequestFullScreen) {
            container.webkitRequestFullScreen();
          } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
          } else {
            container.msRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExiFullscreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          }
        }
      },
      pageChanged(page) {
        updateTableState(this.tableId, { pageNo: page });
        !this.ignoreRouteCtr && updateRouteParamState(this.routeName, { pageNo: page });
        this.$emit('pageChanged');
      },
      sizeChanged(size) {
        updateTableState(this.tableId, { pageSize: size });
        !this.ignoreRouteCtr && updateRouteParamState(this.routeName, { pageSize: size });
        this.$emit('sizeChanged');
      },
      sortChanged({ prop, order }) {
        const destOrder = order === 'descending' ? 'desc' : 'asc'; // 升序，倒序
        const { sort = [] } = getTableState(this.tableId);
        // 先移除已有 sort ，在将新的 sort 插入到首位，后台根据数据元素的顺序来决定排序优先级
        const existIdx = __.pluck(sort, 'key').indexOf(prop);
        if (~existIdx) {
          sort.splice(existIdx, 1);
        }
        sort.unshift({ key: prop, type: destOrder });
        updateTableState(this.tableId, { sort: sort, pageNo: 1 });
        updateRouteParamState(this.$route.name, { pageNo: '' });
        !this.ignoreRouteCtr && updateRouteParamState(this.routeName, { sort: JSON.stringify(sort) });
        this.$emit('sortChanged');
      },
      selectionChanged(selection) {
        this.$emit('selectionChanged', selection);
      },
      // 默认选中行和清空选中行
      toggleSelection(rows = []) {
        const data = this.$refs[this.tableId].selection;
        if (rows.length > 0) {
          rows.forEach(row => {
            if (!__.pluck(data, 'id').includes(row.id)) {
              this.$refs[this.tableId].toggleRowSelection(row, true);
            }
          });
        } else {
          this.$refs[this.tableId].clearSelection();
        }
      },

      // 清空 tableState 和 routeParamState 的数据
      // 用于暴露给父组件调用
      clearState() {
        this.$store.commit('initTableState', this.tableId);
        updateRouteParamState(this.$route.name, { pageNo: '', pageSize: '', sort: '' });
      }
    }
  };
</script>

<style scoped>

</style>
