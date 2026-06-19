const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

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
  CANCELLED: 'cancelled'
};

const RENT_STATUS_MAP = {
  [ORDER_STATUS.PENDING_ACCEPT]: { label: '待接单', color: '#faad14' },
  [ORDER_STATUS.PENDING_ASSIGN]: { label: '待指派', color: '#1890ff' },
  [ORDER_STATUS.PENDING_DELIVER]: { label: '待交付', color: '#722ed1' },
  [ORDER_STATUS.RENTING]: { label: '租赁中', color: '#52c41a' },
  [ORDER_STATUS.PENDING_RETURN]: { label: '待退租', color: '#f5222d' },
  [ORDER_STATUS.ESCALATED_TO_HQ]: { label: '待总部处理', color: '#eb2f96' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: '#8c8c8c' }
};

const SALE_STATUS_MAP = {
  [ORDER_STATUS.PENDING_PAY]: { label: '待付款', color: '#fa8c16' },
  [ORDER_STATUS.PENDING_SHIP]: { label: '待发货', color: '#1890ff' },
  [ORDER_STATUS.SHIPPED]: { label: '已发货', color: '#722ed1' },
  [ORDER_STATUS.COMPLETED]: { label: '已完成', color: '#52c41a' },
  [ORDER_STATUS.CANCELLED]: { label: '已取消', color: '#8c8c8c' }
};

const mockStores = [
  { id: 'STORE001', name: '北京朝阳门店', contact: '王经理', phone: '138****1111' },
  { id: 'STORE002', name: '北京海淀门店', contact: '李经理', phone: '138****2222' },
  { id: 'STORE003', name: '上海浦东门店', contact: '张经理', phone: '138****3333' },
  { id: 'STORE004', name: '广州天河门店', contact: '刘经理', phone: '138****4444' },
  { id: 'STORE005', name: '深圳南山门店', contact: '陈经理', phone: '138****5555' }
];

const mockEmployees = [
  { id: 'EMP001', storeId: 'STORE001', name: '赵明', phone: '136****1001', role: '配送安装工', status: 'available' },
  { id: 'EMP002', storeId: 'STORE001', name: '钱伟', phone: '136****1002', role: '配送安装工', status: 'available' },
  { id: 'EMP003', storeId: 'STORE001', name: '孙强', phone: '136****1003', role: '配送安装工', status: 'busy' },
  { id: 'EMP004', storeId: 'STORE002', name: '周磊', phone: '136****2001', role: '配送安装工', status: 'available' },
  { id: 'EMP005', storeId: 'STORE002', name: '吴涛', phone: '136****2002', role: '配送安装工', status: 'available' },
  { id: 'EMP006', storeId: 'STORE003', name: '郑浩', phone: '136****3001', role: '配送安装工', status: 'available' },
  { id: 'EMP007', storeId: 'STORE003', name: '冯杰', phone: '136****3002', role: '配送安装工', status: 'on_leave' },
  { id: 'EMP008', storeId: 'STORE004', name: '陈超', phone: '136****4001', role: '配送安装工', status: 'available' },
  { id: 'EMP009', storeId: 'STORE004', name: '褚鹏', phone: '136****4002', role: '配送安装工', status: 'available' },
  { id: 'EMP010', storeId: 'STORE005', name: '卫东', phone: '136****5001', role: '配送安装工', status: 'available' },
  { id: 'EMP011', storeId: 'STORE005', name: '蒋勇', phone: '136****5002', role: '配送安装工', status: 'busy' }
];

const CURRENT_STORE_ID = 'STORE001';
const CURRENT_EMPLOYEE_ID = 'EMP001';

