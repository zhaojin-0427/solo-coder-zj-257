<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="sidebar">
      <div class="logo">
        <el-icon :size="28"><Tools /></el-icon>
        <span>木匠工坊</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#5a3a1f"
        text-color="#e8dcc8"
        active-text-color="#ffd591"
        class="menu"
      >
        <el-menu-item index="/orders">
          <el-icon><Tickets /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/materials">
          <el-icon><Box /></el-icon>
          <span>用料核算</span>
        </el-menu-item>
        <el-menu-item index="/tenons">
          <el-icon><Grid /></el-icon>
          <span>榫卯图库</span>
        </el-menu-item>
        <el-menu-item index="/crafts">
          <el-icon><Document /></el-icon>
          <span>工艺档案</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>统计分析</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="header-title">传统木匠工坊 · 订单与榫卯工艺管理系统</div>
        <div class="header-user">
          <el-avatar :size="32" style="background: #8b5a2b">木</el-avatar>
          <span>木匠大师</span>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeMenu = computed(() => {
  if (route.path.startsWith('/orders')) return '/orders';
  if (route.path.startsWith('/crafts')) return '/crafts';
  return route.path;
});
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.sidebar {
  background: #5a3a1f;
  border-right: 1px solid #3d2914;
}
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #ffd591;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 1px solid #3d2914;
  letter-spacing: 2px;
}
.menu {
  border: none;
}
.menu :deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  font-size: 15px;
}
.menu :deep(.el-menu-item.is-active) {
  background: #3d2914 !important;
}
.menu :deep(.el-menu-item:hover) {
  background: #4a2e17 !important;
}
.header {
  background: linear-gradient(90deg, #8b5a2b 0%, #6b4226 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 2px solid #3d2914;
  height: 60px;
}
.header-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 2px;
}
.header-user {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.main-content {
  padding: 0;
  background: #f5f1ea;
  overflow: auto;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
