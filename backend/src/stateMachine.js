const {
  ORDER_TYPE,
  ORDER_STATUS,
  OPERATION_LABEL,
  RENT_STATUS_MAP,
  SALE_STATUS_MAP
} = require('./constants');

const RENT_STATE_TRANSITIONS = {
  [ORDER_STATUS.PENDING_ACCEPT]: [
    ORDER_STATUS.PENDING_ASSIGN,
    ORDER_STATUS.ESCALATED_TO_HQ,
    ORDER_STATUS.REJECTED,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.PENDING_ASSIGN]: [
    ORDER_STATUS.PENDING_DELIVER,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.PENDING_DELIVER]: [
    ORDER_STATUS.RENTING,
    ORDER_STATUS.PENDING_DELIVER,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.RENTING]: [
    ORDER_STATUS.PENDING_RETURN,
    ORDER_STATUS.RENTING,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.PENDING_RETURN]: [
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.PENDING_RETURN,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.ESCALATED_TO_HQ]: [
    ORDER_STATUS.PENDING_ACCEPT,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.REJECTED]: [
    ORDER_STATUS.PENDING_ACCEPT
  ],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: []
};

const SALE_STATE_TRANSITIONS = {
  [ORDER_STATUS.PENDING_PAY]: [
    ORDER_STATUS.PENDING_SHIP,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.PENDING_SHIP]: [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.SHIPPED]: [
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED
  ],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: []
};

const OrderStateMachine = {
  canTransition(order, nextStatus) {
    const transitions = order.orderType === ORDER_TYPE.RENT
      ? RENT_STATE_TRANSITIONS
      : SALE_STATE_TRANSITIONS;
    const allowed = transitions[order.status] || [];
    return allowed.includes(nextStatus);
  },

  validateTransition(order, nextStatus, operationType) {
    if (!this.canTransition(order, nextStatus)) {
      return {
        valid: false,
        message: `订单状态「${this.getStatusLabel(order)}」不支持${OPERATION_LABEL[operationType] || '该操作'}`
      };
    }
    return { valid: true };
  },

  getStatusLabel(order) {
    const map = order.orderType === ORDER_TYPE.RENT ? RENT_STATUS_MAP : SALE_STATUS_MAP;
    return (map[order.status] || {}).label || '未知';
  },

  getTransitionsForStatus(orderType, status) {
    const transitions = orderType === ORDER_TYPE.RENT
      ? RENT_STATE_TRANSITIONS
      : SALE_STATE_TRANSITIONS;
    return transitions[status] || [];
  }
};

module.exports = OrderStateMachine;
