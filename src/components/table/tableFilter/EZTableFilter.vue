<template>
  <div class="table-filter-container">
    <div :id="`${tableId}Filter`">
      <el-row>
        <el-col :span="12">
          <el-col :span="18" class="pad-rgt">
            <div class="position-relative">
              <el-input
                :placeholder="searchPlaceholder"
                v-model="inputText"
                suffix-icon="iconfont icon-sousuo"
                clearable
                size="small"
                @focus="searchFocus"
                @input="searchInput"
                @keyup.enter.native="searchEnter">
              </el-input>
              <transition name="el-zoom-in-top">
                <div
                  v-show="showSearchSuggest"
                  :style="{height : !searchConfig.length ? '150px' : 'auto'}"
                  class="table-filter-popper table-search-suggest">
                  <TableSearchSelect
                    v-if="searchConfig.length > 0"
                    :ref="`${tableId}SearchSelect`"
                    :search-result="searchResult"
                    :options="searchConfig"
                    :input-text="inputText"
                    @change="searchChange"></TableSearchSelect>
                  <div v-else>
                    <EmptyContent :hide-image="true" empty-text="暂无可用搜索项"></EmptyContent>
                  </div>
                </div>
              </transition>
            </div>
          </el-col>
          <el-col :span="6">
            <el-button
              v-if="filterConfig.length > 0"
              type="info"
              size="small"
              @click="clickFilterCtr">筛选条件&nbsp;&nbsp;
              <i
                :class="[showFilterContent ? 'prepend-icon-active' : 'prepend-icon-inactive']"
                class="el-icon-caret-bottom prepend-icon"></i>
            </el-button>
          </el-col>
        </el-col>
        <el-col :span="12">
          <div class="table-filter-opt-container">
            <slot name="customOpts"></slot>
            <el-tooltip v-if="showResetBtn" :open-delay="300" content="重置搜索、筛选条件" placement="top">
              <el-button
                class="table-filter-opt-btn iconfont icon-zujiantubiao-guanbi"
                @click="resetFilter">
              </el-button>
            </el-tooltip>
            <el-tooltip :open-delay="300" content="刷新表格" placement="top">
              <el-button
                class="table-filter-opt-btn iconfont icon-zujiantubiao-shuaxin"
                @click="clickRefresh">
              </el-button>
            </el-tooltip>
            <!--            <el-tooltip :open-delay="500" content="全屏" placement="top">-->
            <!--              <el-button-->
            <!--                class="table-filter-opt-btn iconfont icon-zujiantubiao-quanping"-->
            <!--                @click="clickFullScreen">-->
            <!--              </el-button>-->
            <!--            </el-tooltip>-->
            <!--            <el-tooltip :open-delay="500" content="表格行高设置" placement="top">-->
            <!--              <el-button-->
            <!--                class="table-filter-opt-btn iconfont icon-zujiantubiao-liebiaogaodu"-->
            <!--                @click="clickLineHeightCtr">-->
            <!--              </el-button>-->
            <!--            </el-tooltip>-->
            <el-tooltip v-if="showColumnCtr" :open-delay="300" content="表头设置" placement="top">
              <el-button
                :class="{'font-color-primary color-bk-alpha-05': showColumnControl}"
                class="table-filter-opt-btn iconfont icon-kuozhanziduan"
                @click="clickColumnCtr">
              </el-button>
            </el-tooltip>
          </div>
        </el-col>
      </el-row>

      <div v-show="showFilterContent" class="table-filter-content">
        <div v-if="filterConfig.length > 0" class="pad-top-10">
          <div v-for="filter in filterConfig" :key="filter.key" class="display-inline-block mar-rgt">
            <span class="filter-item-label mar-rgt-5">{{ filter.label }}</span>
            <div class="display-inline-block mar-btm-5">
              <div v-if="filter.fieldType === 'string' || filter.fieldType === 'boolean'">
                <TableFilterSelect
                  v-model="filterResult[filter.key].value"
                  :options="filterResult[filter.key].options"
                  :multiple="filter.multi"
                  :placeholder="filter.label"
                  @change="filterChange"></TableFilterSelect>
              </div>
              <div v-if="filter.fieldType === 'number'">
                <TableFilterNumber
                  v-model="filterResult[filter.key].value"
                  @change="filterChange"></TableFilterNumber>
              </div>
              <div v-if="filter.fieldType === 'datetime'">
                <TableFilterDatetime
                  v-model="filterResult[filter.key].value"
                  @change="filterChange"></TableFilterDatetime>
              </div>
              <div v-if="filter.fieldType === 'cascade'">
                <TableFilterCascade
                  v-model="filterResult[filter.key].value"
                  :options="filterResult[filter.key].options"
                  :multiple="filter.multi"
                  @change="filterChange"></TableFilterCascade>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tagData.length > 0" class="mar-top-5">
        <div
          v-for="(group, gIdx) in tagData"
          :key="gIdx"
          class="display-inline-block">
          <el-tag
            v-for="(tag, tIdx) in group.tags"
            :key="tIdx"
            :disable-transitions="true"
            class="mar-rgt-5"
            size="medium"
            type="success"
            effect="plain"
            closable
            @close="searchTagRemove(tag)">
            {{ tag.label }}
          </el-tag>
        </div>
      </div>

      <transition name="el-zoom-in-top">
        <div v-show="showColumnControl" class="table-filter-popper table-column-control">
          <div v-if="columns.length > 0">
            <div class="header5 mar-btm-20">自定义列表项</div>
            <el-checkbox-group v-model="columnResult">
              <el-row>
                <el-col
                  v-for="(column, idx) in columns"
                  :span="8"
                  :key="idx"
                  class="pad-lft-10 pad-rgt-10 mar-btm-20">
                  <el-checkbox
                    :label="column.label"
                    :disabled="!column.checkable"
                    class="width-100"
                    size="small"
                    border>
                    {{ column.label }}
                  </el-checkbox>
                </el-col>
              </el-row>
            </el-checkbox-group>
            <div class="text-align-right mar-top-10">
              <el-button type="info" size="medium" @click="cancelColumnControl">取消</el-button>
              <el-button type="primary" size="medium" @click="confirmColumnControl">确定</el-button>
            </div>
          </div>
          <div v-else>
            <EmptyContent :hide-image="true" empty-text="暂无配置表头"></EmptyContent>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import EmptyContent from '../../EmptyContent';