const mockRentOrders = [
  {
    id: 'ORD2025010001',
    orderType: ORDER_TYPE.RENT,
    customerName: '张三',
    phone: '138****1234',
    product: '办公桌椅套装',
    productSpec: '1.4米办公桌 + 人体工学椅',
    quantity: 5,
    amount: 1299,
    deposit: 2000,
    monthlyRent: 1299,
    rentPeriod: '2025-01-20 至 2025-07-20',
    deliverTime: '2025-01-20 09:00-12:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_ACCEPT,
    createTime: '2025-01-15 10:30:00',
    address: '北京市朝阳区建国路88号SOHO现代城A座1501',
    contact: '张三',
    storeId: 'STORE001',
    assignedEmployee: null,
    assignHistory: [],
    escalateReason: ''
  },
  {
    id: 'ORD2025010002',
    orderType: ORDER_TYPE.RENT,
    customerName: '李四',
    phone: '139****5678',
    product: '笔记本电脑租赁',
    productSpec: 'MacBook Pro 14寸 M3芯片',
    quantity: 2,
    amount: 299,
    deposit: 10000,
    monthlyRent: 299,
    rentPeriod: '2025-01-22 至 2025-04-22',
    deliverTime: '2025-01-22 14:00-18:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_ACCEPT,
    createTime: '2025-01-15 11:20:00',
    address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦28层',
    contact: '李四',
    storeId: 'STORE003',
    assignedEmployee: null,
    assignHistory: [],
    escalateReason: ''
  },
  {
    id: 'ORD2025010003',
    orderType: ORDER_TYPE.RENT,
    customerName: '王五',
    phone: '137****9012',
    product: '会议室设备全套',
    productSpec: '86寸智能屏 + 视频会议系统 + 音响套装',
    quantity: 1,
    amount: 5999,
    deposit: 15000,
    monthlyRent: 5999,
    rentPeriod: '2025-01-25 至 2026-01-25',
    deliverTime: '2025-01-25 08:00-10:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_ASSIGN,
    createTime: '2025-01-15 09:15:00',
    address: '广州市天河区珠江新城华夏路10号富力中心35楼',
    contact: '王五',
    storeId: 'STORE004',
    assignedEmployee: null,
    assignHistory: [],
    escalateReason: ''
  },
  {
    id: 'ORD2025010004',
    orderType: ORDER_TYPE.RENT,
    customerName: '赵六',
    phone: '136****3456',
    product: '投影仪租赁',
    productSpec: '4K激光投影仪 5000流明 + 120寸幕布',
    quantity: 1,
    amount: 199,
    deposit: 3000,
    monthlyRent: 199,
    rentPeriod: '2025-01-18 至 2025-01-20',
    deliverTime: '2025-01-18 09:00-11:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_ASSIGN,
    createTime: '2025-01-14 16:45:00',
    address: '深圳市南山区科技园南路腾讯大厦12楼会议室',
    contact: '赵六',
    storeId: 'STORE005',
    assignedEmployee: null,
    assignHistory: [],
    escalateReason: ''
  },
  {
    id: 'ORD2025010005',
    orderType: ORDER_TYPE.RENT,
    customerName: '孙七',
    phone: '135****7890',
    product: '办公设备月付套餐',
    productSpec: '打印机 + 复印机 + 扫描仪组合套餐',
    quantity: 1,
    amount: 899,
    deposit: 2000,
    monthlyRent: 899,
    rentPeriod: '2025-01-16 至 2025-12-16',
    deliverTime: '2025-01-16 10:00-12:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_DELIVER,
    createTime: '2025-01-14 14:30:00',
    address: '北京市朝阳区建国路88号华星时代广场C座201',
    contact: '孙七',
    storeId: 'STORE001',
    assignedEmployee: { id: 'EMP001', name: '赵明', phone: '136****1001', assignTime: '2025-01-15 09:00:00' },
    assignHistory: [{ id: 'EMP001', name: '赵明', phone: '136****1001', assignTime: '2025-01-15 09:00:00', action: '初次指派' }],
    escalateReason: ''
  },
  {
    id: 'ORD2025010006',
    orderType: ORDER_TYPE.RENT,
    customerName: '周八',
    phone: '134****2345',
    product: '复印机租赁',
    productSpec: '彩色数码复合机 A3幅面 30页/分钟',
    quantity: 3,
    amount: 399,
    deposit: 2400,
    monthlyRent: 399,
    rentPeriod: '2025-01-17 至 2025-07-17',
    deliverTime: '2025-01-17 09:00-12:00',
    returnTime: '',
    status: ORDER_STATUS.PENDING_DELIVER,
    createTime: '2025-01-13 10:00:00',
    address: '北京市海淀区中关村大街1号软件园E区8栋3楼',
    contact: '周八',
    storeId: 'STORE002',
    assignedEmployee: { id: 'EMP004', name: '周磊', phone: '136****2001', assignTime: '2025-01-14 10:30:00' },
    assignHistory: [{ id: 'EMP004', name: '周磊', phone: '136****2001', assignTime: '2025-01-14 10:30:00', action: '初次指派' }],
    escalateReason: ''
  },
  {
    id: 'ORD2025010007',
    orderType: ORDER_TYPE.RENT,
    customerName: '吴九',
    phone: '133****6789',
    product: '服务器机柜租赁',
    productSpec: '42U标准机柜 + 10A独立供电',
    quantity: 2,
    amount: 1999,
    deposit: 8000,
    monthlyRent: 1999,
    rentPeriod: '2025-01-10 至 2025-12-10',
    deliverTime: '2025-01-10 08:00-10:00',
    returnTime: '',
    status: ORDER_STATUS.RENTING,
    createTime: '2025-01-10 08:00:00',
    address: '北京市朝阳区望京SOHO T3 B15栋数据中心',
    contact: '吴九',
    storeId: 'STORE001',
    assignedEmployee: { id: 'EMP002', name: '钱伟', phone: '136****1002', assignTime: '2025-01-10 06:00:00' },
    assignHistory: [{ id: 'EMP002', name: '钱伟', phone: '136****1002', assignTime: '2025-01-10 06:00:00', action: '初次指派' }],
    escalateReason: ''
  },
  {
    id: 'ORD2025010008',
    orderType: ORDER_TYPE.RENT,
    customerName: '郑十',
    phone: '132****0123',
    product: '办公家具年租套餐',
    productSpec: '50人工位全套办公家具（桌+椅+柜）',
    quantity: 50,
    amount: 15999,
    deposit: 50000,
    monthlyRent: 15999,
    rentPeriod: '2025-01-05 至 2026-01-05',
    deliverTime: '2025-01-05 09:00-18:00',
    returnTime: '',
    status: ORDER_STATUS.RENTING,
    createTime: '2025-01-05 15:30:00',
    address: '北京市朝阳区建国门外大街1号国贸大厦A座18-20层',
    contact: '郑十',
    storeId: 'STORE001',
    assignedEmployee: { id: 'EMP001', name: '赵明', phone: '136****1001', assignTime: '2025-01-04 14:00:00' },
    assignHistory: [{ id: 'EMP001', name: '赵明', phone: '136****1001', assignTime: '2025-01-04 14:00:00', action: '初次指派' }],
    escalateReason: ''
  },
  {
    id: 'ORD2025010009',
    orderType: ORDER_TYPE.RENT,
    customerName: '冯十一',
    phone: '131****4567',
    product: '打印机租赁',
    productSpec: '黑白激光打印机 自动双面 + 无线打印',
    quantity: 2,
    amount: 299,
    deposit: 1200,
    monthlyRent: 299,
    rentPeriod: '2024-12-15 至 2025-01-15',
    deliverTime: '2024-12-15 10:00-12:00',
    returnTime: '2025-01-15 14:00-16:00',
    status: ORDER_STATUS.PENDING_RETURN,
    createTime: '2024-12-15 09:00:00',
    address: '北京市海淀区西二旗大街38号林凯国际大厦1506',
    contact: '冯十一',
    storeId: 'STORE002',
    assignedEmployee: { id: 'EMP005', name: '吴涛', phone: '136****2002', assignTime: '2024-12-14 16:00:00' },
    assignHistory: [{ id: 'EMP005', name: '吴涛', phone: '136****2002', assignTime: '2024-12-14 16:00:00', action: '初次指派' }],
    escalateReason: ''
  },
  {
    id: 'ORD2025010010',
    orderType: ORDER_TYPE.RENT,
    customerName: '陈十二',
    phone: '130****8901',
    product: '会展设备租赁',
    productSpec: 'LED大屏10平方 + 舞台灯光 + 音响系统',
    quantity: 1,
    amount: 3999,
    deposit: 10000,
    monthlyRent: 3999,
    rentPeriod: '2024-12-20 至 2025-01-20',
    deliverTime: '2024-12-20 08:00-12:00',
    returnTime: '2025-01-20 16:00-20:00',
    status: ORDER_STATUS.PENDING_RETURN,
    createTime: '2024-12-20 14:00:00',
    address: '北京市朝阳区天辰东路7号国家会议中心N3馆',
    contact: '陈十二',
    storeId: 'STORE001',
    assignedEmployee: { id: 'EMP002', name: '钱伟', phone: '136****1002', assignTime: '2024-12-19 10:00:00' },
    assignHistory: [{ id: 'EMP002', name: '钱伟', phone: '136****1002', assignTime: '2024-12-19 10:00:00', action: '初次指派' }],
    escalateReason: ''
  }
];

