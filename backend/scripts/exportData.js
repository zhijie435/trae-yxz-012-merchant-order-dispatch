const fs = require('fs');
const path = require('path');
const { mockStores, mockEmployees, mockRentOrders, mockSaleOrders, mockOrders } = require('../src/mockData');
const { ORDER_STATUS, ORDER_TYPE, ROLE } = require('../src/constants');

const OUTPUT_DIR = path.join(__dirname, '../exports');

const ensureDir = () => {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
};

const formatDate = () => {
  const d = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
};

const writeJson = (filename, data) => {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ 已导出: ${filePath}`);
  return filePath;
};

const exportStores = () => {
  const data = {
    total: mockStores.length,
    exportTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    data: mockStores
  };
  return writeJson(`stores_${formatDate()}.json`, data);
};

const exportEmployees = () => {
  const grouped = {
    store_managers: mockEmployees.filter(e => e.role === '门店店长'),
    delivery_workers: mockEmployees.filter(e => e.role === '配送安装工'),
    hq_admins: mockEmployees.filter(e => e.role === '总部管理员')
  };
  const data = {
    total: mockEmployees.length,
    byRole: {
      store_managers: grouped.store_managers.length,
      delivery_workers: grouped.delivery_workers.length,
      hq_admins: grouped.hq_admins.length
    },
    exportTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    data: mockEmployees,
    grouped
  };
  return writeJson(`employees_${formatDate()}.json`, data);
};

const exportOrders = () => {
  const rentStats = {
    total: mockRentOrders.length,
    pending_accept: mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ACCEPT).length,
    pending_assign: mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_ASSIGN).length,
    pending_deliver: mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_DELIVER).length,
    renting: mockRentOrders.filter(o => o.status === ORDER_STATUS.RENTING).length,
    pending_return: mockRentOrders.filter(o => o.status === ORDER_STATUS.PENDING_RETURN).length,
    escalated_to_hq: mockRentOrders.filter(o => o.status === ORDER_STATUS.ESCALATED_TO_HQ).length,
    rejected: mockRentOrders.filter(o => o.status === ORDER_STATUS.REJECTED).length,
    cancelled: mockRentOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
    completed: mockRentOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length
  };

  const saleStats = {
    total: mockSaleOrders.length,
    pending_pay: mockSaleOrders.filter(o => o.status === ORDER_STATUS.PENDING_PAY).length,
    pending_ship: mockSaleOrders.filter(o => o.status === ORDER_STATUS.PENDING_SHIP).length,
    shipped: mockSaleOrders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
    completed: mockSaleOrders.filter(o => o.status === ORDER_STATUS.COMPLETED).length,
    cancelled: mockSaleOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length
  };

  const totalAmount = {
    rent: mockRentOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    sale: mockSaleOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
    all: mockOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
  };

  const data = {
    total: mockOrders.length,
    rentStats,
    saleStats,
    totalAmount,
    exportTime: new Date().toLocaleString('zh-CN', { hour12: false }),
    rentOrders: mockRentOrders,
    saleOrders: mockSaleOrders
  };
  return writeJson(`orders_${formatDate()}.json`, data);
};

const exportAll = () => {
  ensureDir();
  console.log('========== 开始导出数据 ==========');
  console.log(`导出目录: ${OUTPUT_DIR}`);
  console.log('');

  exportStores();
  exportEmployees();
  exportOrders();

  console.log('');
  console.log('========== 数据导出完成 ==========');
};

const command = process.argv[2] || 'all';

switch (command) {
  case 'stores':
    ensureDir();
    exportStores();
    break;
  case 'employees':
    ensureDir();
    exportEmployees();
    break;
  case 'orders':
    ensureDir();
    exportOrders();
    break;
  case 'all':
  default:
    exportAll();
}
