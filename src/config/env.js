let baseUrl = '';

if (process.env.NODE_ENV === 'development') {
  baseUrl = 'http://172.16.120.204:8082'; // Henry
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = window.location.protocol + '//' + window.location.hostname;
}

export {baseUrl};