const mockSaleOrders = [
  {
    id: 'SAL2025010001',
    orderType: ORDER_TYPE.SALE,
    customerName: '张总',
    phone: '139****8888',
    product: '高端办公桌椅套装',
    productSpec: '1.6米大班台 + 真皮老板椅 + 2.4米文件柜',
    quantity: 1,
    amount: 12800,
    unitPrice: 12800,
    payTime: '2025-01-14 16:30:00',
    shipTime: '',
    trackingNo: '',
    status: ORDER_STATUS.PENDING_SHIP,
    createTime: '2025-01-14 10:15:00',
    address: '北京市海淀区中关村大街1号中科大厦B座2301',
    contact: '张总',
    remark: '请安排本周五前送达，需专业安装人员到场组装',
    storeId: 'STORE002'
  },
  {
    id: 'SAL2025010002',
    orderType: ORDER_TYPE.SALE,
    customerName: '李经理',
    phone: '137****6666',
    product: '戴尔笔记本电脑',
    productSpec: 'Latitude 5440 i7-1365U 16GB 512GB',
    quantity: 10,
    amount: 79990,
    unitPrice: 7999,
    payTime: '',
    shipTime: '',
    trackingNo: '',
    status: ORDER_STATUS.PENDING_PAY,
    createTime: '2025-01-15 09:45:00',
    address: '上海市徐汇区漕河泾开发区桂平路481号5号楼',
    contact: '李经理',
    remark: '公司采购，需开具增值税专用发票',
    storeId: 'STORE003'
  },
  {
    id: 'SAL2025010003',
    orderType: ORDER_TYPE.SALE,
    customerName: '王主管',
    phone: '136****5555',
    product: '会议平板触控一体机',
    productSpec: 'MAXHUB V6经典版 75寸 i5模块 + 智能笔 + 投屏器',
    quantity: 2,
    amount: 31600,
    unitPrice: 15800,
    payTime: '2025-01-12 11:20:00',
    shipTime: '2025-01-13 14:30:00',
    trackingNo: 'SF1234567890123',
    status: ORDER_STATUS.SHIPPED,
    createTime: '2025-01-12 10:00:00',
    address: '广州市天河区珠江新城珠江西路5号国际金融中心4105',
    contact: '王主管',
    remark: '包含上门安装服务，请提前联系',
    storeId: 'STORE004'
  },
  {
    id: 'SAL2025010004',
    orderType: ORDER_TYPE.SALE,
    customerName: '赵总监',
    phone: '135****4444',
    product: '理光彩色打印机',
    productSpec: 'IM C2500 A3彩色数码复合机 双面+输稿器+工作台',
    quantity: 1,
    amount: 28800,
    unitPrice: 28800,
    payTime: '2025-01-08 09:15:00',
    shipTime: '2025-01-09 10:00:00',
    trackingNo: 'JD9876543210987',
    status: ORDER_STATUS.COMPLETED,
    createTime: '2025-01-08 09:00:00',
    address: '深圳市南山区科技园南区科苑南路15号深圳湾创业投资大厦28楼',
    contact: '赵总监',
    remark: '',
    storeId: 'STORE005'
  },
  {
    id: 'SAL2025010005',
    orderType: ORDER_TYPE.SALE,
    customerName: '孙经理',
    phone: '134****3333',
    product: '华为服务器',
    productSpec: 'FusionServer 2288H V6 2*Gold 6338 128GB 4*2TB',
    quantity: 4,
    amount: 312000,
    unitPrice: 78000,
    payTime: '2025-01-10 15:00:00',
    shipTime: '',
    trackingNo: '',
    status: ORDER_STATUS.PENDING_SHIP,
    createTime: '2025-01-10 14:30:00',
    address: '北京市朝阳区望京SOHO T1 B1栋',
    contact: '孙经理',
    remark: '原厂原封包装，需提供3年原厂质保服务',
    storeId: 'STORE001'
  },
  {
    id: 'SAL2025010006',
    orderType: ORDER_TYPE.SALE,
    customerName: '周女士',
    phone: '133****2222',
    product: '商用空气净化器',
    productSpec: '布鲁雅尔 Blueair Pro XL 工业级除甲醛PM2.5',
    quantity: 8,
    amount: 63920,
    unitPrice: 7990,
    payTime: '2025-01-11 10:45:00',
    shipTime: '2025-01-12 09:00:00',
    trackingNo: 'YT5678901234567',
    status: ORDER_STATUS.SHIPPED,
    createTime: '2025-01-11 10:30:00',
    address: '成都市高新区天府大道北段1700号环球中心E2区15楼',
    contact: '周女士',
    remark: '每层楼放置2台，请分楼层标注',
    storeId: 'STORE001'
  },
  {
    id: 'SAL2025010007',
    orderType: ORDER_TYPE.SALE,
    customerName: '吴工',
    phone: '132****1111',
    product: '网络交换机',
    productSpec: '华为 S5735-L48T4X-A1 48口千兆+4口万兆光',
    quantity: 6,
    amount: 40800,
    unitPrice: 6800,
    payTime: '2025-01-06 16:20:00',
    shipTime: '2025-01-07 11:00:00',
    trackingNo: 'ZT3456789012345',
    status: ORDER_STATUS.COMPLETED,
    createTime: '2025-01-06 16:00:00',
    address: '武汉市洪山区光谷大道77号光谷金融港B22栋',
    contact: '吴工',
    remark: '已完成上架调试，运行正常',
    storeId: 'STORE001'
  },
  {
    id: 'SAL2025010008',
    orderType: ORDER_TYPE.SALE,
    customerName: '郑总',
    phone: '131****0000',
    product: '公司门禁系统',
    productSpec: '海康威视 DS-K1T671MFW 人脸识别门禁套装(含安装)',
    quantity: 3,
    amount: 14970,
    unitPrice: 4990,
    payTime: '',
    shipTime: '',
    trackingNo: '',
    status: ORDER_STATUS.PENDING_PAY,
    createTime: '2025-01-15 15:20:00',
    address: '南京市建邺区庐山路188号新地中心二期36楼',
    contact: '郑总',
    remark: '三台分别安装在前台、数据中心出入口、办公区入口',
    storeId: 'STORE001'
  }
];

