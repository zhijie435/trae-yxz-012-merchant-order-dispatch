<template>
  <div class="order-card" :class="`status-${order.status}`">
    <div class="card-header">
      <div class="order-id">
        <el-icon class="order-icon"><Tickets /></el-icon>
        <span class="id-text">{{ order.id }}</span>
      </div>
      <div class="header-tags">
        <el-tag v-if="order.storeName || storeInfo" type="info" effect="plain" size="small" class="store-tag-mini">
          <el-icon><OfficeBuilding /></el-icon>
          {{ order.storeName || (storeInfo && storeInfo.name) || order.storeId }}
        </el-tag>
        <el-tag :color="order.statusColor" effect="light" class="status-tag">
          {{ order.statusLabel }}
        </el-tag>
      </div>
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

      <template v-if="order.assignedEmployee || order.assignHistory?.length">
        <div class="divider"></div>
        <div class="info-section staff-info">
          <div class="section-title">
            <el-icon><Avatar /></el-icon>
            <span>负责员工</span>
            <el-tag v-if="order.assignedEmployee" type="success" effect="light" size="small" class="current-staff-tag">
              当前负责
            </el-tag>
            <el-button
              v-if="canChangeStaff"
              link
              type="primary"
              size="small"
              class="change-btn"
              @click="$emit('changeStaff', order)"
            >
              <el-icon><RefreshRight /></el-icon>
              更换员工
            </el-button>
          </div>
          <div class="info-content">
            <div v-if="order.assignedEmployee" class="current-staff">
              <div class="info-item">
                <span class="label">员工姓名：</span>
                <span class="value highlight">{{ order.assignedEmployee.name }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ order.assignedEmployee.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">指派时间：</span>
                <span class="value">{{ order.assignedEmployee.assignTime }}</span>
              </div>
            </div>
            <div v-else class="no-staff-hint">
              <el-icon><Warning /></el-icon>
              <span>暂未指派员工，请尽快指派</span>
            </div>
            <div v-if="order.assignHistory && order.assignHistory.length > 1" class="history-section">
              <div class="history-title">指派记录</div>
              <div class="timeline">
                <div
                  v-for="(record, idx) in [...order.assignHistory].reverse()"
                  :key="idx"
                  class="timeline-item"
                >
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <span class="action-tag" :class="record.action === '初次指派' ? 'first' : 'change'">
                      {{ record.action }}
                    </span>
                    <span class="staff-name">{{ record.name }}</span>
                    <span class="staff-phone">{{ record.phone }}</span>
                    <span class="record-time">{{ record.assignTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-if="order.status === 'escalated_to_hq' && order.escalateReason">
        <div class="divider"></div>
        <div class="info-section escalate-info">
          <div class="section-title">
            <el-icon><Warning /></el-icon>
            <span>上报原因</span>
          </div>
          <div class="escalate-reason-box">
            {{ order.escalateReason }}
          </div>
        </div>
      </template>

      <template v-if="order.status === 'rejected' && order.rejectReason">
        <div class="divider"></div>
        <div class="info-section reject-info">
          <div class="section-title">
            <el-icon><Warning /></el-icon>
            <span>拒单原因</span>
          </div>
          <div class="reject-reason-box">
            {{ order.rejectReason }}
          </div>
        </div>
      </template>
    </div>

    <div class="card-footer">
      <div class="amount-section">
        <span class="amount-label">订单金额</span>
        <span class="amount-value">¥{{ order.amount.toFixed(2) }}</span>
      </div>
      <div class="action-buttons">
        <el-button
          v-if="role === 'store' && order.status === 'pending_accept'"
          type="info"
          size="small"
          plain
          @click="$emit('reject', order)"
        >
          拒单
        </el-button>
        <el-button
          v-if="role === 'store' && order.status === 'pending_accept'"
          type="danger"
          size="small"
          plain
          @click="$emit('escalate', order)"
        >
          <el-icon><Phone /></el-icon>
          联系总部
        </el-button>
        <el-button
          v-if="role === 'store' && order.status === 'pending_accept'"
          type="success"
          size="small"
          @click="$emit('accept', order)"
        >
          接单
        </el-button>
        <el-button
          v-if="role === 'store' && order.status === 'pending_assign'"
          type="primary"
          size="small"
          @click="$emit('assign', order)"
        >
          <el-icon><UserFilled /></el-icon>
          指派员工
        </el-button>
        <el-button
          v-if="(role === 'store' || role === 'employee') && order.status === 'pending_deliver'"
          type="warning"
          size="small"
          @click="$emit('deliver', order)"
        >
          发货
        </el-button>
        <el-button
          v-if="(role === 'store' || role === 'employee') && order.status === 'pending_return'"
          type="danger"
          size="small"
          @click="$emit('return', order)"
        >
          退租
        </el-button>
        <el-button
          v-if="role === 'hq' && order.status === 'escalated_to_hq'"
          type="primary"
          size="small"
          @click="$emit('hqReassign', order)"
        >
          <el-icon><Promotion /></el-icon>
          重新分配
        </el-button>
        <el-button
          v-if="role === 'hq' && order.status === 'escalated_to_hq'"
          type="danger"
          size="small"
          plain
          @click="$emit('hqCancel', order)"
        >
          <el-icon><Delete /></el-icon>
          取消订单
        </el-button>
        <el-button size="small" @click="$emit('logs', order)">
          日志
        </el-button>
        <el-button size="small" @click="$emit('view', order)">
          详情
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  Tickets, User, Goods, Box, Calendar, Van, OfficeBuilding,
  Avatar, RefreshRight, Warning, Phone, UserFilled, Promotion, Delete
} from '@element-plus/icons-vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  role: {
    type: String,
    default: 'store'
  },
  storeInfo: {
    type: Object,
    default: null
  }
});

