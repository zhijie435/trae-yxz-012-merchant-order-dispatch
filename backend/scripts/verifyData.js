const { mockStores, mockEmployees, mockRentOrders, mockSaleOrders, mockOrders } = require('../src/mockData');
const { ORDER_STATUS, ORDER_TYPE, ROLE } = require('../src/constants');

let passCount = 0;
let failCount = 0;

const assert = (condition, message) => {
  if (condition) {
    passCount++;
    console.log(`✓ ${message}`);
  } else {
    failCount++;
    console.error(`✗ ${message}`);
  }
};

const section = (title) => {
  console.log('');
  console.log(`========== ${title} ==========`);
};

console.log('');
console.log('╔══════════════════════════════════════════════════╗');
console.log('║          门店订单系统数据验收报告                  ║');
console.log('╚══════════════════════════════════════════════════╝');

section('门店数据验收');
assert(mockStores.length === 5, `门店数量应为5个，实际${mockStores.length}个`);
const storeIds = mockStores.map(s => s.id);
assert(storeIds.includes('STORE001'), '存在门店STORE001（北京朝阳门店）');
assert(storeIds.includes('STORE002'), '存在门店STORE002（北京海淀门店）');
assert(storeIds.includes('STORE003'), '存在门店STORE003（上海浦东门店）');
assert(storeIds.includes('STORE004'), '存在门店STORE004（广州天河门店）');
assert(storeIds.includes('STORE005'), '存在门店STORE005（深圳南山门店）');
mockStores.forEach(store => {
  assert(store.name && store.contact && store.phone, `门店${store.id}数据完整：${store.name}`);
});

section('员工账号验收');
assert(mockEmployees.length >= 11, `员工数量应不少于11个，实际${mockEmployees.length}个`);

const storeManagers = mockEmployees.filter(e => e.role === '门店店长');
assert(storeManagers.length === 5, `门店店长数量应为5个，实际${storeManagers.length}个`);

const deliveryWorkers = mockEmployees.filter(e => e.role === '配送安装工');
assert(deliveryWorkers.length === 11, `配送安装工数量应为11个，实际${deliveryWorkers.length}个`);

const hqAdmins = mockEmployees.filter(e => e.role === '总部管理员');
assert(hqAdmins.length === 2, `总部管理员数量应为2个，实际${hqAdmins.length}个`);

assert(mockEmployees.some(e => e.id === 'EMP001' && e.name === '赵明'), '存在员工EMP001赵明');
assert(mockEmployees.some(e => e.id === 'STORE001-MGR' && e.name === '王经理'), '存在门店店长STORE001-MGR王经理');
assert(mockEmployees.some(e => e.id === 'HQ001' && e.name === '总部调度员'), '存在总部管理员HQ001总部调度员');

const employeeStatuses = mockEmployees.map(e => e.status);
assert(employeeStatuses.includes('available'), '存在available状态的员工');
assert(employeeStatuses.includes('busy'), '存在busy状态的员工');
assert(employeeStatuses.includes('on_leave'), '存在on_leave状态的员工');

section('租赁订单数据验收');
assert(mockRentOrders.length === 13, `租赁订单数量应为13个，实际${mockRentOrders.length}个`);

const rentPendingAccept = mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ACCEPT);
assert(rentPendingAccept.length === 2, `待接单租赁订单数量应为2个，实际${rentPendingAccept.length}个`);

const rentPendingAssign = mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ASSIGN);
assert(rentPendingAssign.length === 2, `待指派租赁订单数量应为2个，实际${rentPendingAssign.length}个`);

const rentPendingDeliver = mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_DELIVER);
assert(rentPendingDeliver.length === 2, `待交付租赁订单数量应为2个，实际${rentPendingDeliver.length}个`);

const rentRenting = mockRentOrders.filter(o => o.status === ORDER_STATUS.RENTING);
assert(rentRenting.length === 2, `租赁中订单数量应为2个，实际${rentRenting.length}个`);

const rentPendingReturn = mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_RETURN);
assert(rentPendingReturn.length === 2, `待退租订单数量应为2个，实际${rentPendingReturn.length}个`);