const mockOrders = [...mockRentOrders, ...mockSaleOrders];

const getStatusInfo = (order) => {
  if (order.orderType === ORDER_TYPE.RENT) {
    return RENT_STATUS_MAP[order.status] || { label: '未知', color: '#909399' };
  }
  return SALE_STATUS_MAP[order.status] || { label: '未知', color: '#909399' };
};

app.get('/api/orders', (req, res) => {
  const { status, orderType, employeeId } = req.query;
  
  let orders = mockOrders.map(order => {
    const statusInfo = getStatusInfo(order);
    return {
      ...order,
      statusLabel: statusInfo.label,
      statusColor: statusInfo.color
    };
  });

  if (orderType && orderType !== 'all') {
    orders = orders.filter(order => order.orderType === orderType);
  }

  if (status && status !== ORDER_STATUS.ALL) {
    orders = orders.filter(order => order.status === status);
  }

  if (employeeId) {
    orders = orders.filter(order => order.assignedEmployee && order.assignedEmployee.id === employeeId);
  }

  res.json({
    code: 0,
    message: 'success',
    data: orders
  });
});

app.get('/api/orders/statistics', (req, res) => {
  const { employeeId } = req.query;
  let rentOrders = mockOrders.filter(o => o.orderType === ORDER_TYPE.RENT);
  let saleOrders = mockOrders.filter(o => o.orderType === ORDER_TYPE.SALE);

  if (employeeId) {
    rentOrders = rentOrders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId);
    saleOrders = saleOrders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId);
  }

  const myOrders = employeeId
    ? mockOrders.filter(o => o.assignedEmployee && o.assignedEmployee.id === employeeId)
    : mockOrders;
  
  const statistics = {
    all: myOrders.length,
    rent_all: rentOrders.length,
    sale_all: saleOrders.length,
    pending_accept: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ACCEPT).length,
    pending_assign: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ASSIGN).length,
    pending_deliver: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_DELIVER).length,
    renting: rentOrders.filter(o => o.status === ORDER_STATUS.RENTING).length,
    pending_return: rentOrders.filter(o => o.status === ORDER_STATUS.PENDING_RETURN).length,
    escalated_to_hq: rentOrders.filter(o => o.status === ORDER_STATUS.ESCALATED_TO_HQ).length,
    pending_pay: saleOrders.filter(o => o.status === ORDER_STATUS.PENDING_PAY).length,
    pending_ship: saleOrders.filter(o => o.status === ORDER_STATUS.PENDING_SHIP).length,
    shipped: saleOrders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
    completed: saleOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
    cancelled: myOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length
  };

  res.json({
    code: 0,
    message: 'success',
    data: statistics
  });
});