defineEmits([
  'accept', 'reject', 'assign', 'deliver', 'return', 'view', 'logs',
  'escalate', 'changeStaff', 'hqReassign', 'hqCancel'
]);

const canChangeStaff = computed(() => {
  if (props.role !== 'store') return false;
  return ['pending_deliver', 'renting', 'pending_return'].includes(props.order.status);
});
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

.order-card.status-escalated_to_hq {
  background: linear-gradient(180deg, #fff5f9 0%, #ffffff 30%);
}

.order-card.status-escalated_to_hq:hover {
  border-color: #eb2f96;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f7fa 100%);
  border-bottom: 1px solid #ebeef5;
  gap: 10px;
}

.header-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}

.store-tag-mini {
  display: inline-flex;
  align-items: center;
  gap: 3px;
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
  flex-wrap: wrap;
}

.section-title .el-icon {
  color: #667eea;
  font-size: 16px;
}

.current-staff-tag {
  margin-left: 4px;
}

.change-btn {
  margin-left: auto;
  font-weight: 500;
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

.current-staff {
  background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%);
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #d1fae5;
}

.no-staff-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 14px;
  background: #fffbe6;
  color: #d48806;
  border-radius: 8px;
  border: 1px solid #ffe58f;
  font-size: 13px;
}

.history-section {
  margin-top: 14px;
}

.history-title {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timeline {
  padding-left: 8px;
  border-left: 2px solid #f0f2f5;
}

.timeline-item {
  position: relative;
  padding: 0 0 12px 16px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -7px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #667eea;
}

.timeline-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.action-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.action-tag.first {
  background: #ecfdf5;
  color: #059669;
}

.action-tag.change {
  background: #eff6ff;
  color: #2563eb;
}

.staff-name {
  font-weight: 600;
  color: #303133;
}

.staff-phone {
  color: #606266;
}

.record-time {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

.escalate-reason-box {
  padding: 12px 14px;
  background: linear-gradient(135deg, #fdf2f8 0%, #fff1f2 100%);
  border: 1px solid #fbcfe8;
  border-radius: 8px;
  color: #9d174d;
  font-size: 13px;
  line-height: 1.6;
}

.reject-reason-box {
  padding: 12px 14px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}

.order-card.status-rejected {
  background: linear-gradient(180deg, #f9fafb 0%, #ffffff 30%);
}

.order-card.status-rejected:hover {
  border-color: #6b7280;
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

  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-tags {
    justify-content: flex-start;
  }
}
</style>
