const OrderService = require('../src/orderService');
const { ORDER_STATUS, ORDER_TYPE, OPERATION_TYPE, ROLE } = require('../src/constants');

describe('OrderService - 订单服务', () => {
  beforeEach(() => {
    OrderService._reset();
  });

  describe('acceptOrder - 接单功能', () => {
    test('待接单状态的租赁订单应该可以成功接单', () => {
      const result = OrderService.acceptOrder('ORD2025010001');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe(ORDER_STATUS.PENDING_ASSIGN);
      expect(result.message).toContain('接单成功');
    });

    test('接单后应该生成操作日志', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);

      const logResult = OrderService.getOrderLogs(orderId);
      expect(logResult.success).toBe(true);
      expect(logResult.data.length).toBeGreaterThan(0);
      expect(logResult.data[0].operationType).toBe(OPERATION_TYPE.ACCEPT);
      expect(logResult.data[0].fromStatus).toBe(ORDER_STATUS.PENDING_ACCEPT);
      expect(logResult.data[0].toStatus).toBe(ORDER_STATUS.PENDING_ASSIGN);
    });

    test('不存在的订单应该返回404', () => {
      const result = OrderService.acceptOrder('ORD9999999999');

      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.message).toContain('订单不存在');
    });

    test('非待接单状态的订单不能接单', () => {
      const result = OrderService.acceptOrder('ORD2025010005');

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('不支持');
    });

    test('销售订单不能执行接单操作（租赁订单特有）', () => {
      const result = OrderService.acceptOrder('SAL2025010002');

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  describe('rejectOrder - 拒单功能', () => {
    test('待接单状态的订单可以拒单', () => {
      const result = OrderService.rejectOrder('ORD2025010001', '库存不足无法满足');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe(ORDER_STATUS.REJECTED);
      expect(result.data.rejectReason).toBe('库存不足无法满足');
    });

    test('拒单原因不能为空', () => {
      const result = OrderService.rejectOrder('ORD2025010001', '');

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('请填写拒单原因');
    });

    test('拒单原因会自动trim空格', () => {
      const result = OrderService.rejectOrder('ORD2025010001', '  库存不足  ');

      expect(result.success).toBe(true);
      expect(result.data.rejectReason).toBe('库存不足');
    });

    test('拒单后应该生成操作日志', () => {
      const orderId = 'ORD2025010001';
      OrderService.rejectOrder(orderId, '客户要求无法满足');

      const logResult = OrderService.getOrderLogs(orderId);
      expect(logResult.success).toBe(true);
      expect(logResult.data[0].operationType).toBe(OPERATION_TYPE.REJECT);
      expect(logResult.data[0].remark).toBe('客户要求无法满足');
    });

    test('不存在的订单应该返回404', () => {
      const result = OrderService.rejectOrder('ORD9999999999', '原因');

      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
    });

    test('非待接单状态的订单不能拒单', () => {
      const result = OrderService.rejectOrder('ORD2025010005', '原因');

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });
  });

  describe('assignStaff - 员工指派功能', () => {
    test('待指派状态的订单可以指派员工', () => {
      const employee = { id: 'EMP001', name: '赵明', phone: '136****1001' };
      const result = OrderService.assignStaff('ORD2025010003', employee);

      expect(result.success).toBe(true);
      expect(result.data.assignedEmployee.id).toBe('EMP001');
      expect(result.data.assignedEmployee.name).toBe('赵明');
      expect(result.data.status).toBe(ORDER_STATUS.PENDING_DELIVER);
    });

    test('指派员工后应该添加到指派历史记录', () => {
      const employee = { id: 'EMP001', name: '赵明' };
      const result = OrderService.assignStaff('ORD2025010003', employee);

      expect(result.data.assignHistory).toHaveLength(1);
      expect(result.data.assignHistory[0].action).toBe('初次指派');
      expect(result.data.assignHistory[0].id).toBe('EMP001');
    });

    test('指派后应该生成操作日志（类型为assign）', () => {
      const orderId = 'ORD2025010003';
      const employee = { id: 'EMP001', name: '赵明' };
      OrderService.assignStaff(orderId, employee);

      const logResult = OrderService.getOrderLogs(orderId);
      expect(logResult.data[0].operationType).toBe(OPERATION_TYPE.ASSIGN);
      expect(logResult.data[0].extra.employeeId).toBe('EMP001');
      expect(logResult.data[0].extra.employeeName).toBe('赵明');
    });

    test('员工信息不能为空', () => {
      const result = OrderService.assignStaff('ORD2025010003', null);

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('请选择员工');
    });

    test('员工ID和姓名不能为空', () => {
      const result = OrderService.assignStaff('ORD2025010003', { id: '', name: '' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
    });

    test('不存在的员工不能指派', () => {
      const result = OrderService.assignStaff('ORD2025010003', { id: 'EMP999', name: '不存在' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.message).toContain('员工不存在');
    });

    test('休假的员工不能指派', () => {
      const result = OrderService.assignStaff('ORD2025010003', { id: 'EMP007', name: '冯杰' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('休假');
    });

    test('忙碌的员工不能指派（非当前负责人）', () => {
      const result = OrderService.assignStaff('ORD2025010003', { id: 'EMP003', name: '孙强' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('忙碌');
    });

    test('不存在的订单应该返回404', () => {
      const result = OrderService.assignStaff('ORD9999999999', { id: 'EMP001', name: '赵明' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
    });

    test('非可指派状态的订单不能指派员工', () => {
      const result = OrderService.assignStaff('ORD2025010001', { id: 'EMP001', name: '赵明' });

      expect(result.success).toBe(false);
      expect(result.code).toBe(400);
      expect(result.message).toContain('不支持指派');
    });

    test('待交付状态的订单也可以指派员工', () => {
      const employee = { id: 'EMP002', name: '钱伟' };
      const result = OrderService.assignStaff('ORD2025010005', employee);

      expect(result.success).toBe(true);
      expect(result.data.assignedEmployee.id).toBe('EMP002');
    });
  });

  describe('assignStaff - 更换员工功能', () => {
    test('已指派员工的订单可以更换员工', () => {
      const newEmployee = { id: 'EMP002', name: '钱伟' };
      const result = OrderService.assignStaff('ORD2025010005', newEmployee);

      expect(result.success).toBe(true);
      expect(result.data.assignedEmployee.id).toBe('EMP002');
      expect(result.message).toContain('员工更换成功');
    });

    test('更换员工后指派历史应该有2条记录', () => {
      const newEmployee = { id: 'EMP002', name: '钱伟' };
      const result = OrderService.assignStaff('ORD2025010005', newEmployee);

      expect(result.data.assignHistory).toHaveLength(2);
      expect(result.data.assignHistory[1].action).toBe('更换员工');
    });

    test('更换员工的操作日志类型应该是reassign', () => {
      const orderId = 'ORD2025010005';
      const newEmployee = { id: 'EMP002', name: '钱伟' };
      OrderService.assignStaff(orderId, newEmployee);

      const logResult = OrderService.getOrderLogs(orderId);
      expect(logResult.data[0].operationType).toBe(OPERATION_TYPE.REASSIGN);
    });

    test('租赁中状态的订单可以更换员工', () => {
      const newEmployee = { id: 'EMP002', name: '钱伟' };
      const result = OrderService.assignStaff('ORD2025010008', newEmployee);

      expect(result.success).toBe(true);
      expect(result.data.assignedEmployee.id).toBe('EMP002');
    });

    test('待退租状态的订单可以更换员工', () => {
      const newEmployee = { id: 'EMP002', name: '钱伟' };
      const result = OrderService.assignStaff('ORD2025010010', newEmployee);

      expect(result.success).toBe(true);
      expect(result.data.assignedEmployee.id).toBe('EMP002');
    });

    test('如果是当前忙碌的员工且正是当前负责人，允许重新指派', () => {
      const result = OrderService.assignStaff('ORD2025010005', { id: 'EMP001', name: '赵明' });

      expect(result.success).toBe(true);
    });
  });

  describe('filterOrders - 订单筛选功能', () => {
    test('不带筛选条件应该返回所有订单', () => {
      const result = OrderService.filterOrders();
      expect(result.length).toBe(22);
    });

    test('按订单类型筛选：租赁订单', () => {
      const result = OrderService.filterOrders({ orderType: ORDER_TYPE.RENT });
      expect(result.length).toBe(13);
      expect(result.every(o => o.orderType === ORDER_TYPE.RENT)).toBe(true);
    });

    test('按订单类型筛选：销售订单', () => {
      const result = OrderService.filterOrders({ orderType: ORDER_TYPE.SALE });
      expect(result.length).toBe(9);
      expect(result.every(o => o.orderType === ORDER_TYPE.SALE)).toBe(true);
    });

    test('按订单类型筛选：all 返回所有', () => {
      const result = OrderService.filterOrders({ orderType: 'all' });
      expect(result.length).toBe(22);
    });

    test('按状态筛选：待接单', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.PENDING_ACCEPT });
      expect(result.length).toBe(2);
      expect(result.every(o => o.status === ORDER_STATUS.PENDING_ACCEPT)).toBe(true);
    });

    test('按状态筛选：待指派', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.PENDING_ASSIGN });
      expect(result.length).toBe(2);
      expect(result.every(o => o.status === ORDER_STATUS.PENDING_ASSIGN)).toBe(true);
    });

    test('按状态筛选：已拒单', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.REJECTED });
      expect(result.length).toBe(1);
      expect(result.every(o => o.status === ORDER_STATUS.REJECTED)).toBe(true);
    });

    test('按状态筛选：待总部处理', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.ESCALATED_TO_HQ });
      expect(result.length).toBe(1);
      expect(result.every(o => o.status === ORDER_STATUS.ESCALATED_TO_HQ)).toBe(true);
    });

    test('按状态筛选：已取消', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.CANCELLED });
      expect(result.length).toBe(2);
      expect(result.every(o => o.status === ORDER_STATUS.CANCELLED)).toBe(true);
    });

    test('按状态筛选：all 返回所有', () => {
      const result = OrderService.filterOrders({ status: ORDER_STATUS.ALL });
      expect(result.length).toBe(22);
    });

    test('按员工ID筛选', () => {
      const result = OrderService.filterOrders({ employeeId: 'EMP001' });
      expect(result.length).toBe(2);
      expect(result.every(o => o.assignedEmployee && o.assignedEmployee.id === 'EMP001')).toBe(true);
    });

    test('组合筛选：租赁订单 + 待接单状态', () => {
      const result = OrderService.filterOrders({
        orderType: ORDER_TYPE.RENT,
        status: ORDER_STATUS.PENDING_ACCEPT
      });
      expect(result.length).toBe(2);
      expect(result.every(o => o.orderType === ORDER_TYPE.RENT && o.status === ORDER_STATUS.PENDING_ACCEPT)).toBe(true);
    });

    test('组合筛选：销售订单 + 待付款状态', () => {
      const result = OrderService.filterOrders({
        orderType: ORDER_TYPE.SALE,
        status: ORDER_STATUS.PENDING_PAY
      });
      expect(result.length).toBe(2);
      expect(result.every(o => o.orderType === ORDER_TYPE.SALE && o.status === ORDER_STATUS.PENDING_PAY)).toBe(true);
    });

    test('筛选条件无匹配时返回空数组', () => {
      const result = OrderService.filterOrders({ status: 'unknown_status' });
      expect(result).toEqual([]);
    });
  });

  describe('getOrderLogs - 详情日志功能', () => {
    test('订单存在时应该返回日志列表', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);

      const result = OrderService.getOrderLogs(orderId);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('新订单没有操作日志', () => {
      const result = OrderService.getOrderLogs('ORD2025010001');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    test('接单后应该有1条日志', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);

      const result = OrderService.getOrderLogs(orderId);
      expect(result.data.length).toBe(1);
    });

    test('接单+指派后应该有2条日志', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);
      OrderService.assignStaff(orderId, { id: 'EMP001', name: '赵明' });

      const result = OrderService.getOrderLogs(orderId);
      expect(result.data.length).toBe(2);
    });

    test('日志应该包含操作类型、操作人、时间等信息', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);

      const result = OrderService.getOrderLogs(orderId);
      const log = result.data[0];
      expect(log.id).toBeDefined();
      expect(log.operationType).toBeDefined();
      expect(log.operationLabel).toBeDefined();
      expect(log.operatorName).toBeDefined();
      expect(log.operateTime).toBeDefined();
      expect(log.fromStatus).toBeDefined();
      expect(log.toStatus).toBeDefined();
    });

    test('不存在的订单应该返回404', () => {
      const result = OrderService.getOrderLogs('ORD9999999999');
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.message).toContain('订单不存在');
    });

    test('日志按时间倒序排列（最新的在前面）', () => {
      const orderId = 'ORD2025010001';
      OrderService.acceptOrder(orderId);
      OrderService.assignStaff(orderId, { id: 'EMP001', name: '赵明' });

      const result = OrderService.getOrderLogs(orderId);
      expect(result.data[0].operationType).toBe(OPERATION_TYPE.ASSIGN);
      expect(result.data[1].operationType).toBe(OPERATION_TYPE.ACCEPT);
    });
  });

  describe('getOrderStatistics - 订单统计', () => {
    test('应该返回正确的统计数据', () => {
      const stats = OrderService.getOrderStatistics();

      expect(stats.all).toBe(22);
      expect(stats.rent_all).toBe(13);
      expect(stats.sale_all).toBe(9);
      expect(stats.pending_accept).toBe(2);
      expect(stats.pending_assign).toBe(2);
      expect(stats.pending_deliver).toBe(2);
      expect(stats.renting).toBe(2);
      expect(stats.pending_return).toBe(2);
      expect(stats.escalated_to_hq).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.pending_pay).toBe(2);
      expect(stats.pending_ship).toBe(2);
      expect(stats.shipped).toBe(2);
      expect(stats.completed).toBe(2);
      expect(stats.cancelled).toBe(2);
    });

    test('按员工筛选统计', () => {
      const stats = OrderService.getOrderStatistics('EMP001');

      expect(stats.all).toBe(2);
      expect(stats.rent_all).toBe(2);
      expect(stats.pending_deliver).toBe(1);
      expect(stats.renting).toBe(1);
    });
  });

  describe('getStatusConfig - 状态配置', () => {
    test('门店角色 + 全部类型 应该返回正确的状态列表', () => {
      const config = OrderService.getStatusConfig('all', 'store');

      expect(config[0].key).toBe('all');
      expect(config).toEqual(expect.arrayContaining([
        expect.objectContaining({ key: 'pending_accept' }),
        expect.objectContaining({ key: 'pending_assign' }),
        expect.objectContaining({ key: 'pending_deliver' }),
        expect.objectContaining({ key: 'renting' }),
        expect.objectContaining({ key: 'pending_return' }),
        expect.objectContaining({ key: 'rejected' }),
        expect.objectContaining({ key: 'pending_pay' }),
        expect.objectContaining({ key: 'pending_ship' }),
        expect.objectContaining({ key: 'shipped' }),
        expect.objectContaining({ key: 'completed' }),
        expect.objectContaining({ key: 'cancelled' })
      ]));
    });

    test('员工角色应该返回特定的状态列表', () => {
      const config = OrderService.getStatusConfig('all', 'employee');

      expect(config).toHaveLength(5);
      expect(config[0].key).toBe('all');
      expect(config.map(c => c.key)).toEqual(['all', 'pending_deliver', 'renting', 'pending_return', 'completed']);
    });

    test('总部角色应该包含待总部处理状态', () => {
      const config = OrderService.getStatusConfig('rent', 'hq');

      expect(config.map(c => c.key)).toContain('escalated_to_hq');
    });

    test('只选租赁类型不应该包含销售状态', () => {
      const config = OrderService.getStatusConfig('rent', 'store');

      const saleStatuses = config.filter(c => c.orderType === 'sale');
      expect(saleStatuses.length).toBe(0);
    });
  });
});
