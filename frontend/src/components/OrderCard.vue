<template>
  <div class="order-card" :class="`status-${order.status}`">
    <div class="card-header">
      <div class="order-id">
        <el-icon class="order-icon"><Tickets /></el-icon>
        <span class="id-text">{{ order.id }}</span>
      </div>
      <el-tag :color="order.statusColor" effect="light" class="status-tag">
        {{ order.statusLabel }}
      </el-tag>
    </div>

    <div class="card-body">
      <div class="info-section user-info">
        <div class="section-title">
          <el-icon><User /></el-icon>
          <span>用户信息</span>
        </div>
        <div class="info-content">
          <div class="info-item">
            <span class="label">客户姓名：</span>
            <span class="value">{{ order.customerName }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话：</span>
            <span class="value">{{ order.phone }}</span>
          </div>
          <div class="info-item" v-if="order.contact">
            <span class="label">联系人：</span>
            <span class="value">{{ order.contact }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-section product-info">
        <div class="section-title">
          <el-icon><Goods /></el-icon>
          <span>商品信息</span>
        </div>
        <div class="info-content">
          <div class="product-name">{{ order.product }}</div>
          <div class="product-spec" v-if="order.productSpec">
            {{ order.productSpec }}
          </div>
          <div class="product-meta">
            <span class="meta-item" v-if="order.quantity">
              <el-icon><Box /></el-icon>
              x{{ order.quantity }}
            </span>
            <span class="meta-item" v-if="order.monthlyRent">
              月租金 ¥{{ order.monthlyRent }}
            </span>
            <span class="meta-item" v-if="order.deposit">
              押金 ¥{{ order.deposit }}
            </span>
          </div>
          <div class="rent-period" v-if="order.rentPeriod">
            <el-icon><Calendar /></el-icon>
            <span>租期：{{ order.rentPeriod }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-section delivery-info">
        <div class="section-title">
          <el-icon><Van /></el-icon>
          <span>配送信息</span>
        </div>
        <div class="info-content">
          <div class="info-item" v-if="order.deliverTime">
            <span class="label">交付时间：</span>
            <span class="value highlight">{{ order.deliverTime }}</span>
          </div>
          <div class="info-item" v-if="order.returnTime">
            <span class="label">退租时间：</span>
            <span class="value highlight">{{ order.returnTime }}</span>
          </div>
          <div class="info-item address-item">
            <span class="label">交付地址：</span>
            <span class="value address-text">{{ order.address }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="amount-section">
        <span class="amount-label">订单金额</span>
        <span class="amount-value">¥{{ order.amount.toFixed(2) }}</span>
      </div>
      <div class="action-buttons">
        <el-button
          v-if="order.status === 'pending_accept'"
          type="success"
          size="small"
          @click="$emit('accept', order)"
        >
          接单
        </el-button>
        <el-button
          v-if="order.status === 'pending_assign'"
          type="primary"
          size="small"
          @click="$emit('assign', order)"
        >
          指派
        </el-button>
        <el-button
          v-if="order.status === 'pending_deliver'"
          type="warning"
          size="small"
          @click="$emit('deliver', order)"
        >
          发货
        </el-button>
        <el-button
          v-if="order.status === 'pending_return'"
          type="danger"
          size="small"
          @click="$emit('return', order)"
        >
          退租
        </el-button>
        <el-button size="small" @click="$emit('view', order)">
          详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Tickets, User, Goods, Box, Calendar, Van } from '@element-plus/icons-vue';

defineProps({
  order: {
    type: Object,
    required: true
  }
});

defineEmits(['accept', 'assign', 'deliver', 'return', 'view']);
</script>

<style scoped>
.order-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.order-card.status-pending_accept:hover {
  border-color: #faad14;
}

.order-card.status-pending_assign:hover {
  border-color: #1890ff;
}

.order-card.status-pending_deliver:hover {
  border-color: #722ed1;
}

.order-card.status-renting:hover {
  border-color: #52c41a;
}

.order-card.status-pending_return:hover {
  border-color: #f5222d;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
  border-bottom: 1px solid #ebeef5;
}

.order-id {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-icon {
  font-size: 18px;
  color: #667eea;
}

.id-text {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.5px;
}

.status-tag {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 20px;
}

.card-body {
  padding: 16px 20px;
}

.info-section + .info-section {
  margin-top: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.section-title .el-icon {
  color: #667eea;
  font-size: 16px;
}

.info-content {
  padding-left: 22px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.6;
}

.info-item + .info-item {
  margin-top: 8px;
}

.label {
  color: #909399;
  flex-shrink: 0;
  min-width: 80px;
}

.value {
  color: #303133;
  flex: 1;
  word-break: break-all;
}

.value.highlight {
  color: #667eea;
  font-weight: 500;
}

.address-text {
  line-height: 1.6;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #ebeef5 20%, #ebeef5 80%, transparent 100%);
  margin: 16px 0;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.product-spec {
  font-size: 13px;
  color: #606266;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  background: #f0f2f5;
  padding: 4px 10px;
  border-radius: 12px;
}

.meta-item .el-icon {
  font-size: 14px;
  color: #909399;
}

.rent-period {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 6px;
}

.rent-period .el-icon {
  color: #409eff;
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-top: 1px solid #ebeef5;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-label {
  font-size: 12px;
  color: #909399;
}

.amount-value {
  font-size: 22px;
  font-weight: 700;
  color: #f56c6c;
}

.amount-value::before {
  content: '';
  font-size: 14px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.address-item {
  align-items: flex-start;
}

@media (max-width: 768px) {
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .amount-section {
    text-align: center;
  }
  
  .product-meta {
    gap: 8px;
  }
  
  .info-item {
    flex-direction: column;
  }
  
  .label {
    min-width: auto;
    margin-bottom: 2px;
  }
}
</style>
