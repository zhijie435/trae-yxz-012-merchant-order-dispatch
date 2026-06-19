# 门店订单接单指派系统 - 部署文档

## 项目概述

本系统是一个门店端订单接单与指派管理系统，包含：
- **租赁订单管理**：接单、拒单、指派员工、交付、退租全流程
- **销售订单管理**：待付款、待发货、已发货、已完成状态管理
- **多角色支持**：门店店长、配送安装工、总部管理员

---

## 环境要求

| 环境 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | >= 16.x | 建议使用 LTS 版本 |
| npm | >= 8.x | 随 Node.js 安装 |
| 浏览器 | Chrome 90+ / Edge 90+ / Safari 14+ | 前端运行环境 |

---

## 目录结构

```
012-门店端订单接单指派/
├── backend/                    # 后端服务
│   ├── src/
│   │   ├── constants.js        # 常量定义（状态、角色、类型）
│   │   ├── mockData.js         # 种子数据（门店、员工、订单）
│   │   ├── stateMachine.js     # 订单状态机
│   │   ├── operationLog.js     # 操作日志服务
│   │   └── orderService.js     # 订单业务服务
│   ├── scripts/
│   │   ├── exportData.js       # 数据导出脚本
│   │   └── verifyData.js       # 数据验收脚本
│   ├── tests/                  # 单元测试
│   ├── exports/                # 数据导出目录（自动生成）
│   ├── server.js               # Express 服务器入口
│   └── package.json
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── api/order.js        # API 调用封装
│   │   ├── components/         # Vue 组件
│   │   ├── App.vue             # 主组件
│   │   └── main.js             # 入口文件
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
└── DEPLOY.md                   # 本文档
```

---

## 快速启动

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

服务启动后访问：`http://localhost:3001`

### 2. 启动前端应用

```bash
cd frontend
npm install
npm run dev
```

前端启动后访问终端显示的地址（通常为 `http://localhost:5173`）

---

## 种子数据说明

系统内置完整的 Mock 数据，位于 [backend/src/mockData.js](backend/src/mockData.js)。

### 门店数据（5个）

| 门店ID | 门店名称 | 联系人 | 电话 |
|--------|----------|--------|------|
| STORE001 | 北京朝阳门店 | 王经理 | 138****1111 |
| STORE002 | 北京海淀门店 | 李经理 | 138****2222 |
| STORE003 | 上海浦东门店 | 张经理 | 138****3333 |
| STORE004 | 广州天河门店 | 刘经理 | 138****4444 |
| STORE005 | 深圳南山门店 | 陈经理 | 138****5555 |

### 员工账号（18个）

#### 门店店长（5个）

| 员工ID | 所属门店 | 姓名 | 角色 |
|--------|----------|------|------|
| STORE001-MGR | STORE001 | 王经理 | 门店店长 |
| STORE002-MGR | STORE002 | 李经理 | 门店店长 |
| STORE003-MGR | STORE003 | 张经理 | 门店店长 |
| STORE004-MGR | STORE004 | 刘经理 | 门店店长 |
| STORE005-MGR | STORE005 | 陈经理 | 门店店长 |

#### 配送安装工（11个）

| 员工ID | 所属门店 | 姓名 | 状态 |
|--------|----------|------|------|
| EMP001 | STORE001 | 赵明 | available（空闲） |
| EMP002 | STORE001 | 钱伟 | available（空闲） |
| EMP003 | STORE001 | 孙强 | busy（忙碌） |
| EMP004 | STORE002 | 周磊 | available（空闲） |
| EMP005 | STORE002 | 吴涛 | available（空闲） |
| EMP006 | STORE003 | 郑浩 | available（空闲） |
| EMP007 | STORE003 | 冯杰 | on_leave（休假） |
| EMP008 | STORE004 | 陈超 | available（空闲） |
| EMP009 | STORE004 | 褚鹏 | available（空闲） |
| EMP010 | STORE005 | 卫东 | available（空闲） |
| EMP011 | STORE005 | 蒋勇 | busy（忙碌） |

#### 总部管理员（2个）

| 员工ID | 姓名 | 角色 |
|--------|------|------|
| HQ001 | 总部调度员 | 总部管理员 |
| HQ002 | 总部运营主管 | 总部管理员 |

### 订单数据（22个）

#### 租赁订单（13个）

