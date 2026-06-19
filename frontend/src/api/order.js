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

export const getOrderList = (status, orderType = 'all', employeeId = '') => {
  return request.get('/orders', {
    params: { status, orderType, employeeId }
  });
};

export const getOrderStatistics = (employeeId = '') => {
  return request.get('/orders/statistics', {
    params: employeeId ? { employeeId } : {}
  });
};

export const getStatusConfig = (orderType = 'all', role = 'store') => {
  return request.get('/status/config', {
    params: { orderType, role }
  });
};

export const getOrderTypes = () => {
  return request.get('/order-types');
};

export const getStores = () => {
  return request.get('/stores');
};

export const getCurrentStore = () => {
  return request.get('/current-store');
};

export const getEmployees = (storeId) => {
  return request.get('/employees', {
    params: storeId ? { storeId } : {}
  });
};

export const acceptOrder = (orderId) => {
  return request.post(`/orders/${orderId}/accept`);
};

export const escalateOrderToHq = (orderId, reason) => {
  return request.post(`/orders/${orderId}/escalate-to-hq`, { reason });
};

export const assignStaff = (orderId, employee) => {
  return request.post(`/orders/${orderId}/assign-staff`, {
    employeeId: employee.id,
    employeeName: employee.name,
    employeePhone: employee.phone
  });
};

export const hqReassignStore = (orderId, targetStoreId) => {
  return request.post(`/orders/${orderId}/hq-reassign`, { targetStoreId });
};

export const cancelOrder = (orderId, reason) => {
  return request.post(`/orders/${orderId}/cancel`, { reason });
};

export const deliverOrder = (orderId) => {
  return request.post(`/orders/${orderId}/deliver`);
};

export const returnOrder = (orderId) => {
  return request.post(`/orders/${orderId}/return`);
};

export const getCurrentEmployee = () => {
  return request.get('/current-employee');
};
