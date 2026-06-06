<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">榫卯图库</h2>
      <div>
        <el-select v-model="typeFilter" placeholder="按类型筛选" clearable style="width: 160px">
          <el-option v-for="t in tenonTypes" :key="t" :label="t" :value="t" />
        </el-select>
      </div>
    </div>

    <div class="tenon-grid">
      <div
        v-for="item in filteredTenons"
        :key="item.id"
        class="tenon-card wood-card"
        @click="showDetail(item)"
      >
        <div class="tenon-image">
          <img :src="item.diagramPlaceholder" :alt="item.name" />
          <el-tag class="diff-tag" :type="diffType(item.difficulty)" size="small">
            {{ diffLabel(item.difficulty) }}
          </el-tag>
        </div>
        <div class="tenon-info">
          <div class="tenon-type">{{ item.type }}</div>
          <h3 class="tenon-name">{{ item.name }}</h3>
          <p class="tenon-desc">{{ item.description }}</p>
          <div class="tenon-meta">
            <span><el-icon><Histogram /></el-icon> 使用 {{ item.usageCount }} 次</span>
            <span v-if="item.orderNo" style="color: #8b5a2b">{{ item.orderNo }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="detailVisible" :title="current?.name" width="600px">
      <div v-if="current">
        <img :src="current.diagramPlaceholder" style="width: 100%; border-radius: 8px; margin-bottom: 16px" />
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="榫卯类型">{{ current.type }}</el-descriptions-item>
          <el-descriptions-item label="难度">
            <el-tag :type="diffType(current.difficulty)">{{ diffLabel(current.difficulty) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="使用频次">{{ current.usageCount }} 次</el-descriptions-item>
          <el-descriptions-item label="关联订单">{{ current.orderNo || '-' }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 16px">
          <h4 style="color: var(--primary-wood); margin-bottom: 8px">工艺说明</h4>
          <p style="line-height: 1.8; color: #555">{{ current.description }}</p>
        </div>
        <div v-if="current.notes" style="margin-top: 16px">
          <h4 style="color: var(--primary-wood); margin-bottom: 8px">技术要点</h4>
          <p style="line-height: 1.8; color: #555">{{ current.notes }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Histogram } from '@element-plus/icons-vue';
import { tenonApi } from '@/api';

const tenons = ref<any[]>([]);
const typeFilter = ref('');
const detailVisible = ref(false);
const current = ref<any>(null);

const tenonTypes = ['直榫', '燕尾榫', '格肩榫', '夹头榫', '插肩榫', '粽角榫', '霸王枨', '抱肩榫', '楔钉榫', '长短榫'];

const filteredTenons = computed(() => {
  if (!typeFilter.value) return tenons.value;
  return tenons.value.filter((t) => t.type === typeFilter.value);
});

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

const fetchData = async () => {
  tenons.value = await tenonApi.list();
};

const showDetail = (item: any) => {
  current.value = item;
  detailVisible.value = true;
};

onMounted(fetchData);
</script>

<style scoped>
.tenon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.tenon-card {
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s;
}
.tenon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 90, 43, 0.2);
}
.tenon-image {
  position: relative;
  height: 180px;
  background: #f5f1ea;
  overflow: hidden;
}
.tenon-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.diff-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}
.tenon-info {
  padding: 16px;
}
.tenon-type {
  display: inline-block;
  font-size: 12px;
  color: var(--primary-wood);
  background: #f5ebe0;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}
.tenon-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.tenon-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tenon-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: #888;
  align-items: center;
}
</style>
