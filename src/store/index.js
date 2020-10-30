import Vue from 'vue';
import Vuex from 'vuex';
import {tableIdConfig} from '../config/common';
import {routerMeta} from '../router/routerMeta';

Vue.use(Vuex);

// tableState 初始化值
function initializeTableState() {
  return {
    pageNo: 1,
    pageSize: 10,
    total: 0,
    filterResult: {}, // 筛选的结果
    searchResult: [], // 搜索的结果
    sort: []
  };
}

// 初始化 tableState 配置
export function initAllTableState() {
  const tableState = {};
  Object.values(tableIdConfig).forEach(val => {
    tableState[val] = initializeTableState();
  });
  return tableState;
}

export default new Vuex.Store({
  state: {
    clientWidth: 0,
    clientHeight: 0,
    breadcrumbHeight: 0,
    asideMenuCollapsed: false,
    tableState: {},
    // 每个路由 URL 上存储的参数信息
    routeParamState: {}
  },
  mutations: {
    updateClientWidth(state, clientWidth) {
      state.clientWidth = clientWidth;
    },
    updateClientHeight(state, clientHeight) {
      state.clientHeight = clientHeight;
    },
    updateBreadcrumbHeight(state, breadcrumbHeight) {
      state.breadcrumbHeight = breadcrumbHeight;
    },
    updateAsideMenuCollapsed(state, asideMenuCollapsed) {
      state.asideMenuCollapsed = asideMenuCollapsed;
    },
    // table 相关
    updateTableState(state, table = {}) {
      const lastTableState = state.tableState;
      lastTableState[table.id] = table;
      state.tableState = {...lastTableState};
    },
    // 初始化table
    initTableState(state, id = '') {
      let lastTableState = state.tableState;
      // 初始化单个表格
      if (id) {
        lastTableState[id] = initializeTableState();
      } else {
        lastTableState = initAllTableState();
      }
      state.tableState = {...lastTableState};
    },
    // routeParamState 相关
    updateRouteParamState(state, routeParam = {}) {
      const lastRouteParamState = state.routeParamState;
      lastRouteParamState[routeParam.route] = routeParam;
      state.routeParamState = {...lastRouteParamState};
    },
    // 初始化 routeParamState
    initRouteParamState(state, route = '') {
      let lastRouteParamState = state.routeParamState;
      // 初始化单个表格
      if (route) {
        const routeParam = lastRouteParamState[route];
        // todo 房间监控列表跳转房间详情页面，需要直接到 “正在告警” tab
        //  而 BodyAdmin 中的处理是：父跳子，会清空子页面的所有 state，
        //  所有临时先保留 menu 信息，不清空，还未想到更改的方式解决 Henry 2020-7-1 12:16:13
        lastRouteParamState[route] = {
          menu: routeParam.menu || ''
        };
      } else {
        const routeParamState = {};
        Object.values(routerMeta).forEach(r => {
          routeParamState[r.name] = {};
        });
        lastRouteParamState = routeParamState;
      }
      state.routeParamState = {...lastRouteParamState};
    },

    // store 清空
    clearStore(state) {
      state.asideMenuCollapsed = false;
      state.tableState = {};
      state.routeParamState = {};
    }
  }
});
