const OrderStateMachine = require('../src/stateMachine');
const { ORDER_TYPE, ORDER_STATUS, OPERATION_TYPE } = require('../src/constants');

describe('OrderStateMachine - 订单状态机', () => {
  describe('canTransition - 状态流转判断', () => {
    test('租赁订单：待接单 -> 待指派 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_ASSIGN)).toBe(true);
    });

    test('租赁订单：待接单 -> 已拒单 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.REJECTED)).toBe(true);
    });

    test('租赁订单：待接单 -> 待总部处理 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.ESCALATED_TO_HQ)).toBe(true);
    });

    test('租赁订单：待接单 -> 租赁中 应该不允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.RENTING)).toBe(false);
    });

    test('租赁订单：待指派 -> 待交付 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ASSIGN };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_DELIVER)).toBe(true);
    });

    test('租赁订单：待交付 -> 租赁中 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_DELIVER };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.RENTING)).toBe(true);
    });

    test('租赁订单：租赁中 -> 待退租 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.RENTING };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_RETURN)).toBe(true);
    });

    test('租赁订单：待退租 -> 已完成 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_RETURN };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.COMPLETED)).toBe(true);
    });

    test('租赁订单：已完成 -> 任何状态 都不允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.COMPLETED };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_ACCEPT)).toBe(false);
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.CANCELLED)).toBe(false);
    });

    test('租赁订单：待总部处理 -> 待接单 应该允许', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.ESCALATED_TO_HQ };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_ACCEPT)).toBe(true);
    });

    test('销售订单：待付款 -> 待发货 应该允许', () => {
      const order = { orderType: ORDER_TYPE.SALE, status: ORDER_STATUS.PENDING_PAY };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.PENDING_SHIP)).toBe(true);
    });

    test('销售订单：待发货 -> 已发货 应该允许', () => {
      const order = { orderType: ORDER_TYPE.SALE, status: ORDER_STATUS.PENDING_SHIP };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.SHIPPED)).toBe(true);
    });

    test('销售订单：已发货 -> 已完成 应该允许', () => {
      const order = { orderType: ORDER_TYPE.SALE, status: ORDER_STATUS.SHIPPED };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.COMPLETED)).toBe(true);
    });

    test('销售订单：待付款 -> 已完成 应该不允许', () => {
      const order = { orderType: ORDER_TYPE.SALE, status: ORDER_STATUS.PENDING_PAY };
      expect(OrderStateMachine.canTransition(order, ORDER_STATUS.COMPLETED)).toBe(false);
    });
  });

  describe('validateTransition - 状态流转校验', () => {
    test('合法流转应该返回 valid: true', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      const result = OrderStateMachine.validateTransition(order, ORDER_STATUS.PENDING_ASSIGN, OPERATION_TYPE.ACCEPT);
      expect(result.valid).toBe(true);
    });

    test('非法流转应该返回 valid: false 并包含错误信息', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      const result = OrderStateMachine.validateTransition(order, ORDER_STATUS.RENTING, OPERATION_TYPE.DELIVER);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('不支持');
      expect(result.message).toContain('发货交付');
    });

    test('非法流转应该包含当前状态标签', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      const result = OrderStateMachine.validateTransition(order, ORDER_STATUS.RENTING, OPERATION_TYPE.DELIVER);
      expect(result.message).toContain('待接单');
    });
  });

  describe('getStatusLabel - 获取状态标签', () => {
    test('租赁订单待接单状态应该返回"待接单"', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: ORDER_STATUS.PENDING_ACCEPT };
      expect(OrderStateMachine.getStatusLabel(order)).toBe('待接单');
    });

    test('销售订单待付款状态应该返回"待付款"', () => {
      const order = { orderType: ORDER_TYPE.SALE, status: ORDER_STATUS.PENDING_PAY };
      expect(OrderStateMachine.getStatusLabel(order)).toBe('待付款');
    });

    test('未知状态应该返回"未知"', () => {
      const order = { orderType: ORDER_TYPE.RENT, status: 'unknown_status' };
      expect(OrderStateMachine.getStatusLabel(order)).toBe('未知');
    });
  });

  describe('getTransitionsForStatus - 获取可流转状态', () => {
    test('租赁待接单状态应该返回4个可流转状态', () => {
      const transitions = OrderStateMachine.getTransitionsForStatus(ORDER_TYPE.RENT, ORDER_STATUS.PENDING_ACCEPT);
      expect(transitions).toHaveLength(4);
      expect(transitions).toContain(ORDER_STATUS.PENDING_ASSIGN);
      expect(transitions).toContain(ORDER_STATUS.ESCALATED_TO_HQ);
      expect(transitions).toContain(ORDER_STATUS.REJECTED);
      expect(transitions).toContain(ORDER_STATUS.CANCELLED);
    });

    test('销售已完成状态应该返回0个可流转状态', () => {
      const transitions = OrderStateMachine.getTransitionsForStatus(ORDER_TYPE.SALE, ORDER_STATUS.COMPLETED);
      expect(transitions).toHaveLength(0);
    });

    test('未知状态应该返回空数组', () => {
      const transitions = OrderStateMachine.getTransitionsForStatus(ORDER_TYPE.RENT, 'unknown');
      expect(transitions).toEqual([]);
    });
  });
});
