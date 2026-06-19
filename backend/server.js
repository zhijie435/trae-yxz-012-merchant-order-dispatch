const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

const {
  ORDER_TYPE,
  ORDER_STATUS,
  RENT_STATUS_MAP,
  SALE_STATUS_MAP,
  ROLE
} = require('./src/constants');

const OrderStateMachine = require('./src/stateMachine');
const OperationLogService = require('./src/operationLog');
const OrderService = require('./src/orderService');

const {
  mockStores,
  CURRENT_STORE_ID,
  CURRENT_EMPLOYEE_ID
} = require('./src/mockData');

app.use(cors());
app.use(express.json());

const getStatusInfo = (order) => {
  if (order.orderType === ORDER_TYPE.RENT) {
    return RENT_STATUS_MAP[order.status] || { label: '未知', color: '#909399' };
  }
  return SALE_STATUS_MAP[order.status] || { label: '未知', color: '#909399' };
};

const handleServiceResult = (res, result) => {
  if (result.success) {
    res.json({
      code: 0,
      message: result.message,
      data: result.data
    });
  } else {
    res.json({
      code: result.code || 1,
      message: result.message
    });
  }
};

app.get('/api/orders', (req, res) => {
  const { status, orderType, employeeId } = req.query;

  let orders = OrderService.filterOrders({ status, orderType, employeeId })
    .map(order => {
      const statusInfo = getStatusInfo(order);
      return {
        ...order,
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color
      };
    });

  res.json({
    code: 0,
    message: 'success',
    data: orders
  });
});

app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const orders = OrderService._getAllOrders();
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const statusInfo = getStatusInfo(order);
  res.json({
    code: 0,
    message: 'success',
    data: {
      ...order,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color
    }
  });
});

app.get('/api/orders/statistics', (req, res) => {
  const { employeeId } = req.query;
  const statistics = OrderService.getOrderStatistics(employeeId || '');

  res.json({
    code: 0,
    message: 'success',
    data: statistics
  });
});

app.get('/api/status/config', (req, res) => {
  const { orderType = 'all', role = 'store' } = req.query;
  const statusList = OrderService.getStatusConfig(orderType, role);

  res.json({
    code: 0,
    message: 'success',
    data: statusList
  });
});

app.get('/api/order-types', (req, res) => {
  const typeList = [
    { key: 'all', label: '全部' },
    { key: ORDER_TYPE.RENT, label: '租赁订单' },
    { key: ORDER_TYPE.SALE, label: '销售订单' }
  ];

  res.json({
    code: 0,
    message: 'success',
    data: typeList
  });
});

app.get('/api/stores', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: mockStores
  });
});

app.get('/api/current-store', (req, res) => {
  const store = mockStores.find(s => s.id === CURRENT_STORE_ID);
  res.json({
    code: 0,
    message: 'success',
    data: store
  });
});

app.get('/api/current-employee', (req, res) => {
  const employees = OrderService._getAllEmployees();
  const employee = employees.find(e => e.id === CURRENT_EMPLOYEE_ID);
  if (!employee) {
    return res.json({ code: 1, message: '员工不存在' });
  }
  const store = mockStores.find(s => s.id === employee.storeId);
  res.json({
    code: 0,
    message: 'success',
    data: { ...employee, storeName: store ? store.name : '' }
  });
});

app.get('/api/employees', (req, res) => {
  const { storeId } = req.query;
  let employees = OrderService._getAllEmployees();
  if (storeId) {
    employees = employees.filter(e => e.storeId === storeId);
  }
  res.json({
    code: 0,
    message: 'success',
    data: employees
  });
});

app.get('/api/orders/:id/logs', (req, res) => {
  const { id } = req.params;
  const result = OrderService.getOrderLogs(id);
  handleServiceResult(res, result);
});

app.get('/api/operation-logs', (req, res) => {
  const { orderId, operationType, operatorRole } = req.query;
  const logs = OperationLogService.findAll({ orderId, operationType, operatorRole });
  res.json({
    code: 0,
    message: 'success',
    data: logs
  });
});

app.get('/api/orders/:id/transitions', (req, res) => {
  const { id } = req.params;
  const orders = OrderService._getAllOrders();
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const nextStatuses = OrderStateMachine.getTransitionsForStatus(order.orderType, order.status);
  const transitions = nextStatuses.map(status => {
    const info = order.orderType === ORDER_TYPE.RENT
      ? RENT_STATUS_MAP[status]
      : SALE_STATUS_MAP[status];
    return {
      status,
      label: info?.label || status,
      color: info?.color || '#909399'
    };
  });
  res.json({
    code: 0,
    message: 'success',
    data: {
      currentStatus: order.status,
      currentLabel: OrderStateMachine.getStatusLabel(order),
      transitions
    }
  });
});

app.post('/api/orders/:id/accept', (req, res) => {
  const { id } = req.params;
  const { operatorRole } = req.body || {};
  const result = OrderService.acceptOrder(id, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason, operatorRole } = req.body || {};
  const result = OrderService.rejectOrder(id, reason, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/escalate-to-hq', (req, res) => {
  const { id } = req.params;
  const { reason, operatorRole } = req.body || {};
  const result = OrderService.escalateToHq(id, reason, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/assign-staff', (req, res) => {
  const { id } = req.params;
  const { employeeId, employeeName, employeePhone, operatorRole } = req.body || {};
  const result = OrderService.assignStaff(
    id,
    { id: employeeId, name: employeeName, phone: employeePhone },
    operatorRole || ROLE.STORE
  );
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/hq-reassign', (req, res) => {
  const { id } = req.params;
  const { targetStoreId, operatorRole } = req.body || {};
  const result = OrderService.hqReassign(id, targetStoreId, operatorRole || ROLE.HQ);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason, operatorRole } = req.body || {};
  const result = OrderService.cancelOrder(id, reason, operatorRole || ROLE.HQ);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/deliver', (req, res) => {
  const { id } = req.params;
  const { operatorRole } = req.body || {};
  const result = OrderService.deliverOrder(id, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/return', (req, res) => {
  const { id } = req.params;
  const { operatorRole } = req.body || {};
  const result = OrderService.returnOrder(id, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.post('/api/orders/:id/sale-ship', (req, res) => {
  const { id } = req.params;
  const { operatorRole } = req.body || {};
  const result = OrderService.saleShip(id, operatorRole || ROLE.STORE);
  handleServiceResult(res, result);
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log('====== 重构模块说明 ======');
  console.log('1. 常量模块: src/constants.js');
  console.log('2. 状态机模块: src/stateMachine.js');
  console.log('3. 操作日志模块: src/operationLog.js');
  console.log('4. 订单服务层: src/orderService.js');
  console.log('5. Mock数据: src/mockData.js');
  console.log('6. 单元测试: tests/ 目录');
  console.log('7. 运行测试: npm test');
});
