<template>
  <div class="order-list-container">
    <StatusFilter
      v-model="currentStatus"
      :role="role"
      @change="handleStatusChange"
      ref="statusFilterRef"
    />

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
              <el-table-column label="负责人" width="120">
                <template #default="{ row }">
                  <span v-if="row.assignedEmployee" class="staff-badge">
                    <el-icon><UserFilled /></el-icon>
                    {{ row.assignedEmployee.name }}
                  </span>
                  <span v-else class="no-staff">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="statusLabel" label="订单状态" width="120">
                <template #default="{ row }">
                  <el-tag :color="row.statusColor" effect="light" size="small">
                    {{ row.statusLabel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="280" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <template v-if="row.orderType === 'rent'">
                      <el-button
                        v-if="role === 'store' && row.status === 'pending_accept'"
                        type="danger"
                        size="small"
                        plain
                        @click="handleEscalate(row)"
                      >
                        联系总部
                      </el-button>
                      <el-button
                        v-if="role === 'store' && row.status === 'pending_accept'"
                        type="success"
                        size="small"
                        @click="handleAccept(row)"
                      >
                        接单
                      </el-button>
                      <el-button
                        v-if="role === 'store' && row.status === 'pending_assign'"
                        type="primary"
                        size="small"
                        @click="handleAssign(row)"
                      >
                        指派
                      </el-button>
                      <el-button
                        v-if="role === 'store' && ['pending_deliver','renting','pending_return'].includes(row.status)"
                        size="small"
                        @click="handleChangeStaff(row)"
                      >
                        换员工
                      </el-button>
                      <el-button
                        v-if="role === 'store' && row.status === 'pending_deliver'"
                        type="warning"
                        size="small"
                        @click="handleDeliver(row)"
                      >
                        发货
                      </el-button>
                      <el-button
                        v-if="role === 'store' && row.status === 'pending_return'"
                        type="danger"
                        size="small"
                        @click="handleReturn(row)"
                      >
                        退租
                      </el-button>
                      <el-button
                        v-if="role === 'hq' && row.status === 'escalated_to_hq'"
                        type="primary"
                        size="small"
                        @click="handleHqReassign(row)"
                      >
                        重新分配
                      </el-button>
                      <el-button
                        v-if="role === 'hq' && row.status === 'escalated_to_hq'"
                        type="danger"
                        size="small"
                        plain
                        @click="handleHqCancel(row)"
                      >
                        取消
                      </el-button>
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
                :role="role"
                :store-info="getStoreInfo(order.storeId)"
                @accept="handleAccept"
                @assign="handleAssign"
                @deliver="handleDeliver"
                @return="handleReturn"
                @view="handleViewDetail"
                @escalate="handleEscalate"
                @changeStaff="handleChangeStaff"
                @hqReassign="handleHqReassign"
                @hqCancel="handleHqCancel"
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

    <!-- 联系总部对话框 -->
    <el-dialog
      v-model="escalateDialogVisible"
      title="联系总部协助"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="order-preview">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="订单号">{{ currentOrder?.id }}</el-descriptions-item>
            <el-descriptions-item label="商品">{{ currentOrder?.product }}</el-descriptions-item>
            <el-descriptions-item label="客户">{{ currentOrder?.customerName }} · {{ currentOrder?.phone }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <el-form :model="escalateForm" label-width="90px" class="mt-20">
          <el-form-item label="上报原因" required>
            <el-input
              v-model="escalateForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请说明无法承接的原因，总部将根据情况安排其他门店或与客户沟通取消"
            />
          </el-form-item>
        </el-form>
        <div class="preset-reasons">
          <span class="preset-label">快捷选择：</span>
          <el-tag
            v-for="reason in presetEscalateReasons"
            :key="reason"
            class="preset-tag"
            effect="plain"
            @click="escalateForm.reason = reason"
          >
            {{ reason }}
          </el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="escalateDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="escalateLoading" :disabled="!escalateForm.reason.trim()" @click="confirmEscalate">
          确认提交总部
        </el-button>
      </template>
    </el-dialog>

    <!-- 指派员工对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      :title="assignDialogTitle"
      width="620px"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="order-preview">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="订单号">{{ currentOrder?.id }}</el-descriptions-item>
            <el-descriptions-item label="交付时间">{{ currentOrder?.deliverTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="商品" :span="2">{{ currentOrder?.product }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ currentOrder?.address }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div v-if="currentOrder?.assignedEmployee && assignMode === 'change'" class="current-staff-notice">
          <el-icon><WarningFilled /></el-icon>
          <span>当前负责人：</span>
          <strong>{{ currentOrder.assignedEmployee.name }}</strong>
          <span class="staff-phone-text">{{ currentOrder.assignedEmployee.phone }}</span>
          <span>（{{ currentOrder.assignedEmployee.assignTime }} 指派）</span>
        </div>
        <div class="staff-select-section">
          <div class="section-subtitle">
            <el-icon><User /></el-icon>
            选择员工（{{ employeeList.length }}人）
          </div>
          <div v-loading="employeeLoading" class="employee-grid">
            <div
              v-for="emp in employeeList"
              :key="emp.id"
              class="employee-card"
              :class="{
                selected: selectedEmployeeId === emp.id,
                disabled: emp.status !== 'available',
                current: currentOrder?.assignedEmployee?.id === emp.id
              }"
              @click="selectEmployee(emp)"
            >
              <div class="emp-avatar" :class="`status-${emp.status}`">
                {{ emp.name.charAt(0) }}
              </div>
              <div class="emp-info">
                <div class="emp-name">
                  {{ emp.name }}
                  <el-tag
                    v-if="emp.status === 'available'"
                    size="small"
                    type="success"
                    effect="light"
                    class="emp-status-tag"
                  >空闲</el-tag>
                  <el-tag
                    v-else-if="emp.status === 'busy'"
                    size="small"
                    type="warning"
                    effect="light"
                    class="emp-status-tag"
                  >忙碌</el-tag>
                  <el-tag
                    v-else
                    size="small"
                    type="info"
                    effect="light"
                    class="emp-status-tag"
                  >休假</el-tag>
                  <el-tag
                    v-if="currentOrder?.assignedEmployee?.id === emp.id"
                    size="small"
                    type="primary"
                    effect="dark"
                    class="emp-status-tag"
                  >当前</el-tag>
                </div>
                <div class="emp-phone">{{ emp.phone }}</div>
                <div class="emp-role">{{ emp.role }}</div>
              </div>
              <el-icon v-if="selectedEmployeeId === emp.id" class="check-icon"><CircleCheckFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="assignLoading"
          :disabled="!selectedEmployeeId"
          @click="confirmAssign"
        >
          确认{{ assignMode === 'change' ? '更换' : '指派' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 总部重新分配对话框 -->
    <el-dialog
      v-model="hqReassignDialogVisible"
      title="总部调度 - 重新分配门店"
      width="580px"
      :close-on-click-modal="false"
    >
      <div class="dialog-form">
        <div class="order-preview">
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="订单号">{{ currentOrder?.id }}</el-descriptions-item>
            <el-descriptions-item label="上报原因">
              <span class="escalate-text">{{ currentOrder?.escalateReason }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="原门店">
              {{ getStoreInfo(currentOrder?.storeId)?.name || currentOrder?.storeId }}
            </el-descriptions-item>
            <el-descriptions-item label="客户">{{ currentOrder?.customerName }} · {{ currentOrder?.phone }}</el-descriptions-item>
            <el-descriptions-item label="商品">{{ currentOrder?.product }} x{{ currentOrder?.quantity }}</el-descriptions-item>
            <el-descriptions-item label="地址">{{ currentOrder?.address }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <div class="store-select-section">
          <div class="section-subtitle">
            <el-icon><OfficeBuilding /></el-icon>
            选择目标门店
          </div>
          <div v-loading="storeLoading" class="store-list">
            <div
              v-for="store in storeList"
              :key="store.id"
              class="store-card"
              :class="{
                selected: selectedStoreId === store.id,
                current: store.id === currentOrder?.storeId
              }"
              @click="selectedStoreId = store.id"
            >
              <div class="store-main">
                <div class="store-name">
                  {{ store.name }}
                  <el-tag
                    v-if="store.id === currentOrder?.storeId"
                    size="small"
                    type="warning"
                    effect="light"
                    class="store-tag-item"
                  >原门店</el-tag>
                </div>
                <div class="store-meta">
                  <span class="meta-item">负责人：{{ store.contact }}</span>
                  <span class="meta-item">{{ store.phone }}</span>
                </div>
              </div>
              <el-icon v-if="selectedStoreId === store.id" class="check-icon"><CircleCheckFilled /></el-icon>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="hqReassignDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="hqReassignLoading"
          :disabled="!selectedStoreId"
          @click="confirmHqReassign"
        >
          分配至此门店
        </el-button>
      </template>
    </el-dialog>

    <!-- 取消订单对话框 -->
    <el-dialog
      v-model="cancelDialogVisible"
      title="取消订单确认"
      width="460px"
      :close-on-click-modal="false"
    >
      <div class="cancel-warning">
        <el-icon class="warning-icon"><WarningFilled /></el-icon>
        <div class="warning-content">
          <div class="warning-title">确认取消该订单？</div>
          <div class="warning-desc">订单号：{{ currentOrder?.id }}</div>
          <div class="warning-desc">取消后状态将变为"已取消"，无法恢复</div>
        </div>
      </div>
      <el-form :model="cancelForm" label-width="90px" class="mt-20">
        <el-form-item label="取消原因" required>
          <el-input
            v-model="cancelForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入取消原因，便于后续统计与沟通"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="cancelDialogVisible = false">返回</el-button>
        <el-button type="danger" :loading="cancelLoading" @click="confirmCancel">
          确认取消订单
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search, Refresh, List, Grid, User, UserFilled, OfficeBuilding,
  WarningFilled, CircleCheckFilled
} from '@element-plus/icons-vue';
import StatusFilter from './StatusFilter.vue';
import OrderCard from './OrderCard.vue';
import SalesOrderCard from './SalesOrderCard.vue';
import {
  getOrderList,
  getEmployees,
  getStores,
  acceptOrder,
  escalateOrderToHq,
  assignStaff,
  hqReassignStore,
  cancelOrder,
  deliverOrder,
  returnOrder
} from '../api/order.js';

const props = defineProps({
  role: {
    type: String,
    default: 'store'
  },
  currentStore: {
    type: Object,
    default: null
  }
});

const currentStatus = ref('all');
const orderType = ref('all');
const searchKeyword = ref('');
const loading = ref(false);
const orders = ref([]);
const storeList = ref([]);
const storeLoading = ref(false);
const statusFilterRef = ref(null);
const viewMode = ref('card');

const currentOrder = ref(null);

const escalateDialogVisible = ref(false);
const escalateLoading = ref(false);
const escalateForm = ref({ reason: '' });
const presetEscalateReasons = [
  '本门店人力不足，无法承接',
  '配送范围超出本门店能力',
  '设备库存不足，无法满足',
  '交付时间冲突，无法安排',
  '特殊安装需求，本门店不具备条件'
];

const assignDialogVisible = ref(false);
const assignLoading = ref(false);
const assignMode = ref('assign');
const employeeList = ref([]);
const employeeLoading = ref(false);
const selectedEmployeeId = ref('');

const hqReassignDialogVisible = ref(false);
const hqReassignLoading = ref(false);
const selectedStoreId = ref('');

const cancelDialogVisible = ref(false);
const cancelLoading = ref(false);
const cancelForm = ref({ reason: '' });

const assignDialogTitle = computed(() =>
  assignMode.value === 'change' ? '更换负责员工' : '指派员工'
);

const storeMap = computed(() => {
  const map = {};
  storeList.value.forEach(s => { map[s.id] = s; });
  return map;
});

const getStoreInfo = (storeId) => {
  if (!storeId) return null;
  if (storeMap.value[storeId]) return storeMap.value[storeId];
  if (props.currentStore && props.currentStore.id === storeId) return props.currentStore;
  return null;
};

const filteredOrders = computed(() => {
  let list = orders.value;
  if (!searchKeyword.value) return list;
  const keyword = searchKeyword.value.toLowerCase();
  return list.filter(order =>
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

const loadStores = async () => {
  storeLoading.value = true;
  try {
    storeList.value = await getStores();
  } catch (e) {
    console.error('加载门店列表失败', e);
  } finally {
    storeLoading.value = false;
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

watch(() => props.role, () => {
  currentStatus.value = 'all';
  loadOrderList();
});

const handleAccept = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认接单：${row.id}？接单后将进入"待指派"状态，需要尽快指派员工。`,
      '接单确认',
      { confirmButtonText: '确认接单', cancelButtonText: '取消', type: 'success' }
    );
    await acceptOrder(row.id);
    ElMessage.success(`已接单：${row.id}`);
    refreshOrderList();
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

const handleEscalate = (row) => {
  currentOrder.value = row;
  escalateForm.value = { reason: '' };
  escalateDialogVisible.value = true;
};

const confirmEscalate = async () => {
  if (!escalateForm.value.reason.trim()) {
    ElMessage.warning('请填写上报原因');
    return;
  }
  escalateLoading.value = true;
  try {
    await escalateOrderToHq(currentOrder.value.id, escalateForm.value.reason.trim());
    ElMessage.success('已提交总部处理，请耐心等待调度');
    escalateDialogVisible.value = false;
    refreshOrderList();
  } catch (e) {
    ElMessage.error(e.message || '提交失败');
  } finally {
    escalateLoading.value = false;
  }
};

const openAssignDialog = async (row, mode = 'assign') => {
  currentOrder.value = row;
  assignMode.value = mode;
  selectedEmployeeId.value = '';
  assignDialogVisible.value = true;
  employeeLoading.value = true;
  employeeList.value = [];
  try {
    const storeId = row.storeId || (props.currentStore && props.currentStore.id);
    employeeList.value = await getEmployees(storeId);
    if (mode === 'change' && row.assignedEmployee) {
      selectedEmployeeId.value = '';
    }
  } catch (e) {
    console.error('加载员工列表失败', e);
    ElMessage.error('加载员工列表失败');
  } finally {
    employeeLoading.value = false;
  }
};

const handleAssign = (row) => {
  openAssignDialog(row, 'assign');
};

const handleChangeStaff = (row) => {
  openAssignDialog(row, 'change');
};

const selectEmployee = (emp) => {
  if (emp.status !== 'available' && currentOrder.value?.assignedEmployee?.id !== emp.id) {
    return;
  }
  selectedEmployeeId.value = emp.id;
};

const confirmAssign = async () => {
  const emp = employeeList.value.find(e => e.id === selectedEmployeeId.value);
  if (!emp) {
    ElMessage.warning('请选择员工');
    return;
  }
  assignLoading.value = true;
  try {
    await assignStaff(currentOrder.value.id, emp);
    ElMessage.success(assignMode.value === 'change' ? `已更换为：${emp.name}` : `已指派：${emp.name}`);
    assignDialogVisible.value = false;
    refreshOrderList();
  } catch (e) {
    ElMessage.error(e.message || '操作失败');
  } finally {
    assignLoading.value = false;
  }
};

const handleHqReassign = async (row) => {
  currentOrder.value = row;
  selectedStoreId.value = '';
  if (!storeList.value.length) {
    await loadStores();
  }
  hqReassignDialogVisible.value = true;
};

const confirmHqReassign = async () => {
  if (!selectedStoreId.value) {
    ElMessage.warning('请选择目标门店');
    return;
  }
  hqReassignLoading.value = true;
  try {
    await hqReassignStore(currentOrder.value.id, selectedStoreId.value);
    const storeName = storeMap.value[selectedStoreId.value]?.name || selectedStoreId.value;
    ElMessage.success(`已重新分配至：${storeName}`);
    hqReassignDialogVisible.value = false;
    refreshOrderList();
  } catch (e) {
    ElMessage.error(e.message || '分配失败');
  } finally {
    hqReassignLoading.value = false;
  }
};

const handleHqCancel = (row) => {
  currentOrder.value = row;
  cancelForm.value = { reason: '' };
  cancelDialogVisible.value = true;
};

const confirmCancel = async () => {
  if (!cancelForm.value.reason.trim()) {
    ElMessage.warning('请填写取消原因');
    return;
  }
  cancelLoading.value = true;
  try {
    await cancelOrder(currentOrder.value.id, cancelForm.value.reason.trim());
    ElMessage.success('订单已取消');
    cancelDialogVisible.value = false;
    refreshOrderList();
  } catch (e) {
    ElMessage.error(e.message || '取消失败');
  } finally {
    cancelLoading.value = false;
  }
};

const handleDeliver = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认发货：${row.id}？发货后订单将进入"租赁中"状态。`,
      '发货确认',
      { confirmButtonText: '确认发货', cancelButtonText: '取消', type: 'warning' }
    );
    await deliverOrder(row.id);
    ElMessage.success(`已发货：${row.id}`);
    refreshOrderList();
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
};

const handleReturn = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认退租完成：${row.id}？确认后订单将完结。`,
      '退租确认',
      { confirmButtonText: '确认退租', cancelButtonText: '取消', type: 'danger' }
    );
    await returnOrder(row.id);
    ElMessage.success(`已处理退租：${row.id}`);
    refreshOrderList();
  } catch (e) {
    if (e !== 'cancel') console.error(e);
  }
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
  loadStores();
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
  flex-wrap: wrap;
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

.staff-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2563eb;
  font-weight: 500;
}

.no-staff {
  color: #909399;
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
  gap: 6px;
  flex-wrap: wrap;
}

.mt-20 {
  margin-top: 20px;
}

.dialog-form {
  padding: 8px 4px;
}

.order-preview {
  background: #fafbfc;
  border-radius: 8px;
  padding: 4px;
}

.section-subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 12px;
}

.section-subtitle .el-icon {
  color: #667eea;
}

.preset-reasons {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.preset-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f0f3ff;
}

.current-staff-notice {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  padding: 12px 14px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  font-size: 13px;
  color: #613400;
}

.current-staff-notice .el-icon {
  color: #fa8c16;
  font-size: 16px;
}

.staff-phone-text {
  color: #92400e;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  min-height: 100px;
}

.employee-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 2px solid #f0f2f5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: #ffffff;
}

.employee-card:hover:not(.disabled) {
  border-color: #c7d2fe;
  background: #f8faff;
}

.employee-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f3ff 0%, #f5f0ff 100%);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.12);
}

.employee-card.current {
  border-color: #fbbf24;
}

.employee-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background: #fafafa;
}

.emp-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.emp-avatar.status-available {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.emp-avatar.status-busy {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.emp-avatar.status-on_leave {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.emp-info {
  flex: 1;
  min-width: 0;
}

.emp-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.emp-status-tag {
  font-size: 10px;
  padding: 1px 7px;
  height: auto;
  line-height: 1.6;
}

.emp-phone {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.emp-role {
  font-size: 12px;
  color: #9ca3af;
}

.check-icon {
  color: #667eea;
  font-size: 22px;
  flex-shrink: 0;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 100px;
}

.store-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #f0f2f5;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #ffffff;
  position: relative;
}

.store-card:hover {
  border-color: #c7d2fe;
  background: #f8faff;
}

.store-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f3ff 0%, #f5f0ff 100%);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.12);
}

.store-card.current {
  border-color: #fbbf24;
}

.store-main {
  flex: 1;
  min-width: 0;
}

.store-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.store-tag-item {
  font-size: 10px;
  padding: 1px 8px;
  height: auto;
  line-height: 1.7;
}

.store-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 13px;
  color: #6b7280;
}

.escalate-text {
  color: #9d174d;
  font-weight: 500;
}

.cancel-warning {
  display: flex;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%);
  border: 1px solid #fecaca;
  border-radius: 10px;
  align-items: flex-start;
}

.warning-icon {
  color: #ef4444;
  font-size: 28px;
  flex-shrink: 0;
  margin-top: 2px;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 16px;
  font-weight: 700;
  color: #b91c1c;
  margin-bottom: 6px;
}

.warning-desc {
  font-size: 13px;
  color: #7f1d1d;
  line-height: 1.6;
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

  .employee-grid {
    grid-template-columns: 1fr;
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
