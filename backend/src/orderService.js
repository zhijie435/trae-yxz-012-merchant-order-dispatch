const { ORDER_STATUS, OPERATION_TYPE, ROLE } = require('./constants');
const OrderStateMachine = require('./stateMachine');
const OperationLogService = require('./operationLog');
const {
  mockOrders,
  mockEmployees,
  mockStores,
  CURRENT_OPERATOR
} = require('./mockData');

let orders = JSON.parse(JSON.stringify(mockOrders));
let employees = JSON.parse(JSON.stringify(mockEmployees));
let stores = JSON.parse(JSON.stringify(mockStores));

const nowStr = () => new Date().toLocaleString('zh-CN', { hour12: false });

const getOperator = (role = ROLE.STORE) => {
  return CURRENT_OPERATOR[role] || CURRENT_OPERATOR[ROLE.STORE];
};

const findOrderIndex = (orderId) => {
  return orders.findIndex(o => o.id === orderId);
};

const findOrder = (orderId) => {
  return orders.find(o => o.id === orderId);
};

const OrderService = {
  _reset() {
    orders = JSON.parse(JSON.stringify(mockOrders));
    employees = JSON.parse(JSON.stringify(mockEmployees));
    stores = JSON.parse(JSON.stringify(mockStores));
    OperationLogService._reset();
  },

  _getAllOrders() {
    return [...orders];
  },

  _getAllEmployees() {
    return [...employees];
  },

  _getAllStores() {
    return [...stores];
  },

  acceptOrder(orderId, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.PENDING_ASSIGN, OPERATION_TYPE.ACCEPT);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.PENDING_ASSIGN;

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.ACCEPT,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: '门店确认接单'
    });

    return {
      success: true,
      message: '接单成功，已进入待指派状态',
      data: order
    };
  },

  rejectOrder(orderId, reason, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    if (!reason || !reason.trim()) {
      return { success: false, code: 400, message: '请填写拒单原因' };
    }

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.REJECTED, OPERATION_TYPE.REJECT);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.REJECTED;
    order.rejectReason = reason.trim();

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.REJECT,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: reason.trim()
    });

    return {
      success: true,
      message: '已拒单，原因已记录',
      data: order
    };
  },

  escalateToHq(orderId, reason, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    if (!reason || !reason.trim()) {
      return { success: false, code: 400, message: '请填写上报原因' };
    }

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.ESCALATED_TO_HQ, OPERATION_TYPE.ESCALATE);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.ESCALATED_TO_HQ;
    order.escalateReason = reason.trim();

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.ESCALATE,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: reason.trim()
    });

    return {
      success: true,
      message: '已提交总部处理，请耐心等待',
      data: order
    };
  },

  assignStaff(orderId, employee, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;
    const wasAssigned = !!order.assignedEmployee;
    const operationType = wasAssigned ? OPERATION_TYPE.REASSIGN : OPERATION_TYPE.ASSIGN;

    if (!employee || !employee.id || !employee.name) {
      return { success: false, code: 400, message: '请选择员工' };
    }

    const assignableStatuses = [
      ORDER_STATUS.PENDING_ASSIGN,
      ORDER_STATUS.PENDING_DELIVER,
      ORDER_STATUS.RENTING,
      ORDER_STATUS.PENDING_RETURN
    ];
    if (!assignableStatuses.includes(order.status)) {
      return { success: false, code: 400, message: '当前状态不支持指派员工' };
    }

    const emp = employees.find(e => e.id === employee.id);
    if (!emp) {
      return { success: false, code: 404, message: '员工不存在' };
    }
    if (emp.status === 'on_leave') {
      return { success: false, code: 400, message: '该员工正在休假，无法指派' };
    }
    if (emp.status === 'busy' && !(wasAssigned && order.assignedEmployee.id === emp.id)) {
      return { success: false, code: 400, message: '该员工当前忙碌，建议指派空闲员工' };
    }

    const now = nowStr();
    const action = wasAssigned ? '更换员工' : '初次指派';
    const newAssignment = {
      id: employee.id,
      name: employee.name,
      phone: employee.phone || emp.phone,
      assignTime: now,
      action
    };

    if (!order.assignHistory) {
      order.assignHistory = [];
    }
    order.assignHistory.push(newAssignment);
    order.assignedEmployee = {
      id: employee.id,
      name: employee.name,
      phone: employee.phone || emp.phone,
      assignTime: now
    };

    if (order.status === ORDER_STATUS.PENDING_ASSIGN) {
      order.status = ORDER_STATUS.PENDING_DELIVER;
    }

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: action,
      extra: {
        employeeId: employee.id,
        employeeName: employee.name,
        employeePhone: employee.phone || emp.phone
      }
    });

    return {
      success: true,
      message: wasAssigned ? '员工更换成功' : '员工指派成功',
      data: order
    };
  },

  deliverOrder(orderId, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.RENTING, OPERATION_TYPE.DELIVER);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    if (!order.assignedEmployee) {
      return { success: false, code: 400, message: '请先指派员工再发货' };
    }

    order.status = ORDER_STATUS.RENTING;

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.DELIVER,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: '确认发货交付，租赁服务开始'
    });

    return {
      success: true,
      message: '发货成功，订单进入租赁中',
      data: order
    };
  },

  returnOrder(orderId, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.COMPLETED, OPERATION_TYPE.RETURN);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.COMPLETED;

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.RETURN,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: '退租完成，订单完结'
    });

    return {
      success: true,
      message: '退租完成，订单已完结',
      data: order
    };
  },

  hqReassign(orderId, targetStoreId, operatorRole = ROLE.HQ) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.PENDING_ACCEPT, OPERATION_TYPE.HQ_REASSIGN);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    if (!targetStoreId) {
      return { success: false, code: 400, message: '请选择目标门店' };
    }

    const targetStore = stores.find(s => s.id === targetStoreId);
    if (!targetStore) {
      return { success: false, code: 404, message: '目标门店不存在' };
    }

    order.storeId = targetStoreId;
    order.status = ORDER_STATUS.PENDING_ACCEPT;
    order.escalateReason = '';
    order.rejectReason = '';
    order.assignedEmployee = null;
    order.assignHistory = [];

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.HQ_REASSIGN,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: `重新分配至「${targetStore.name}」`,
      extra: {
        targetStoreId,
        targetStoreName: targetStore.name
      }
    });

    return {
      success: true,
      message: `已重新分配至${targetStore.name}`,
      data: order
    };
  },

  cancelOrder(orderId, reason, operatorRole = ROLE.HQ) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    if (order.status === ORDER_STATUS.COMPLETED) {
      return { success: false, code: 400, message: '已完成订单无法取消' };
    }

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.CANCELLED, OPERATION_TYPE.CANCEL);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelReason = reason || '操作取消';

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.CANCEL,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: reason || '操作取消'
    });

    return {
      success: true,
      message: '订单已取消',
      data: order
    };
  },

  saleShip(orderId, operatorRole = ROLE.STORE) {
    const idx = findOrderIndex(orderId);
    if (idx === -1) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const order = orders[idx];
    const fromStatus = order.status;

    const validation = OrderStateMachine.validateTransition(order, ORDER_STATUS.SHIPPED, OPERATION_TYPE.SHIP);
    if (!validation.valid) {
      return { success: false, code: 400, message: validation.message };
    }

    order.status = ORDER_STATUS.SHIPPED;
    order.shipTime = nowStr();

    const operator = getOperator(operatorRole);
    OperationLogService.create({
      orderId: order.id,
      orderType: order.orderType,
      operationType: OPERATION_TYPE.SHIP,
      operatorRole: operator.role,
      operatorId: operator.id,
      operatorName: operator.name,
      fromStatus,
      toStatus: order.status,
      remark: '销售订单已发货'
    });

    return {
      success: true,
      message: '发货成功',
      data: order
    };
  },

  filterOrders({ status, orderType, employeeId } = {}) {
    let result = [...orders];

    if (orderType && orderType !== 'all') {
      result = result.filter(order => order.orderType === orderType);
    }

    if (status && status !== ORDER_STATUS.ALL) {
      result = result.filter(order => order.status === status);
    }

    if (employeeId) {
      result = result.filter(order => order.assignedEmployee && order.assignedEmployee.id === employeeId);
    }

    return result;
  },

  getOrderStatistics(employeeId = '') {
    const { ORDER_TYPE, ORDER_STATUS } = require('./constants');
    let rentOrders = orders.filter(o => o.orderType === ORDER_TYPE.RENT);
    let saleOrders = orders.filter(o => o.orderType === ORDER_TYPE.SALE);

    if (employeeId) {
      rentOrders = rentOrders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId);
      saleOrders = saleOrders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId);
    }

    const myOrders = employeeId
      ? orders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId)
      : orders;

    return {
      all: myOrders.length,
      rent_all: rentOrders.length,
      sale_all: saleOrders.length,
      pending_accept: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ACCEPT).length,
      pending_assign: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ASSIGN).length,
      pending_deliver: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_DELIVER).length,
      renting: rentOrders.filter(o => o.status === ORDER_STATUS.RENTING).length,
      pending_return: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_RETURN).length,
      escalated_to_hq: rentOrders.filter(o => o.status === ORDER_STATUS.ESCALATED_TO_HQ).length,
      rejected: rentOrders.filter(o => o.status === ORDER_STATUS.REJECTED).length,
      pending_pay: saleOrders.filter(o => o.status === ORDER_STATUS.PENDING_PAY).length,
      pending_ship: saleOrders.filter(o => o.status === ORDER_STATUS.PENDING_SHIP).length,
      shipped: saleOrders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
      completed: saleOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
      cancelled: myOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length
    };
  },

  getStatusConfig(orderType = 'all', role = 'store') {
    const { ORDER_TYPE, ORDER_STATUS, ROLE } = require('./constants');
    let statusList = [];

    if (role === 'employee') {
      return [
        { key: ORDER_STATUS.ALL, label: '全部', orderType: 'all' },
        { key: ORDER_STATUS.PENDING_DELIVER, label: '待交付', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.RENTING, label: '租赁中', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.PENDING_RETURN, label: '待退租', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.COMPLETED, label: '已完成', orderType: ORDER_TYPE.RENT }
      ];
    }

    if (orderType === 'all' || orderType === ORDER_TYPE.RENT) {
      const rentStatuses = [
        { key: ORDER_STATUS.PENDING_ACCEPT, label: '待接单', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.PENDING_ASSIGN, label: '待指派', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.PENDING_DELIVER, label: '待交付', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.RENTING, label: '租赁中', orderType: ORDER_TYPE.RENT },
        { key: ORDER_STATUS.PENDING_RETURN, label: '待退租', orderType: ORDER_TYPE.RENT }
      ];
      if (role === ROLE.STORE) {
        rentStatuses.push({ key: ORDER_STATUS.REJECTED, label: '已拒单', orderType: ORDER_TYPE.RENT });
      }
      if (role === ROLE.HQ) {
        rentStatuses.push({ key: ORDER_STATUS.ESCALATED_TO_HQ, label: '待总部处理', orderType: ORDER_TYPE.RENT });
      }
      rentStatuses.push({ key: ORDER_STATUS.CANCELLED, label: '已取消', orderType: ORDER_TYPE.RENT });
      statusList = statusList.concat(rentStatuses);
    }

    if (orderType === 'all' || orderType === ORDER_TYPE.SALE) {
      const saleStatuses = [
        { key: ORDER_STATUS.PENDING_PAY, label: '待付款', orderType: ORDER_TYPE.SALE },
        { key: ORDER_STATUS.PENDING_SHIP, label: '待发货', orderType: ORDER_TYPE.SALE },
        { key: ORDER_STATUS.SHIPPED, label: '已发货', orderType: ORDER_TYPE.SALE },
        { key: ORDER_STATUS.COMPLETED, label: '已完成', orderType: ORDER_TYPE.SALE },
        { key: ORDER_STATUS.CANCELLED, label: '已取消', orderType: ORDER_TYPE.SALE }
      ];
      statusList = statusList.concat(saleStatuses);
    }

    const seen = new Set();
    statusList = statusList.filter(item => {
      if (seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });

    statusList.unshift({ key: ORDER_STATUS.ALL, label: '全部', orderType: 'all' });

    return statusList;
  },

  getOrderLogs(orderId) {
    const order = findOrder(orderId);
    if (!order) {
      return { success: false, code: 404, message: '订单不存在' };
    }
    const logs = OperationLogService.findByOrderId(orderId);
    return { success: true, data: logs };
  }
};

module.exports = OrderService;