import TableFilterSelect from './TableFilterSelect';
import TableFilterNumber from './TableFilterNumber';
import TableFilterDatetime from './TableFilterDatetime';
import TableFilterCascade from './TableFilterCascade';
import TableSearchSelect from './TableSearchSelect';
import { getTableState, updateTableState } from '../../../utils';
import { updateRouteParamState } from '../../../modules/urlParamStoreHdl';

export default {
  name: 'EZTableFilter',
  components: {
    EmptyContent,
    TableFilterSelect, TableFilterNumber,
    TableFilterDatetime, TableSearchSelect,
    TableFilterCascade
  },
  props: {
    tableId: {
      type: String,
      default: ''
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
    }
  },
  data() {
    return {
      inputText: '',
      showFilterContent: false,
      showSearchSuggest: false,
      showColumnControl: false,
      showColumnCtr: false,
      fullScreen: false,
      filterConfig: [],
      searchConfig: [],
      columnConfig: [],
      filterResult: [],
      searchResult: [],
      columnResult: []
    };
  },
  computed: {
    searchPlaceholder() {
      const searchLabels = _.pluck(this.searchConfig, 'label');
      return searchLabels.length > 0 ? `请输入：${searchLabels.join('、')}` : '暂无可用搜索项';
    },
    tagData() {
      const tagData = [];
      this.searchResult.forEach(sr => {
        const { fieldType, key, label, value = [] } = sr;
        const group = {
          key, label,
          tags: []
        };
        value.forEach(v => {
          group.tags.push({
            fieldType, key, value: v,
            label: `${label}: ${v}`
          });
        });
        group.tags.length > 0 && tagData.push(group);
      });
      return tagData;
    },
    showResetBtn() {
      let hasFilter = false;
      Object.values(this.filterResult).forEach(result => {
        const { value } = result;
        if (Array.isArray(value) && value.length > 0) {
          hasFilter = true;
        } else {
          const { begin, end } = value;
          if (begin || end) {
            hasFilter = true;
          }
        }
      });
      return hasFilter || this.tagData.length > 0;
    }
  },
  watch: {
    filters() {
      this.initFilterConfig();
      this.initSearchConfig();
    },
    showFilterContent(value) {
      if (!value) return;
      this.showSearchSuggest = false;
      this.showColumnControl = false;
    },
    showSearchSuggest(value) {
      if (!value) return;
      this.showColumnControl = false;
    },
    showColumnControl(value) {
      if (!value) return;
      this.showSearchSuggest = false;
    },
    columns(value) {
      this.columnResult = [];
      value.forEach(v => {
        // 当前列中只要有可以隐藏的就显示列表项按钮
        if (v.checkable) {
          this.showColumnCtr = true;
        }
        !v.hide && this.columnResult.push(v.label);
      });
    }
  },
  mounted() {
    // 筛选下拉 filterContent show 之后，
    // 根据当前点击区域，判断是否需要隐藏 filterContent searchContent
    document.getElementById('app').addEventListener('click', (event) => {
      const filterContent = document.getElementById(`${this.tableId}Filter`);
      if (filterContent) {
        if (!filterContent.contains(event.target)) {
          this.showSearchSuggest = false;
          this.showColumnControl = false;
        }
      }
    });
  },
  methods: {
    initFilterConfig(force = false) {
      this.filterConfig = [];
      const filterResult = {};
      this.filters.forEach(config => {
        switch (config.fieldType) {
          case 'string':
          case 'bool':
            filterResult[config.key] = {
              ...config, value: [],
              options: config.options || []
            };
            this.filterConfig.push(config);
            break;
          case 'number':
          case 'datetime':
            filterResult[config.key] = {
              ...config, value: { begin: '', end: '' }
            };
            this.filterConfig.push(config);
            break;
          case 'cascade':
            filterResult[config.key] = {
              ...config, value: [],
              options: (config.options || []).map(opt => {
                return {
                  ...opt,
                  value: opt.id,
                  label: opt.name
                };
              })
            };
            this.filterConfig.push(config);
            break;
          default:
            break;
        }
      });
      const { filterResult: existResult = {} } = getTableState(this.tableId);
      if (!force && !_.isEmpty(existResult) &&
          Object.keys(existResult).length === Object.keys(filterResult).length) {
        this.filterResult = existResult;
      } else {
        this.filterResult = filterResult;
        updateTableState(this.tableId, { filterResult: filterResult });
      }
    },
    initSearchConfig() {
      const { searchResult = [] } = getTableState(this.tableId);
      this.searchResult = searchResult;
      this.searchConfig = [];
      this.filters.forEach(config => {
        if (config.fieldType === 'input') {
          this.searchConfig.push(config);
        }
      });
    },
    // 搜索相关
    searchFocus() {
      this.showSearchSuggest = !!this.inputText;
    },
    searchInput(value) {
      this.showSearchSuggest = !!value;
    },
    searchEnter() {
      this.showSearchSuggest = !!this.inputText;
      const searchSelect = this.$refs[`${this.tableId}SearchSelect`];
      if (!this.searchConfig.length || !this.inputText || !searchSelect) return;
      searchSelect.change(this.searchConfig[0]);
    },
    searchChange() {
      this.inputText = '';
      this.showSearchSuggest = false;
      this.handlerChange();
    },
    searchTagRemove(tag = {}) {
      function selectTagRemove(src = {}) {
        const { value = [] } = src;
        const valIdx = value.indexOf(tag.value);
        !!~valIdx && (value.splice(valIdx, 1));
      }

      switch (tag.fieldType) {
        case 'input':
          const idx = this.searchResult.findIndex(sr => {
            return sr.key === tag.key;
          });
          !!~idx && (selectTagRemove(this.searchResult[idx]));
          break;
        case 'string':
        case 'bool':
          selectTagRemove(this.filterResult[tag.key]);
          break;
        case 'cascade':
          const src = this.filterResult[tag.key];
          const valIdx = (_.pluck(src.value, 'value')).indexOf(tag.value);
          !!~valIdx && (src.value.splice(valIdx, 1));
          break;
        case 'number':
        case 'datetime':
          this.filterResult[tag.key]['value'] = { begin: '', end: '' };
          break;
        default:
          break;
      }
      this.handlerChange();
    },
    // 筛选相关
    clickFilterCtr() {
      this.showFilterContent = !this.showFilterContent;
    },
    filterChange() {
      this.handlerChange();
    },
    // 重置所有搜索/筛选条件
    resetFilter() {
      this.searchResult = [];
      this.initFilterConfig(true);
      console.log('##### filterResult #####', this.filterResult);
      this.handlerChange();
    },
    // 右侧 opts 相关
    clickRefresh() {
      this.showFilterContent = false;
      this.showSearchSuggest = false;
      this.showColumnControl = false;
      this.inputText = '';
      // TODO 只做刷新，不重置筛选、搜索项目 Henry 2020-05-27 20:30:18
      // updateTableState(this.tableId, {
      //   filterResult: [],
      //   searchResult: [],
      //   pageNo: 1,
      //   pageSize: 10,
      //   sort: [],
      // });
      // updateRouteParamState(this.$route.name, {pageNo: '', pageSize: '', sort: ''});
      // this.initFilterConfig(true);
      // this.initSearchConfig();
      this.$emit('filterChange');
    },
    clickFullScreen() {
      this.fullScreen = !this.fullScreen;
      this.$emit('fullScreenCtr', this.fullScreen);
    },
    clickLineHeightCtr() {

    },
    clickColumnCtr() {
      this.showColumnControl = !this.showColumnControl;
    },
    cancelColumnControl() {
      this.showColumnControl = false;
    },
    confirmColumnControl() {
      this.columns.forEach(c => {
        c.hide = !this.columnResult.includes(c.label);
      });
      this.showColumnControl = false;
    },
    handlerChange() {
      updateTableState(this.tableId, {
        filterResult: this.filterResult,
        searchResult: this.searchResult,
        pageNo: 1
      });
      updateRouteParamState(this.$route.name, { pageNo: '' });
      this.$emit('filterChange');
    }
  }
};
</script>

<style scoped lang="less">

</style>