const rentRejected = mockRentOrders.filter(o => o.status === ORDER_STATUS.REJECTED);
assert(rentRejected.length === 1, `已拒单订单数量应为1个，实际${rentRejected.length}个`);
if (rentRejected.length > 0) {
  assert(rentRejected[0].rejectReason && rentRejected[0].rejectReason.length > 0, '已拒单订单包含拒单原因');
}

const rentEscalated = mockRentOrders.filter(o => o.status === ORDER_STATUS.ESCALATED_TO_HQ);
assert(rentEscalated.length === 1, `待总部处理订单数量应为1个，实际${rentEscalated.length}个`);
if (rentEscalated.length > 0) {
  assert(rentEscalated[0].escalateReason && rentEscalated[0].escalateReason.length > 0, '待总部处理订单包含上报原因');
}

const rentCancelled = mockRentOrders.filter(o => o.status === ORDER_STATUS.CANCELLED);
assert(rentCancelled.length === 1, `已取消租赁订单数量应为1个，实际${rentCancelled.length}个`);

const rentAssigned = mockRentOrders.filter(o => o.assignedEmployee);
assert(rentAssigned.length >= 6, `已指派员工的租赁订单应不少于6个，实际${rentAssigned.length}个`);

section('销售订单数据验收');
assert(mockSaleOrders.length === 9, `销售订单数量应为9个，实际${mockSaleOrders.length}个`);

const salePendingPay = mockSaleOrders.filter(o => o.status === ORDER_STATUS.PENDING_PAY);
assert(salePendingPay.length === 2, `待付款销售订单数量应为2个，实际${salePendingPay.length}个`);

const salePendingShip = mockSaleOrders.filter(o => o.status === ORDER_STATUS.PENDING_SHIP);
assert(salePendingShip.length === 2, `待发货销售订单数量应为2个，实际${salePendingShip.length}个`);

const saleShipped = mockSaleOrders.filter(o => o.status === ORDER_STATUS.SHIPPED);
assert(saleShipped.length === 2, `已发货销售订单数量应为2个，实际${saleShipped.length}个`);

const saleCompleted = mockSaleOrders.filter(o => o.status === ORDER_STATUS.COMPLETED);
assert(saleCompleted.length === 2, `已完成销售订单数量应为2个，实际${saleCompleted.length}个`);

const saleCancelled = mockSaleOrders.filter(o => o.status === ORDER_STATUS.CANCELLED);
assert(saleCancelled.length === 1, `已取消销售订单数量应为1个，实际${saleCancelled.length}个`);
if (saleCancelled.length > 0) {
  assert(saleCancelled[0].cancelReason && saleCancelled[0].cancelReason.length > 0, '已取消销售订单包含取消原因');
}

section('订单数据完整性验收');
assert(mockOrders.length === 22, `总订单数量应为22个，实际${mockOrders.length}个`);

mockOrders.forEach(order => {
  assert(order.id && order.orderType && order.customerName && order.status, `订单${order.id}基础字段完整`);
  assert(order.phone && order.product && order.address, `订单${order.id}联系信息完整`);
  assert(storeIds.includes(order.storeId), `订单${order.id}关联门店存在(${order.storeId})`);
});

mockRentOrders.forEach(order => {
  assert(typeof order.deposit === 'number' && typeof order.monthlyRent === 'number', `租赁订单${order.id}金额字段完整`);
  assert(order.rentPeriod, `租赁订单${order.id}包含租期信息`);
});

mockSaleOrders.forEach(order => {
  assert(typeof order.unitPrice === 'number' && order.unitPrice > 0, `销售订单${order.id}包含单价`);
});

section('验收结果汇总');
console.log('');
console.log(`通过: ${passCount} 项`);
console.log(`失败: ${failCount} 项`);
console.log(`总计: ${passCount + failCount} 项`);
console.log('');

if (failCount === 0) {
  console.log('🎉 全部验收通过！数据准备就绪。');
  process.exit(0);
} else {
  console.log('⚠️  存在验收失败项，请检查数据。');
  process.exit(1);
}
