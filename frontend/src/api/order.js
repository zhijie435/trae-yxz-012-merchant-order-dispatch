import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.data;
    }
    return Promise.reject(new Error(res.message || '请求失败'));
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getOrderList = (status, orderType = 'all') => {
  return request.get('/orders', {
    params: { status, orderType }
  });
};

export const getOrderStatistics = () => {
  return request.get('/orders/statistics');
};

export const getStatusConfig = (orderType = 'all') => {
  return request.get('/status/config', {
    params: { orderType }
  });
};

export const getOrderTypes = () => {
  return request.get('/order-types');
};
