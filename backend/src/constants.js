const ORDER_TYPE = {
  RENT: 'rent',
  SALE: 'sale'
};

const ORDER_STATUS = {
  ALL: 'all',
  PENDING_ACCEPT: 'pending_accept',
  PENDING_ASSIGN: 'pending_assign',
  PENDING_DELIVER: 'pending_deliver',
  RENTING: 'renting',
  PENDING_RETURN: 'pending_return',
  PENDING_PAY: 'pending_pay',
  PENDING_SHIP: 'pending_ship',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  ESCALATED_TO_HQ: 'escalated_to_hq',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

const OPERATION_TYPE = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  ESCALATE: 'escalate',
  ASSIGN: 'assign',
  REASSIGN: 'reassign',
  DELIVER: 'deliver',
  RETURN: 'return',
  CANCEL: 'cancel',
  HQ_REASSIGN: 'hq_reassign',
  SHIP: 'ship',
  REMIND_PAY: 'remind_pay'
};

const OPERATION_LABEL = {
  [OPERATION_TYPE.ACCEPT]: '接单',
  [OPERATION_TYPE.REJECT]: '拒单',
  [OPERATION_TYPE.ESCALATE]: '上报总部',
  [OPERATION_TYPE.ASSIGN]: '指派员工',
  [OPERATION_TYPE.REASSIGN]: '更换员工',
  [OPERATION_TYPE.DELIVER]: '发货交付',
  [OPERATION_TYPE.RETURN]: '退租完成',
  [OPERATION_TYPE.CANCEL]: '取消订单',
  [OPERATION_TYPE.HQ_REASSIGN]: '总部重新分配',
  [OPERATION_TYPE.SHIP]: '订单发货',
  [OPERATION_TYPE.REMIND_PAY]: '催付提醒'
};

const RENT_STATUS_MAP = {
  [ORDER_STATUS.PENDING_ACCEPT]: { label: '待接单', color: '#faad14' },
  [ORDER_STATUS.PENDING_ASSIGN]: { label: '待指派', color: '#1890ff' },
  [ORDER_STATUS.PENDING_DELIVER]: { label: '待交付', color: '#722ed1' },
  [ORDER_STATUS.RENTING]: { label: '租赁中', color: '#52c41a' },
  [ORDER_STATUS.PENDING_RETURN]: { label: '待退租', color: '#f5222d' },
  [ORDER_STATUS.ESCALATED_TO_HQ]: { label: '待总部处理', color: '#eb2f96' },
  [ORDER_STATUS.REJECTED]: { label: '已拒单', color: '#8c8c8c' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: '#8c8c8c' }
};

const SALE_STATUS_MAP = {
  [ORDER_STATUS.PENDING_PAY]: { label: '待付款', color: '#fa8c16' },
  [ORDER_STATUS.PENDING_SHIP]: { label: '待发货', color: '#1890ff' },
  [ORDER_STATUS.SHIPPED]: { label: '已发货', color: '#722ed1' },
  [ORDER_STATUS.COMPLETED]: { label: '已完成', color: '#52c41a' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: '#8c8c8c' }
};

const ROLE = {
  STORE: 'store',
  EMPLOYEE: 'employee',
  HQ: 'hq'
};

module.exports = {
  ORDER_TYPE,
  ORDER_STATUS,
  OPERATION_TYPE,
  OPERATION_LABEL,
  RENT_STATUS_MAP,
  SALE_STATUS_MAP,
  ROLE
};
