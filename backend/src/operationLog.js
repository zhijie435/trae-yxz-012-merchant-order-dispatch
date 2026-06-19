const { OPERATION_LABEL, ROLE } = require('./constants');

let operationLogs = [];

const OperationLogService = {
  _reset() {
    operationLogs = [];
  },

  _getAll() {
    return [...operationLogs];
  },

  create(params) {
    const log = {
      id: `LOG${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      orderId: params.orderId,
      orderType: params.orderType || '',
      operationType: params.operationType,
      operationLabel: OPERATION_LABEL[params.operationType] || params.operationType,
      operatorRole: params.operatorRole || ROLE.STORE,
      operatorId: params.operatorId || '',
      operatorName: params.operatorName || '',
      fromStatus: params.fromStatus || '',
      toStatus: params.toStatus || '',
      remark: params.remark || '',
      extra: params.extra || {},
      operateTime: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    operationLogs.unshift(log);
    return log;
  },

  findByOrderId(orderId) {
    return operationLogs.filter(log => log.orderId === orderId);
  },

  findAll(filters = {}) {
    let logs = [...operationLogs];
    if (filters.orderId) {
      logs = logs.filter(log => log.orderId === filters.orderId);
    }
    if (filters.operationType) {
      logs = logs.filter(log => log.operationType === filters.operationType);
    }
    if (filters.operatorRole) {
      logs = logs.filter(log => log.operatorRole === filters.operatorRole);
    }
    return logs;
  }
};

module.exports = OperationLogService;
