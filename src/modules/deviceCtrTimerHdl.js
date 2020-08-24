import store from '../store';
import objectPath from 'object-path';
import { judgeEqualByJson } from '../utils';
import { devCtrTimerConfig } from '../config/common';

export class DevCtrTimerHdl {
  static initTimer(deviceId = '') {
    store.commit('updateDevCtrTimer', { deviceId });
  }

  static startTimer(deviceId = '', timeout = 1000) {
    if (timeout === devCtrTimerConfig.none) return;
    const timerInfo = store.state.devCtrTimer[deviceId];
    if (!timerInfo) return;
    // eslint-disable-next-line prefer-const
    let { timer, active = false } = timerInfo;
    if (active) return;
    timer = setTimeout(() => {
      DevCtrTimerHdl.clearTimer(deviceId, timer);
    }, timeout);
    store.commit('updateDevCtrTimer', { deviceId, timer, active: true });
  }

  static clearTimer(deviceId = '', timer = {}) {
    clearTimeout(timer);
    store.commit('updateDevCtrTimer', { deviceId, timer: {}, active: false });
  }

  // 页面拿到状态 ws 推送消息后，组装页面数据源
  // 根据传入的数据以及 expect 期望值的对比，决定是否清空计时器
  static updateCtrStatus(deviceId = '', status = {}, expect = {}) {
    // TODO Henry 2020-03-20 14:44:18
    //  超时时间直接使用分控下发的控制间隔，
    //  即使设备最新状态已经下发，但可能还不能对设备继续进行控制
    const { expectKey: key = '', value = '' } = expect;
    if (!key) return;
    const timerInfo = store.state.devCtrTimer[deviceId];
    if (!timerInfo) return;
    const { timer } = timerInfo;
    // 判断预期值与实际值是否满足，如果满足，则清空计时器
    if (!judgeEqualByJson(objectPath.get(status, key), value)) return;
    DevCtrTimerHdl.clearTimer(deviceId, timer);
  }
}
