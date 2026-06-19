<template>
  <div class="order-list-container">
    <StatusFilter v-model="currentStatus" @change="handleStatusChange" ref="statusFilterRef" />

    <div class="order-content">
      <div class="order-header">
        <div class="header-left">
          <el-radio-group v-model="orderType" size="default" class="order-type-toggle" @change="handleTypeChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="rent">租赁订单</el-radio-button>
            <el-radio-button label="sale">销售订单</el-radio-button>
          </el-radio-group>
          <el-input
            v-model="searchKeyword"
            placeholder="搜索订单号、客户名称、商品名称"
            clearable
            style="width: 320px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-right">
          <el-radio-group v-model="viewMode" size="default" class="view-toggle">
            <el-radio-button value="table">
              <el-icon><List /></el-icon>
              <span class="toggle-text">表格</span>
            </el-radio-button>
            <el-radio-button value="card">
              <el-icon><Grid /></el-icon>
              <span class="toggle-text">卡片</span>
            </el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="refreshOrderList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div v-loading="loading" class="order-body">
        <template v-if="viewMode === 'table'">
          <div class="order-table-wrapper">
            <el-table
              :data="filteredOrders"
              border
              stripe
              style="width: 100%"
              :empty-text="emptyText"
            >
              <el-table-column label="订单类型" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row.orderType === 'rent'" type="success" effect="plain" size="small">租赁</el-tag>
                  <el-tag v-else type="warning" effect="plain" size="small">销售</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="id" label="订单号" width="170" />
              <el-table-column prop="customerName" label="客户姓名" width="110" />
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column prop="product" label="商品" min-width="160" />
              <el-table-column label="数量" width="80" align="center">
                <template #default="{ row }">x{{ row.quantity }}</template>
              </el-table-column>
              <el-table-column prop="amount" label="订单金额" width="110">
                <template #default="{ row }">
                  <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="statusLabel" label="订单状态" width="100">
                <template #default="{ row }">
                  <el-tag :color="row.statusColor" effect="light" size="small">
                    {{ row.statusLabel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <template v-if="row.orderType === 'rent'">
                      <el-button v-if="row.status === 'pending_accept'" type="success" size="small" @click="handleAccept(row)">接单</el-button>
                      <el-button v-if="row.status === 'pending_assign'" type="primary" size="small" @click="handleAssign(row)">指派</el-button>
                      <el-button v-if="row.status === 'pending_deliver'" type="warning" size="small" @click="handleDeliver(row)">发货</el-button>
                      <el-button v-if="row.status === 'pending_return'" type="danger" size="small" @click="handleReturn(row)">退租</el-button>
                    </template>
                    <template v-else>
                      <el-button v-if="row.status === 'pending_pay'" type="warning" size="small" @click="handleRemindPay(row)">催付</el-button>
                      <el-button v-if="row.status === 'pending_ship'" type="primary" size="small" @click="handleSaleShip(row)">发货</el-button>
                      <el-button v-if="row.status === 'shipped'" size="small" @click="handleTracking(row)">物流</el-button>
                    </template>
                    <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <template v-else>
          <div v-if="filteredOrders.length === 0" class="empty-state">
            <el-empty :description="emptyText" />
          </div>
          <div v-else class="order-card-grid">
            <template v-for="order in filteredOrders" :key="order.id">
              <OrderCard
                v-if="order.orderType === 'rent'"
                :order="order"
                @accept="handleAccept"
                @assign="handleAssign"
                @deliver="handleDeliver"
                @return="handleReturn"
                @view="handleViewDetail"
              />
              <SalesOrderCard
                v-else
                :order="order"
                @remindPay="handleRemindPay"
                @ship="handleSaleShip"
                @tracking="handleTracking"
                @view="handleViewDetail"
              />
            </template>
          </div>
        </template>
      </div>

      <div class="order-footer">
        <span class="footer-info">共 {{ filteredOrders.length }} 条记录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, Refresh, List, Grid } from '@element-plus/icons-vue';
import StatusFilter from './StatusFilter.vue';
import OrderCard from './OrderCard.vue';
import SalesOrderCard from './SalesOrderCard.vue';
import { getOrderList } from '../api/order.js';

const currentStatus = ref('all');
const orderType = ref('all');
const searchKeyword = ref('');
const loading = ref(false);
const orders = ref([]);
const statusFilterRef = ref(null);
const viewMode = ref('card');

const filteredOrders = computed(() => {
  if (!searchKeyword.value) return orders.value;
  const keyword = searchKeyword.value.toLowerCase();
  return orders.value.filter(order =>
    order.id.toLowerCase().includes(keyword) ||
    order.customerName.toLowerCase().includes(keyword) ||
    order.product.toLowerCase().includes(keyword)
  );
});

const emptyText = computed(() => {
  if (loading.value) return '加载中...';
  return searchKeyword.value ? '未找到匹配的订单' : '暂无订单数据';
});

const loadOrderList = async () => {
  loading.value = true;
  try {
    orders.value = await getOrderList(currentStatus.value, orderType.value);
  } catch (error) {
    console.error('加载订单列表失败:', error);
    ElMessage.error('加载订单列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshOrderList = () => {
  loadOrderList();
  if (statusFilterRef.value) {
    statusFilterRef.value.refreshStatistics();
  }
};

const handleStatusChange = () => {
  loadOrderList();
};

const handleTypeChange = () => {
  loadOrderList();
};

const handleSearch = () => {
  loadOrderList();
};

const handleAccept = (row) => {
  ElMessage.success(`已接单：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleAssign = (row) => {
  ElMessage.success(`已指派：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleDeliver = (row) => {
  ElMessage.success(`已发货：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleReturn = (row) => {
  ElMessage.success(`已处理退租：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleRemindPay = (row) => {
  ElMessage.success(`已发送付款提醒：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleSaleShip = (row) => {
  ElMessage.success(`已发货：${row.id}`);
  setTimeout(refreshOrderList, 1000);
};

const handleTracking = (row) => {
  ElMessage.info(`查看物流：${row.trackingNo || '暂无物流信息'}`);
};

const handleViewDetail = (row) => {
  ElMessage.info(`查看订单详情：${row.id}`);
};

onMounted(() => {
  loadOrderList();
});
</script>

<style scoped>
.order-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-content {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left,
.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-toggle {
  display: flex;
  align-items: center;
}

.view-toggle :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
}

.toggle-text {
  font-size: 14px;
}

.order-body {
  min-height: 400px;
}

.order-table-wrapper {
  padding: 0 24px;
}

.order-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
  padding: 24px;
}

.empty-state {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.order-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.footer-info {
  font-size: 14px;
  color: #909399;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .order-card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
  
  .order-header {
    padding: 16px;
  }
  
  .order-table-wrapper {
    padding: 0 16px;
  }
  
  .toggle-text {
    display: none;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .order-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
}

@media (min-width: 1600px) {
  .order-card-grid {
    grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  }
}
</style>