app.get('/api/status/config', (req, res) => {
  const { orderType = 'all', role = 'store' } = req.query;
  
  let statusList = [];
  
  if (role === 'employee') {
    const employeeStatuses = [
      { key: ORDER_STATUS.ALL, label: '全部', orderType: 'all' },
      { key: ORDER_STATUS.PENDING_DELIVER, label: '待交付', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.RENTING, label: '租赁中', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.PENDING_RETURN, label: '待退租', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.COMPLETED, label: '已完成', orderType: ORDER_TYPE.RENT }
    ];
    return res.json({
      code: 0,
      message: 'success',
      data: employeeStatuses
    });
  }
  
  if (orderType === 'all' || orderType === ORDER_TYPE.RENT) {
    const rentStatuses = [
      { key: ORDER_STATUS.PENDING_ACCEPT, label: '待接单', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.PENDING_ASSIGN, label: '待指派', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.PENDING_DELIVER, label: '待交付', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.RENTING, label: '租赁中', orderType: ORDER_TYPE.RENT },
      { key: ORDER_STATUS.PENDING_RETURN, label: '待退租', orderType: ORDER_TYPE.RENT }
    ];
    if (role === 'hq') {
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
  const employee = mockEmployees.find(e => e.id === CURRENT_EMPLOYEE_ID);
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
  let employees = mockEmployees;
  if (storeId) {
    employees = mockEmployees.filter(e => e.storeId === storeId);
  }
  res.json({
    code: 0,
    message: 'success',
    data: employees
  });
});

const findOrderIndex = (orderId) => {
  return mockOrders.findIndex(o => o.id === orderId);
};

app.post('/api/orders/:id/accept', (req, res) => {
  const { id } = req.params;
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status !== ORDER_STATUS.PENDING_ACCEPT) {
    return res.json({ code: 1, message: '订单状态不支持接单' });
  }
  order.status = ORDER_STATUS.PENDING_ASSIGN;
  res.json({
    code: 0,
    message: '接单成功，已进入待指派状态',
    data: order
  });
});

app.post('/api/orders/:id/escalate-to-hq', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status !== ORDER_STATUS.PENDING_ACCEPT) {
    return res.json({ code: 1, message: '订单状态不支持提交总部' });
  }
  if (!reason || !reason.trim()) {
    return res.json({ code: 1, message: '请填写拒单原因' });
  }
  order.status = ORDER_STATUS.ESCALATED_TO_HQ;
  order.escalateReason = reason.trim();
  res.json({
    code: 0,
    message: '已提交总部处理，请耐心等待',
    data: order
  });
});

