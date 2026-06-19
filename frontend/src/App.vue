<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">订单管理系统</h1>
          <span class="app-subtitle">
            {{ currentRole === 'hq' ? '总部端 - 订单调度中心' : currentRole === 'employee' ? '员工端 - 我的任务' : '门店端 - 订单接单指派' }}
          </span>
          <span v-if="currentStore && currentRole === 'store'" class="store-tag">
            <el-icon><OfficeBuilding /></el-icon>
            {{ currentStore.name }}
          </span>
          <span v-if="currentEmployee && currentRole === 'employee'" class="store-tag">
            <el-icon><Avatar /></el-icon>
            {{ currentEmployee.name }} · {{ currentEmployee.storeName }}
          </span>
        </div>
        <div class="header-right">
          <el-radio-group v-model="currentRole" size="default" class="role-toggle" @change="handleRoleChange">
            <el-radio-button label="store">
              <el-icon><Shop /></el-icon>
              <span class="toggle-text">门店端</span>
            </el-radio-button>
            <el-radio-button label="employee">
              <el-icon><Avatar /></el-icon>
              <span class="toggle-text">员工端</span>
            </el-radio-button>
            <el-radio-button label="hq">
              <el-icon><Aim /></el-icon>
              <span class="toggle-text">总部端</span>
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </header>
    <main class="app-main">
      <OrderList :role="currentRole" :currentStore="currentStore" :currentEmployee="currentEmployee" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { OfficeBuilding, Shop, Aim, Avatar } from '@element-plus/icons-vue';
import OrderList from './components/OrderList.vue';
import { getCurrentStore, getCurrentEmployee } from './api/order.js';

const currentRole = ref('store');
const currentStore = ref(null);
const currentEmployee = ref(null);

const loadCurrentStore = async () => {
  try {
    currentStore.value = await getCurrentStore();
  } catch (e) {
    console.error('获取门店信息失败', e);
  }
};

const loadCurrentEmployee = async () => {
  try {
    currentEmployee.value = await getCurrentEmployee();
  } catch (e) {
    console.error('获取员工信息失败', e);
  }
};

const handleRoleChange = () => {
};

onMounted(() => {
  loadCurrentStore();
  loadCurrentEmployee();
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.app-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
}

.app-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-left: 12px;
}

.store-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 16px;
  background: rgba(255, 255, 255, 0.18);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  backdrop-filter: blur(6px);
}

.role-toggle :deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  color: rgba(255, 255, 255, 0.85);
  box-shadow: none;
}

.role-toggle :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #ffffff;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.role-toggle :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px 0 0 8px;
}

.role-toggle :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0;
}

.toggle-text {
  font-size: 13px;
  font-weight: 500;
}

.app-main {
  flex: 1;
  padding: 24px 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-header {
    padding: 16px 20px;
  }
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  .app-main {
    padding: 16px 20px;
  }
  .toggle-text {
    display: none;
  }
  .app-subtitle {
    margin-left: 0;
    display: block;
  }
  .store-tag {
    margin-left: 0;
  }
}
</style>