| 状态 | 数量 | 说明 |
|------|------|------|
| pending_accept（待接单） | 2 | 等待门店确认接单 |
| pending_assign（待指派） | 2 | 已接单，等待指派员工 |
| pending_deliver（待交付） | 2 | 已指派，等待配送交付 |
| renting（租赁中） | 2 | 正常租赁服务中 |
| pending_return（待退租） | 2 | 等待上门回收 |
| rejected（已拒单） | 1 | 含拒单原因 |
| escalated_to_hq（待总部处理） | 1 | 含上报原因 |
| cancelled（已取消） | 1 | 含取消原因 |

#### 销售订单（9个）

| 状态 | 数量 | 说明 |
|------|------|------|
| pending_pay（待付款） | 2 | 客户未完成支付 |
| pending_ship（待发货） | 2 | 已付款，等待发货 |
| shipped（已发货） | 2 | 物流配送中 |
| completed（已完成） | 2 | 订单已完结 |
| cancelled（已取消） | 1 | 含取消原因 |

---

## 可用命令

### 后端命令（backend 目录下执行）

| 命令 | 说明 |
|------|------|
| `npm start` | 启动后端服务（端口 3001） |
| `npm run dev` | 以开发模式启动（自动热重载） |
| `npm test` | 运行所有单元测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 运行测试并输出覆盖率报告 |
| `npm run verify` | **数据验收**：验证种子数据完整性 |
| `npm run seed:verify` | **完整验收**：数据验收 + 单元测试 |
| `npm run export` | **导出全部数据**：门店、员工、订单 |
| `npm run export:stores` | 仅导出门店数据 |
| `npm run export:employees` | 仅导出员工数据 |
| `npm run export:orders` | 仅导出订单数据 |

### 前端命令（frontend 目录下执行）

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产构建 |

---

## 数据验收与导出

### 验收种子数据

部署前或更新数据后，运行验收命令确保数据完整：

```bash
cd backend
npm run verify
```

预期输出：
```
通过: 142 项
失败: 0 项
🎉 全部验收通过！数据准备就绪。
```

### 完整验收（含单元测试）

```bash
npm run seed:verify
```

### 导出数据

数据将导出到 `backend/exports/` 目录，文件名包含时间戳。

```bash
# 导出全部数据（门店、员工、订单）
npm run export

# 单独导出
npm run export:stores      # 门店数据
npm run export:employees   # 员工数据
npm run export:orders      # 订单数据
```

导出的 JSON 文件包含：
- 统计汇总（总数、状态分布、金额汇总）
- 导出时间
- 完整数据明细

---

## API 接口列表

后端服务启动后，Base URL: `http://localhost:3001`

### 订单相关

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/orders` | 获取订单列表（支持 status、orderType、employeeId 筛选） |
| GET | `/api/orders/:id` | 获取订单详情 |
| GET | `/api/orders/statistics` | 获取订单统计数据 |
| GET | `/api/orders/:id/logs` | 获取订单操作日志 |
| GET | `/api/orders/:id/transitions` | 获取订单可执行的状态转换 |
| POST | `/api/orders/:id/accept` | 接单 |
| POST | `/api/orders/:id/reject` | 拒单（需传 reason） |
| POST | `/api/orders/:id/escalate-to-hq` | 上报总部（需传 reason） |
| POST | `/api/orders/:id/assign-staff` | 指派员工（需传 employeeId、employeeName） |
| POST | `/api/orders/:id/hq-reassign` | 总部重新分配门店 |
| POST | `/api/orders/:id/cancel` | 取消订单（需传 reason） |
| POST | `/api/orders/:id/deliver` | 租赁订单发货交付 |
| POST | `/api/orders/:id/return` | 租赁订单退租完成 |
| POST | `/api/orders/:id/sale-ship` | 销售订单发货 |

### 基础数据

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stores` | 获取门店列表 |
| GET | `/api/current-store` | 获取当前门店信息 |
| GET | `/api/employees` | 获取员工列表（支持 storeId 筛选） |
| GET | `/api/current-employee` | 获取当前员工信息 |
| GET | `/api/order-types` | 获取订单类型配置 |
| GET | `/api/status/config` | 获取状态配置 |
| GET | `/api/operation-logs` | 获取全部操作日志 |

---

## 部署注意事项

1. **端口占用**：后端默认使用 3001 端口，如被占用可修改 `backend/server.js` 中的 `PORT` 变量
2. **数据持久化**：当前版本使用内存存储，服务重启后数据将重置为种子数据。生产环境需接入数据库
3. **CORS**：后端已启用 CORS 允许跨域，部署时需根据实际域名调整白名单
4. **前端 API 地址**：如后端地址变更，需修改 `frontend/src/api/order.js` 中的 baseURL
5. **exports 目录**：已加入 .gitignore，避免导出的 JSON 文件被版本控制追踪