app.post('/api/orders/:id/assign-staff', (req, res) => {
  const { id } = req.params;
  const { employeeId, employeeName, employeePhone } = req.body || {};
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  const assignableStatuses = [ORDER_STATUS.PENDING_ASSIGN, ORDER_STATUS.PENDING_DELIVER, ORDER_STATUS.RENTING, ORDER_STATUS.PENDING_RETURN];
  if (!assignableStatuses.includes(order.status)) {
    return res.json({ code: 1, message: '订单状态不支持指派员工' });
  }
  if (!employeeId || !employeeName) {
    return res.json({ code: 1, message: '请选择员工' });
  }
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const action = order.status === ORDER_STATUS.PENDING_ASSIGN ? '初次指派' : '更换员工';
  const newAssignment = {
    id: employeeId,
    name: employeeName,
    phone: employeePhone,
    assignTime: now,
    action
  };
  if (!order.assignHistory) {
    order.assignHistory = [];
  }
  order.assignHistory.push(newAssignment);
  order.assignedEmployee = {
    id: employeeId,
    name: employeeName,
    phone: employeePhone,
    assignTime: now
  };
  if (order.status === ORDER_STATUS.PENDING_ASSIGN) {
    order.status = ORDER_STATUS.PENDING_DELIVER;
  }
  res.json({
    code: 0,
    message: action === '初次指派' ? '员工指派成功' : '员工更换成功',
    data: order
  });
});

