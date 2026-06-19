<template>
  <div class="status-filter">
    <div class="filter-tabs">
      <div
        v-for="item in statusList"
        :key="item.key"
        class="filter-tab"
        :class="{ active: currentStatus === item.key }"
        @click="handleStatusChange(item.key)"
      >
        <span class="tab-label">{{ item.label }}</span>
        <span class="tab-count" v-if="statistics[item.key] !== undefined">
          {{ statistics[item.key] }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStatusConfig, getOrderStatistics } from '../api/order.js';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const statusList = ref([]);
const statistics = ref({});
const currentStatus = ref(props.modelValue);

const loadStatusConfig = async () => {
  try {
    statusList.value = await getStatusConfig();
  } catch (error) {
    console.error('加载状态配置失败:', error);
    statusList.value = [
      { key: 'all', label: '全部' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'pending_assign', label: '待指派' },
      { key: 'pending_deliver', label: '待交付' },
      { key: 'renting', label: '租赁中' },
      { key: 'pending_return', label: '待退租' }
    ];
  }
};

const loadStatistics = async () => {
  try {
    statistics.value = await getOrderStatistics();
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

const handleStatusChange = (status) => {
  if (currentStatus.value !== status) {
    currentStatus.value = status;
    emit('update:modelValue', status);
    emit('change', status);
  }
};

onMounted(() => {
  loadStatusConfig();
  loadStatistics();
});

defineExpose({
  refreshStatistics: loadStatistics
});
</script>

<style scoped>
.status-filter {
  background: #ffffff;
  border-radius: 8px;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px 3px 0 0;
  transition: width 0.3s ease;
}

.filter-tab:hover {
  background: #f5f7fa;
}

.filter-tab.active {
  color: #667eea;
}

.filter-tab.active::after {
  width: calc(100% - 40px);
}

.tab-label {
  font-size: 15px;
  font-weight: 500;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 1;
  background: #f0f2f5;
  color: #606266;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.filter-tab.active .tab-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
</style>
