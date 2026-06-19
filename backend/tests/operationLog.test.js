const OperationLogService = require('../src/operationLog');
const { OPERATION_TYPE, ORDER_TYPE, ROLE } = require('../src/constants');

describe('OperationLogService - 操作日志服务', () => {
  beforeEach(() => {
    OperationLogService._reset();
  });

  describe('create - 创建日志', () => {
    test('应该成功创建一条操作日志', () => {
      const log = OperationLogService.create({
        orderId: 'ORD001',
        orderType: ORDER_TYPE.RENT,
        operationType: OPERATION_TYPE.ACCEPT,
        operatorRole: ROLE.STORE,
        operatorId: 'STORE001',
        operatorName: '王经理',
        fromStatus: 'pending_accept',
        toStatus: 'pending_assign',
        remark: '门店确认接单'
      });

      expect(log).toBeDefined();
      expect(log.id).toMatch(/^LOG\d+/);
      expect(log.orderId).toBe('ORD001');
      expect(log.orderType).toBe(ORDER_TYPE.RENT);
      expect(log.operationType).toBe(OPERATION_TYPE.ACCEPT);
      expect(log.operationLabel).toBe('接单');
      expect(log.operatorRole).toBe(ROLE.STORE);
      expect(log.operatorId).toBe('STORE001');
      expect(log.operatorName).toBe('王经理');
      expect(log.fromStatus).toBe('pending_accept');
      expect(log.toStatus).toBe('pending_assign');
      expect(log.remark).toBe('门店确认接单');
      expect(log.operateTime).toBeDefined();
      expect(log.extra).toEqual({});
    });

    test('新创建的日志应该在列表最前面', () => {
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ACCEPT });
      OperationLogService.create({ orderId: 'ORD002', operationType: OPERATION_TYPE.REJECT });

      const logs = OperationLogService._getAll();
      expect(logs[0].orderId).toBe('ORD002');
      expect(logs[1].orderId).toBe('ORD001');
    });

    test('应该包含 extra 扩展信息', () => {
      const log = OperationLogService.create({
        orderId: 'ORD001',
        operationType: OPERATION_TYPE.ASSIGN,
        extra: {
          employeeId: 'EMP001',
          employeeName: '赵明'
        }
      });

      expect(log.extra.employeeId).toBe('EMP001');
      expect(log.extra.employeeName).toBe('赵明');
    });

    test('默认角色应该是门店', () => {
      const log = OperationLogService.create({
        orderId: 'ORD001',
        operationType: OPERATION_TYPE.ACCEPT
      });

      expect(log.operatorRole).toBe(ROLE.STORE);
    });

    test('未知操作类型应该使用原始值作为标签', () => {
      const log = OperationLogService.create({
        orderId: 'ORD001',
        operationType: 'unknown_operation'
      });

      expect(log.operationLabel).toBe('unknown_operation');
    });
  });

  describe('findByOrderId - 按订单ID查询日志', () => {
    beforeEach(() => {
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ACCEPT });
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ASSIGN });
      OperationLogService.create({ orderId: 'ORD002', operationType: OPERATION_TYPE.ACCEPT });
    });

    test('应该返回指定订单的所有日志', () => {
      const logs = OperationLogService.findByOrderId('ORD001');
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.orderId === 'ORD001')).toBe(true);
    });

    test('应该按时间倒序返回（最新的在前面）', () => {
      const logs = OperationLogService.findByOrderId('ORD001');
      expect(logs[0].operationType).toBe(OPERATION_TYPE.ASSIGN);
      expect(logs[1].operationType).toBe(OPERATION_TYPE.ACCEPT);
    });

    test('不存在的订单应该返回空数组', () => {
      const logs = OperationLogService.findByOrderId('ORD999');
      expect(logs).toEqual([]);
    });
  });

  describe('findAll - 查询所有日志（带筛选）', () => {
    beforeEach(() => {
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ACCEPT, operatorRole: ROLE.STORE });
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ASSIGN, operatorRole: ROLE.STORE });
      OperationLogService.create({ orderId: 'ORD002', operationType: OPERATION_TYPE.ACCEPT, operatorRole: ROLE.HQ });
      OperationLogService.create({ orderId: 'ORD003', operationType: OPERATION_TYPE.CANCEL, operatorRole: ROLE.HQ });
    });

    test('不带筛选条件应该返回所有日志', () => {
      const logs = OperationLogService.findAll();
      expect(logs).toHaveLength(4);
    });

    test('按订单ID筛选', () => {
      const logs = OperationLogService.findAll({ orderId: 'ORD001' });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.orderId === 'ORD001')).toBe(true);
    });

    test('按操作类型筛选', () => {
      const logs = OperationLogService.findAll({ operationType: OPERATION_TYPE.ACCEPT });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.operationType === OPERATION_TYPE.ACCEPT)).toBe(true);
    });

    test('按操作角色筛选', () => {
      const logs = OperationLogService.findAll({ operatorRole: ROLE.HQ });
      expect(logs).toHaveLength(2);
      expect(logs.every(log => log.operatorRole === ROLE.HQ)).toBe(true);
    });

    test('组合筛选条件', () => {
      const logs = OperationLogService.findAll({
        orderId: 'ORD001',
        operationType: OPERATION_TYPE.ACCEPT
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].orderId).toBe('ORD001');
      expect(logs[0].operationType).toBe(OPERATION_TYPE.ACCEPT);
    });

    test('筛选条件无匹配时返回空数组', () => {
      const logs = OperationLogService.findAll({ orderId: 'ORD999' });
      expect(logs).toEqual([]);
    });
  });

  describe('_reset - 重置日志', () => {
    test('应该清空所有日志', () => {
      OperationLogService.create({ orderId: 'ORD001', operationType: OPERATION_TYPE.ACCEPT });
      expect(OperationLogService._getAll().length).toBeGreaterThan(0);

      OperationLogService._reset();
      expect(OperationLogService._getAll()).toEqual([]);
    });
  });
});
