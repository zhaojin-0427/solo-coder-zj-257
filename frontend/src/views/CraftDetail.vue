<template>
  <div class="page-container" v-if="archive">
    <div class="page-header">
      <h2 class="page-title">
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        {{ archive.title }}
      </h2>
    </div>

    <div class="wood-card" style="max-width: 900px; margin: 0 auto">
      <div class="article-header">
        <div class="author-info">
          <el-avatar :size="40" style="background: #8b5a2b">{{ archive.author[0] }}</el-avatar>
          <div>
            <div style="font-weight: 600">{{ archive.author }}</div>
            <div style="font-size: 12px; color: #888">{{ formatDate(archive.createdAt) }}</div>
          </div>
        </div>
        <el-tag :type="diffType(archive.difficulty)" size="large">{{ diffLabel(archive.difficulty) }}</el-tag>
      </div>

      <div class="article-tags">
        <el-tag v-for="t in archive.tags" :key="t" size="small" type="info" effect="plain">
          {{ t }}
        </el-tag>
      </div>

      <el-descriptions :column="3" border size="small" style="margin: 20px 0">
        <el-descriptions-item label="家具名称">{{ archive.furnitureName }}</el-descriptions-item>
        <el-descriptions-item label="木料">{{ archive.woodType }}</el-descriptions-item>
        <el-descriptions-item label="关联订单">{{ archive.orderNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="涉及榫卯" :span="3">
          <el-tag v-for="t in archive.tenonTypes" :key="t" style="margin-right: 6px" type="warning">
            {{ t }}
          </el-tag>
          <span v-if="!archive.tenonTypes?.length" style="color: #999">无</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="article-section">
        <h3>📝 工艺详情</h3>
        <div class="article-content" v-for="(p, idx) in paragraphs" :key="idx">
          {{ p }}
        </div>
      </div>

      <div class="article-section" v-if="archive.keyTechniques?.length">
        <h3>🔑 关键技法</h3>
        <ul>
          <li v-for="(t, i) in archive.keyTechniques" :key="i">{{ t }}</li>
        </ul>
      </div>

      <div class="article-section lessons" v-if="archive.lessonsLearned">
        <h3>💡 经验心得</h3>
        <p>{{ archive.lessonsLearned }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { craftApi } from '@/api';

const route = useRoute();
const archive = ref<any>(null);

const paragraphs = computed(() => {
  if (!archive.value) return [];
  return archive.value.content.split('\n').filter((p: string) => p.trim());
});

const diffLabel = (d: string) => ({
  low: '入门', medium: '普通', high: '困难', master: '大师级',
}[d] || d);

const diffType = (d: string) => ({
  low: 'success', medium: '', high: 'warning', master: 'danger',
}[d] || '');

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN');

onMounted(async () => {
  archive.value = await craftApi.detail(route.params.id as string);
});
</script>

<style scoped>
.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-wood);
}
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.article-tags {
  display: flex;
  gap: 6px;
  margin-top: 16px;
  flex-wrap: wrap;
}
.article-section {
  margin-top: 24px;
}
.article-section h3 {
  font-size: 16px;
  color: var(--primary-wood);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-wood);
}
.article-content {
  line-height: 2;
  color: #444;
  font-size: 15px;
  text-indent: 2em;
  margin-bottom: 12px;
}
.article-section ul {
  padding-left: 20px;
  line-height: 2.2;
  color: #444;
}
.lessons {
  background: #fdf6ec;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #faecd8;
}
.lessons p {
  line-height: 1.8;
  color: #666;
}
</style>
