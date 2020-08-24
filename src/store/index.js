import Vue from 'vue';
import Vuex from 'vuex';
import {tableIdConfig, websocketType} from '../config/common';
import {routerMeta} from '../router/routerMeta';

Vue.use(Vuex);

function getMsgId(msg = {}) {
  return msg.id || '';
}

function updateSocketMsgStore(msgId, src = {}, dest = {}) {
  const lastStatus = src[msgId];
  if (!lastStatus) {
    src[msgId] = {...dest};
  } else {
    src[msgId] = {...lastStatus, ...dest};
  }
}

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
    browserSuggest: false, // 是否显示浏览器更换提示
    asideMenuCollapsed: false,
    websocket: null,
    wsReconnecting: false,
    wsSubscription: [], // 记录已订阅的主题，用于重连后的重新订阅
    deviceStatusMsg: {},
    roomAlarmMsg: {},
    roomScoreMsg: {},
    deviceOnlineMsg: {},
    deviceAlarmMsg: {},
    roomUsageStateMsg: {},
    alarmRule: {},
    tokenCount: true,
    /* 设备控制超时相关
    * {
    *   msgId: {
    *     timer: null,
    *     active: false
    *   }
    * }
    * */
    devCtrTimer: {},
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
    updateBrowserSuggest(state, browserSuggest) {
      state.browserSuggest = browserSuggest;
    },
    updateAsideMenuCollapsed(state, asideMenuCollapsed) {
      state.asideMenuCollapsed = asideMenuCollapsed;
    },
    initWebsocket(state, websocket) {
      state.websocket = websocket;
    },
    updateWsReconnecting(state, wsReconnecting) {
      state.wsReconnecting = wsReconnecting;
    },
    addWsSubscription(state, sub) {
      state.wsSubscription.push(sub);
    },
    removeWsSubscription(state, sub) {
      const wsSubscription = state.wsSubscription;
      const idx = wsSubscription.findIndex(s => {
        return s.subType === sub.subType && s.id === sub.id;
      });
      if (!~idx) return;
      wsSubscription.splice(idx, 1);
      state.wsSubscription = wsSubscription;
    },
    updateSocketMsg(state, msg = {}) {
      // {
      //   "20": {
      //      "type": "deviceStatus",
      //      "power": "standby",
      //      "ts": 1572948617161
      //   }
      // }
      // const pushMsg1 = {
      //   195: {
      //     channel_list: [],
      //     ts: 14922388754
      //   }
      // };
      // const pushMsg2 = {
      //   195: {
      //     channel_status: '3',
      //     ts: 14922388754
      //   }
      // };
      //  转化成 ===>
      // const store = {
      //   195: {
      //     channel_list: [],
      //     channel_status: '',
      //     ts__channel_list: 12432423434,
      //     ts__channel_status: 14232034580,
      //   }
      // };
      const msgId = getMsgId(msg);
      if (!msgId) return;
      const newMsg = {};
      // 将推送消息数组结构转化为对象结构
      (msg.status || []).forEach(s => {
        const {k = '', v = ''} = s;
        k && (newMsg[k] = v);
      });
      switch (msg.type) {
        case websocketType.deviceStatus:
          const ignoreKey = ['entityType', 'type', 'ts']; // todo 除了Store Key，其他的时间撮一律排除
          const lastMsg = state.deviceStatusMsg;
          updateSocketMsgStore(msgId, lastMsg, newMsg);
          // todo 临时处理 给每个 key 加一个 key_ts 时间戳的 key
          const status = msg[msgId] || {};
          const {ts = ''} = status; // 时间戳
          Object.keys(status).forEach(k => {
            // 过滤 key 为 'ts' 的值
            !ignoreKey.includes(k) && (lastMsg[msgId][`ts__${k}`] = ts);
          });
          // todo 坑：直接 state.deviceStatusMsg.msg = lastMsg 会不触发store变化
          state.deviceStatusMsg = {...lastMsg};
          break;
        case websocketType.roomAlarm:
          // 根据alarmConfigName判断是否为全局告警提示
          if (msg.alarmConfigName) {
            state.roomAlarmMsg = msg;
            state.roomAlarmMsg = {...state.roomAlarmMsg, roomId: msgId, ...newMsg};
          } else {
            state.roomAlarmMsg = {roomId: msgId, ...newMsg};
          }
          break;
        case websocketType.roomScore:
          state.roomScoreMsg = {roomId: msgId, ...newMsg};
          break;
        case websocketType.roomUsageState:
          let showMsg = false;
          (msg.status || []).forEach(s => {
            const {show = false} = s;
            show && (showMsg = show);
          });
          state.roomUsageStateMsg = {roomId: msgId, ...newMsg, show: showMsg};
          break;
        case websocketType.deviceOnline:
          state.deviceOnlineMsg = {deviceId: msgId, ...newMsg};
          break;
        case websocketType.deviceAlarm:
          // 根据alarmConfigName判断是否为全局告警恢复提示
          if (msg.alarmConfigName) {
            state.deviceAlarmMsg = msg;
            state.deviceAlarmMsg = {...state.deviceAlarmMsg, deviceId: msgId, ...newMsg};
          } else {
            state.deviceAlarmMsg = {deviceId: msgId, ...newMsg};
          }
          break;
        default:
          break;
      }
    },
    // 推送消息处理
    updateAlarmRule(state, alarmObj) {
      state.alarmRule[alarmObj.alarmId] = alarmObj;
    },
    // 设备控制超时相关
    updateDevCtrTimer(state, timerInfo = {}) {
      const {deviceId = ''} = timerInfo;
      const lastTimer = state.devCtrTimer;
      if (!lastTimer[deviceId]) {
        lastTimer[deviceId] = {timer: {}, active: false};
      } else {
        timerInfo.hasOwnProperty('timer') && (lastTimer[deviceId].timer = timerInfo.timer);
        timerInfo.hasOwnProperty('active') && (lastTimer[deviceId].active = timerInfo.active);
      }
      state.devCtrTimer = {...lastTimer};
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
      state.browserSuggest = false;
      state.websocket = null;
      state.wsConnected = false;
      state.wsReconnecting = false;
      state.wsSubscription = [];
      state.deviceStatusMsg = {};
      state.roomAlarmMsg = {};
      state.roomScoreMsg = {};
      state.deviceOnlineMsg = {};
      state.deviceAlarmMsg = {};
      state.roomUsageStateMsg = {};
      state.alarmRule = {};
      state.tokenCount = true;
      state.devCtrTimer = {};
      state.tableState = {};
      state.roomName = '';
    }
  }
});
