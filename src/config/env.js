let baseUrl = '';
let websocketUrl = '';
let tenant = '';

if (process.env.NODE_ENV === 'development') {
  tenant = 'EZPRO';

  // baseUrl = 'http://localhost:8080'; // local
  // baseUrl = 'http://172.16.120.190:8082'; // Neo
  // baseUrl = 'http://172.16.120.48:8082'; // Amos
  baseUrl = 'http://172.16.120.204:8082'; // Ethan
  // baseUrl = 'http://172.16.120.86:8082'; // Hanson
  // baseUrl = 'http://192.168.128.76:8080'; // Rocker
  // baseUrl = 'http://192.168.80.240:8082'; // dev
  // baseUrl = 'http://manager.ezcloud.local'; // 5f

  // websocketUrl = 'ws://192.168.50.33:3001/ws/ezpro'; // dev
  // websocketUrl = 'ws://192.168.6.51:3001/ws/ezpro'; // Neo
  websocketUrl = 'ws://172.16.120.48:3001/ws/ezpro'; // Amos
  // websocketUrl = 'ws://192.168.6.109:3001/ws/ezpro'; // Ethan
  // websocketUrl = 'ws://192.168.6.52:3001/ws/ezpro'; // Hanson
  // websocketUrl = 'ws://10.253.12.52:3001/ws/ezpro'; // Rocker
  // websocketUrl = 'ws://192.168.80.240:3001/ws/ezpro'; // dev
  // websocketUrl = 'ws://192.168.50.33:3001/ws/ezpro'; // 5f
} else if (process.env.NODE_ENV === 'production') {
  tenant = 'EZPRO';

  baseUrl = window.location.protocol + '//' + window.location.hostname;
  if (window.location.protocol === 'https:') {
    websocketUrl = 'wss://' + window.location.hostname + '/ws';
  } else {
    websocketUrl = 'ws://' + window.location.hostname + '/ws';
  }
}

export {baseUrl, websocketUrl, tenant};
