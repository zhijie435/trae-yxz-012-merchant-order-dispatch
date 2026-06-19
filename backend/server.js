const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const ORDER_STATUS = {
  ALL: 'all',
  PENDING_ACCEPT: 'pending_accept',
  PENDING_ASSIGN: 'pending_assign',
  PENDING_DELIVER: 'pending_deliver',
  RENTING: 'renting',
  PENDING_RETURN: 'pending_return'
};

const STATUS_MAP = {
  [ORDER_STATUS.PENDING_ACCEPT]: { label: '待接单', color: '#faad14' },
  [ORDER_STATUS.PENDING_ASSIGN]: { label: '待指派', color: '#1890ff' },
  [ORDER_STATUS.PENDING_DELIVER]: { label: '待交付', color: '#722ed1' },
  [ORDER_STATUS.RENTING]: { label: '租赁中', color: '#52c41a' },
  [ORDER_STATUS.PENDING_RETURN]: { label: '待退租', color: '#f5222d' }
};

const mockOrders = [
  {
    id: 'ORD2025010001',
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
    contact: '张三'
  },
  {
    id: 'ORD2025010002',
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
    contact: '李四'
  },
  {
    id: 'ORD2025010003',
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
    contact: '王五'
  },
  {
    id: 'ORD2025010004',
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
    contact: '赵六'
  },
  {
    id: 'ORD2025010005',
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
    address: '杭州市西湖区文三路478号华星时代广场C座201',
    contact: '孙七'
  },
  {
    id: 'ORD2025010006',
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
    address: '成都市高新区天府大道天府软件园E区8栋3楼',
    contact: '周八'
  },
  {
    id: 'ORD2025010007',
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
    address: '武汉市东湖新技术开发区光谷金融港B15栋数据中心',
    contact: '吴九'
  },
  {
    id: 'ORD2025010008',
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
    address: '南京市建邺区河西大街新城科技园A座18-20层',
    contact: '郑十'
  },
  {
    id: 'ORD2025010009',
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
    address: '西安市高新区科技路38号林凯国际大厦1506',
    contact: '冯十一'
  },
  {
    id: 'ORD2025010010',
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
    address: '重庆市渝北区金开大道悦来国际博览中心N3馆',
    contact: '陈十二'
  }
];

app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  
  let orders = mockOrders.map(order => ({
    ...order,
    statusLabel: STATUS_MAP[order.status].label,
    statusColor: STATUS_MAP[order.status].color
  }));

  if (status && status !== ORDER_STATUS.ALL) {
    orders = orders.filter(order => order.status === status);
  }

  res.json({
    code: 0,
    message: 'success',
    data: orders
  });
});

app.get('/api/orders/statistics', (req, res) => {
  const statistics = {
    all: mockOrders.length,
    pending_accept: mockOrders.filter(o => o.status === ORDER_STATUS.PENDING_ACCEPT).length,
    pending_assign: mockOrders.filter(o => o.status === ORDER_STATUS.PENDING_ASSIGN).length,
    pending_deliver: mockOrders.filter(o => o.status === ORDER_STATUS.PENDING_DELIVER).length,
    renting: mockOrders.filter(o => o.status === ORDER_STATUS.RENTING).length,
    pending_return: mockOrders.filter(o => o.status === ORDER_STATUS.PENDING_RETURN).length
  };

  res.json({
    code: 0,
    message: 'success',
    data: statistics
  });
});

app.get('/api/status/config', (req, res) => {
  const statusList = [
    { key: ORDER_STATUS.ALL, label: '全部' },
    { key: ORDER_STATUS.PENDING_ACCEPT, label: '待接单' },
    { key: ORDER_STATUS.PENDING_ASSIGN, label: '待指派' },
    { key: ORDER_STATUS.PENDING_DELIVER, label: '待交付' },
    { key: ORDER_STATUS.RENTING, label: '租赁中' },
    { key: ORDER_STATUS.PENDING_RETURN, label: '待退租' }
  ];

  res.json({
    code: 0,
    message: 'success',
    data: statusList
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
