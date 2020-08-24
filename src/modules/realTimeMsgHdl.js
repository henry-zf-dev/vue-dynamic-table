import {websocketUrl} from '../config/env';
import {getStorage, StorageKey} from '../config/sessions';
import {isJsonString} from '../utils';
import store from '../store/index';
import {websocketType} from '../config/common';
import WebsocketHeartbeat from 'websocket-heartbeat-js';

export class RealTimeMsgHandle {
  static closeWebsocket() {
    const websocket = store.state.websocket;
    if (!websocket) return;
    websocket.close();
  }

  static sendMsg(type = '', subMsg = '', keys = []) {
    const websocket = store.state.websocket;
    if (!websocket || !websocket.ws || websocket.ws.readyState !== 1) return;
    if (type === 'login') {
      websocket.send(JSON.stringify({
        type: type,
        data: {
          [subMsg]: keys[0]
        }
      }));
      RealTimeMsgHandle.bulkSubscription();
    } else {
      websocket.send(JSON.stringify({
        type: type,
        data: {
          subMsg: subMsg,
          keys: keys
        }
      }));
    }
  }

  // 批量订阅
  static bulkSubscription() {
    RealTimeMsgHandle.subscribe([], websocketType.deviceOnline); // 设备在线状态
    RealTimeMsgHandle.subscribe([], websocketType.deviceAlarm); // 设备告警状态
    RealTimeMsgHandle.subscribe([], websocketType.roomAlarm); // 房间告警状态
    RealTimeMsgHandle.subscribe([], websocketType.roomScore); // 房间分数
    RealTimeMsgHandle.subscribe([], websocketType.roomUsageState); // 房间有人无人、开关系统、情景ID、自动共享状态
  }

  // 批量取消订阅
  static bulkUnSubscription() {
    RealTimeMsgHandle.unsubscribe([], websocketType.deviceOnline); // 设备在线状态
    RealTimeMsgHandle.unsubscribe([], websocketType.deviceAlarm); // 设备告警状态
    RealTimeMsgHandle.unsubscribe([], websocketType.roomAlarm); // 房间告警状态
    RealTimeMsgHandle.unsubscribe([], websocketType.roomScore); // 房间分数
    RealTimeMsgHandle.unsubscribe([], websocketType.roomUsageState); // 房间有人无人、开关系统、情景ID、自动共享状态
  }

  static subscribe(deviceIds = [], subType = websocketType.deviceStatus) {
    RealTimeMsgHandle.sendMsg('subscribe', subType, deviceIds);
    if (deviceIds.length > 0) {
      store.commit('addWsSubscription', {
        subType: subType,
        id: deviceIds[0]
      });
    }
  }

  static unsubscribe(deviceIds = [], subType = websocketType.deviceStatus) {
    RealTimeMsgHandle.sendMsg('unsubscribe', subType, deviceIds);
    if (deviceIds.length > 0) {
      store.commit('removeWsSubscription', {
        subType: subType,
        id: deviceIds[0]
      });
    }
  }

  static loginToken(token = '') {
    RealTimeMsgHandle.sendMsg('login', 'token', [token]);
  }

  static reSubscribe() {
    store.state.wsSubscription.forEach(s => {
      RealTimeMsgHandle.subscribe([s.id], s.subType);
    });
  }

  initWebsocket() {
    /* eslint-disable */
    return;
    const token = getStorage(StorageKey.token);
    if (!token) return;
    // 每隔 pingTimeout 的时间间隔，发一次心跳，
    // 如果经过 pongTimeout 的时间间隔，都没有收到服务器返回，
    // 则每隔 reconnectTimeout 的时间间隔，进行重连
    const websocket = new WebsocketHeartbeat({
      url: websocketUrl,
      pingTimeout: 35000,
      pongTimeout: 3000,
      reconnectTimeout: 5000,
      pingMsg: JSON.stringify({type: 'heartbeat'})
    });
    websocket.onopen = function () {
      console.log('##### connect success #####');
      store.commit('updateWsReconnecting', false);
      // websocket连接成功后先发送token校验
      RealTimeMsgHandle.loginToken(token);
      // 重连之后，订阅之前已经订阅的主题
      RealTimeMsgHandle.reSubscribe();
    };
    websocket.onmessage = function (msg) {
      // TODO 优化 token 无效处理 Henry 2020-03-13 20:39:13
      if (msg.data.includes('invalid token')) {
        // TODO 考虑收到 token无效 消息后直接退出登录 Henry 2020-03-30 15:13:34
        RealTimeMsgHandle.closeWebsocket();
        store.commit('updateWsReconnecting', true);
        return;
      }
      if (msg && msg.data && isJsonString(msg.data)) {
        store.commit('updateSocketMsg', JSON.parse(msg.data));
      }
    };
    websocket.onreconnect = function () {
      console.log('##### websocket reconnecting... #####');
      store.commit('updateWsReconnecting', true);
    };
    store.commit('initWebsocket', websocket);
  }
}