app.post('/api/orders/:id/hq-reassign', (req, res) => {
  const { id } = req.params;
  const { targetStoreId } = req.body || {};
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status !== ORDER_STATUS.ESCALATED_TO_HQ) {
    return res.json({ code: 1, message: '订单状态不支持重新分配' });
  }
  if (!targetStoreId) {
    return res.json({ code: 1, message: '请选择目标门店' });
  }
  order.storeId = targetStoreId;
  order.status = ORDER_STATUS.PENDING_ACCEPT;
  order.escalateReason = '';
  order.assignedEmployee = null;
  order.assignHistory = [];
  const targetStore = mockStores.find(s => s.id === targetStoreId);
  res.json({
    code: 0,
    message: `已重新分配至${targetStore ? targetStore.name : targetStoreId}`,
    data: order
  });
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body || {};
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status === ORDER_STATUS.COMPLETED) {
    return res.json({ code: 1, message: '已完成订单无法取消' });
  }
  order.status = ORDER_STATUS.CANCELLED;
  order.cancelReason = reason || '总部操作取消';
  res.json({
    code: 0,
    message: '订单已取消',
    data: order
  });
});

app.post('/api/orders/:id/deliver', (req, res) => {
  const { id } = req.params;
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status !== ORDER_STATUS.PENDING_DELIVER) {
    return res.json({ code: 1, message: '订单状态不支持发货' });
  }
  order.status = ORDER_STATUS.RENTING;
  res.json({
    code: 0,
    message: '发货成功，订单进入租赁中',
    data: order
  });
});

app.post('/api/orders/:id/return', (req, res) => {
  const { id } = req.params;
  const idx = findOrderIndex(id);
  if (idx === -1) {
    return res.json({ code: 1, message: '订单不存在' });
  }
  const order = mockOrders[idx];
  if (order.status !== ORDER_STATUS.PENDING_RETURN) {
    return res.json({ code: 1, message: '订单状态不支持退租' });
  }
  order.status = ORDER_STATUS.COMPLETED;
  res.json({
    code: 0,
    message: '退租完成，订单已完结',
    data: order
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
