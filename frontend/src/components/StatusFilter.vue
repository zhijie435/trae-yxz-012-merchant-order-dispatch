<template>
  <div class="status-filter">
    <div class="filter-tabs" ref="tabsRef">
      <div
        v-for="item in statusList"
        :key="item.key"
        :ref="el => setTabRef(item.key, el)"
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
import { ref, onMounted, watch, nextTick } from 'vue';
import { getStatusConfig, getOrderStatistics } from '../api/order.js';

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all'
  },
  role: {
    type: String,
    default: 'store'
  },
  employeeId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const statusList = ref([]);
const statistics = ref({});
const currentStatus = ref(props.modelValue);
const tabsRef = ref(null);
const tabRefs = ref({});

const setTabRef = (key, el) => {
  if (el) {
    tabRefs.value[key] = el;
  }
};

const scrollToActiveTab = () => {
  const activeTab = tabRefs.value[currentStatus.value];
  const tabsContainer = tabsRef.value;
  if (activeTab && tabsContainer) {
    const tabRect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    if (tabRect.right > containerRect.right || tabRect.left < containerRect.left) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }
};

watch(() => props.modelValue, (newVal) => {
  currentStatus.value = newVal;
  nextTick(scrollToActiveTab);
});

watch(() => props.role, () => {
  loadStatusConfig();
});

const loadStatusConfig = async () => {
  try {
    statusList.value = await getStatusConfig('all', props.role);
  } catch (error) {
    console.error('加载状态配置失败:', error);
    const baseList = [
      { key: 'all', label: '全部' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'pending_assign', label: '待指派' },
      { key: 'pending_deliver', label: '待交付' },
      { key: 'renting', label: '租赁中' },
      { key: 'pending_return', label: '待退租' }
    ];
    if (props.role === 'hq') {
      baseList.splice(2, 0, { key: 'escalated_to_hq', label: '待总部处理' });
    }
    baseList.push({ key: 'cancelled', label: '已取消' });
    statusList.value = baseList;
  }
};

const loadStatistics = async () => {
  try {
    statistics.value = await getOrderStatistics(props.employeeId);
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

const handleStatusChange = (status) => {
  if (currentStatus.value !== status) {
    currentStatus.value = status;
    emit('update:modelValue', status);
    emit('change', status);
    nextTick(scrollToActiveTab);
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
  padding: 0 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-tabs {
  display: flex;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  white-space: nowrap;
  font-weight: 500;
  color: #606266;
  flex-shrink: 0;
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
  color: #667eea;
  background: #f8f9ff;
}

.filter-tab.active {
  color: #667eea;
}

.filter-tab.active::after {
  width: calc(100% - 32px);
}

.tab-label {
  font-size: 14px;
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
  font-weight: 500;
}

.filter-tab.active .tab-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

@media (min-width: 768px) {
  .status-filter {
    padding: 0 12px;
  }

  .filter-tabs {
    gap: 4px;
  }

  .filter-tab {
    padding: 16px 18px;
    gap: 8px;
  }

  .tab-label {
    font-size: 15px;
  }

  .tab-count {
    min-width: 22px;
    height: 22px;
    padding: 0 7px;
    font-size: 12px;
  }

  .filter-tab.active::after {
    width: calc(100% - 36px);
  }
}

@media (min-width: 1200px) {
  .status-filter {
    padding: 0 16px;
  }

  .filter-tab {
    padding: 16px 22px;
  }

  .filter-tab.active::after {
    width: calc(100% - 44px);
  }
}
</style>
