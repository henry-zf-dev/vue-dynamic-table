import Vue from 'vue';
import Notify from './CustomNotify.vue';
const Notification = Vue.extend(Notify);

let instance;
const instances = [];
let seed = 1;

const CustomNotify = function(options = {}) {
  const id = 'notification_' + seed++;
  instance = new Notification({data: options});
  instance.id = id;
  // Vue 实例在实例化时没有收到 el 选项，则它处于"未挂载"状态，没有关联的 DOM 元素
  // 可以使用 vm.$mount() 手动挂载一个未挂载的实例
  // 如果没有提供 elementOrSelector 参数，模板将被渲染为文档之外的元素
  // 你必须使用原生 DOM API 把他插入到文档中
  instance.$mount();
  instance.visible = true;
  instance.dom = instance.$el;
  // 缓存用户重写的 onclose 事件，用于在 onclose 时对 instances 进行额外的操作
  const userOnclose = options.onclose;
  options.onclose = function() {
    CustomNotify.close(id, userOnclose);
  };

  let top = 0;
  instances.forEach(item => {
    top += item.$el.offsetHeight + 16;
  });
  top += 16;
  instance.positionTop = top;
  instances.push(instance);
  document.body.appendChild(instance.$el);
  return instance;
};

CustomNotify.close = function(id, userOnclose) {
  let index = -1;
  const len = instances.length;
  const instance = instances.filter((instance, i) => {
    if (instance.id === id) {
      index = i;
      return true;
    }
    return false;
  })[0];
  if (!instance) return;

  if (typeof userOnclose === 'function') {
    userOnclose(instance);
  }

  instances.splice(index, 1);
  if (len <= 1) return;
  const removedHeight = instance.dom.offsetHeight;
  for (let i = index; i < len - 1; i++) {
    const top = instances[i].dom.style.top;
    instances[i].dom.style.top = parseInt(top, 10) - removedHeight - 16 + 'px';
  }
};

export default CustomNotify;
