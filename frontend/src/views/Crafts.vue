<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">工艺档案</h2>
      <el-button type="primary" class="wood-btn">
        <el-icon><Plus /></el-icon>新增档案
      </el-button>
    </div>

    <div class="craft-list">
      <div
        v-for="item in archives"
        :key="item.id"
        class="craft-card wood-card"
        @click="$router.push(`/crafts/${item.id}`)"
      >
        <div class="craft-header">
          <div>
            <h3 class="craft-title">{{ item.title }}</h3>
            <div class="craft-meta">
              <span>{{ item.author }}</span>
              <span>·</span>
              <span>{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>
          <el-tag :type="diffType(item.difficulty)">{{ diffLabel(item.difficulty) }}</el-tag>
        </div>
        <p class="craft-excerpt">{{ excerpt(item.content) }}</p>
        <div class="craft-footer">
          <div class="tags">
            <el-tag v-for="t in item.tags" :key="t" size="small" type="info" effect="plain">
              {{ t }}
            </el-tag>
          </div>
          <div class="wood-info">
            <el-icon><Coin /></el-icon> {{ item.woodType }}
          </div>
        </div>
      </div>
    </div>

    <el-empty v-if="!archives.length" description="暂无工艺档案" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, Coin } from '@element-plus/icons-vue';
import { craftApi } from '@/api';

const archives = ref<any[]>([]);

const fetchData = async () => {
  archives.value = await craftApi.list();
};

const diffLabel = (d: string) => ({
  low: '入门',
  medium: '普通',
  high: '困难',
  master: '大师级',
}[d] || d);

const diffType = (d: string) => ({
  low: 'success',
  medium: '',
  high: 'warning',
  master: 'danger',
}[d] || '');

const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-CN');

const excerpt = (content: string) => {
  const text = content.replace(/\n/g, ' ');
  return text.length > 120 ? text.slice(0, 120) + '...' : text;
};

onMounted(fetchData);
</script>

<style scoped>
.craft-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}
.craft-card {
  cursor: pointer;
  transition: all 0.3s;
}
.craft-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 90, 43, 0.15);
}
.craft-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.craft-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.craft-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 6px;
}
.craft-excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 16px;
  min-height: 48px;
}
.craft-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px dashed var(--border-wood);
}
.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.wood-info {
  font-size: 13px;
  color: var(--primary-wood);
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
