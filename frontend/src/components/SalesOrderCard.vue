<template>
  <div class="sales-order-card" :class="`status-${order.status}`">
    <div class="card-header">
      <div class="card-header-left">
        <div class="order-id-row">
          <el-icon class="order-icon"><ShoppingCart /></el-icon>
          <span class="id-text">{{ order.id }}</span>
        </div>
        <el-tag type="info" size="small" class="order-type-tag">
          <el-icon><Goods /></el-icon>
          销售订单
        </el-tag>
      </div>
      <el-tag :color="order.statusColor" effect="dark" class="status-tag">
        {{ order.statusLabel }}
      </el-tag>
    </div>

    <div class="card-body">
      <div class="info-section">
        <div class="section-title">
          <el-icon><User /></el-icon>
          <span>用户信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">客户姓名</span>
            <span class="value">{{ order.customerName }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ order.phone }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">联系人</span>
            <span class="value">{{ order.contact }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-section">
        <div class="section-title">
          <el-icon><Goods /></el-icon>
          <span>商品信息</span>
        </div>
        <div class="product-info">
          <div class="product-name">{{ order.product }}</div>
          <div class="product-spec">{{ order.productSpec }}</div>
          <div class="product-details">
            <div class="product-price-row">
              <span class="detail-item">
                <el-icon><Money /></el-icon>
                单价 ¥{{ order.unitPrice?.toFixed(2) }}
              </span>
              <span class="detail-item">
                <el-icon><Box /></el-icon>
                x{{ order.quantity }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-section">
        <div class="section-title">
          <el-icon><List /></el-icon>
          <span>物流信息</span>
        </div>
        <div class="info-grid">
          <div class="info-item" v-if="order.payTime">
            <span class="label">付款时间</span>
            <span class="value">{{ order.payTime }}</span>
          </div>
          <div class="info-item" v-if="order.shipTime">
            <span class="label">发货时间</span>
            <span class="value">{{ order.shipTime }}</span>
          </div>
          <div class="info-item" v-if="order.trackingNo">
            <span class="label">快递单号</span>
            <span class="value tracking-no">{{ order.trackingNo }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">收货地址</span>
            <span class="value">{{ order.address }}</span>
          </div>
        </div>
        <div class="remark-box" v-if="order.remark">
          <el-icon class="remark-icon"><Warning /></el-icon>
          <span class="remark-label">备注：</span>
          <span class="remark-text">{{ order.remark }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="amount-section">
        <span class="amount-label">订单金额</span>
        <div class="amount-row">
          <span class="amount-currency">¥</span>
          <span class="amount-value">{{ order.amount.toFixed(2) }}</span>
        </div>
        <div class="amount-sub">共 {{ order.quantity }} 件商品</div>
      </div>
      <div class="action-buttons">
        <el-button
          v-if="order.status === 'pending_pay'"
          type="warning"
          size="small"
          @click="$emit('remindPay', order)"
        >
          <el-icon><Bell /></el-icon>
          催付款
        </el-button>
        <el-button
          v-if="order.status === 'pending_ship'"
          type="primary"
          size="small"
          @click="$emit('ship', order)"
        >
          <el-icon><Van /></el-icon>
          发货
        </el-button>
        <el-button
          v-if="order.status === 'shipped'"
          size="small"
          @click="$emit('tracking', order)"
        >
          <el-icon><Location /></el-icon>
          物流
        </el-button>
        <el-button size="small" @click="$emit('view', order)">
          <el-icon><View /></el-icon>
          详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ShoppingCart, Goods, User, Money, Box, List, Warning, Bell, Van, Location, View
} from '@element-plus/icons-vue';

defineProps({
  order: {
    type: Object,
    required: true
  }
});

defineEmits(['remindPay', 'ship', 'tracking', 'view']);
</script>

<style scoped>
.sales-order-card {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
}

.sales-order-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.sales-order-card.status-pending_pay:hover {
  border-color: #fa8c16;
}

.sales-order-card.status-pending_ship:hover {
  border-color: #1890ff;
}

.sales-order-card.status-shipped:hover {
  border-color: #722ed1;
}

.sales-order-card.status-completed:hover {
  border-color: #52c41a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fafbff 0%, #f5f7ff 50%, #fafbff 100%);
  border-bottom: 1px solid #eef0f5;
}

.card-header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-id-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-icon {
  font-size: 20px;
  color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background: linear-gradient(135deg, #e8eaff 0%, #f0e8ff 100%);
  padding: 6px;
  border-radius: 8px;
}

.id-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.3px;
}

.order-type-tag {
  align-self: flex-start;
  border-radius: 6px;
  background: rgba(102, 126, 234, 0.1);
  border: none;
  color: #667eea;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.status-tag {
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-body {
  padding: 20px 24px;
}

.info-section + .info-section {
  margin-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 14px;
}

.section-title .el-icon {
  color: #667eea;
  font-size: 17px;
  background: linear-gradient(135deg, #eef1ff 0%, #e6ebff 100%);
  padding: 4px;
  border-radius: 6px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.tracking-no {
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  color: #667eea;
  background: #eef1ff;
  padding: 3px 10px;
  border-radius: 4px;
  align-self: flex-start;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e7eb 15%, #e5e7eb 85%, transparent 100%);
  margin: 20px 0;
}

.product-name {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.product-spec {
  font-size: 13px;
  color: #6b7280;
  padding: 10px 14px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-radius: 8px;
  border-left: 3px solid #667eea;
  margin-bottom: 14px;
  line-height: 1.6;
}

.product-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 10px 14px;
}

.product-price-row {
  display: flex;
  gap: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #4b5563;
  font-weight: 600;
}

.detail-item .el-icon {
  color: #9ca3af;
  font-size: 15px;
}

.remark-box {
  margin-top: 14px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 14px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 8px;
  border: 1px solid #fde68a;
  font-size: 13px;
}

.remark-icon {
  color: #d97706;
  font-size: 15px;
  flex-shrink: 0;
  margin-top: 1px;
}

.remark-label {
  color: #92400e;
  font-weight: 600;
  flex-shrink: 0;
}

.remark-text {
  color: #78350f;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 20px 24px;
  background: linear-gradient(180deg, #fafbff 0%, #f5f7fa 100%);
  border-top: 1px solid #eef0f5;
  gap: 16px;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.amount-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.amount-row {
  display: flex;
  align-items: baseline;
  line-height: 1;
}

.amount-currency {
  font-size: 16px;
  font-weight: 700;
  color: #ef4444;
}

.amount-value {
  font-size: 26px;
  font-weight: 800;
  color: #ef4444;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.amount-sub {
  font-size: 12px;
  color: #9ca3af;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .card-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .amount-section {
    align-items: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .status-tag {
    align-self: flex-start;
  }
}
</style>
