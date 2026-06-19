<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">订单管理系统</h1>
        <span class="app-subtitle">门店端订单接单指派</span>
      </div>
    </header>
    <main class="app-main">
      <OrderList />
    </main>
  </div>
</template>

<script setup>
import OrderList from './components/OrderList.vue';
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
  padding: 24px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.app-subtitle {
  font-size: 14px;
  opacity: 0.85;
  margin-left: 16px;
}

.app-main {
  flex: 1;
  padding: 24px 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}
</style>
