<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">用料核算</h2>
    </div>

    <el-row :gutter="16">
      <el-col :span="8" v-for="list in materialLists" :key="list.id">
        <div class="wood-card material-card">
          <div class="card-header">
            <div>
              <div class="order-no">{{ list.orderNo }}</div>
              <div class="order-date">{{ formatDate(list.createdAt) }}</div>
            </div>
            <el-tag :type="statusType(list.status)">{{ statusLabel(list.status) }}</el-tag>
          </div>
          <el-table :data="list.items" size="small" style="margin-top: 12px">
            <el-table-column prop="name" label="材料" />
            <el-table-column prop="woodType" label="木料" width="70" />
            <el-table-column label="数量" width="70">
              <template #default="{ row }">{{ row.quantity }}{{ row.unit }}</template>
            </el-table-column>
            <el-table-column label="金额" width="80" align="right">
              <template #default="{ row }">¥{{ row.totalPrice }}</template>
            </el-table-column>
          </el-table>
          <div class="card-footer">
            <div>
              <span style="color: #666">共 {{ list.items.length }} 项</span>
            </div>
            <div class="total">
              合计 <span>¥{{ list.totalCost.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-empty v-if="!materialLists.length" description="暂无用料清单" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { materialApi } from '@/api';

const materialLists = ref<any[]>([]);

const fetchData = async () => {
  materialLists.value = await materialApi.list();
};

const statusLabel = (s: string) => ({
  draft: '草稿',
  confirmed: '已确认',
  purchased: '已采购',
}[s] || s);

const statusType = (s: string) => ({
  draft: 'info',
  confirmed: 'warning',
  purchased: 'success',
}[s] || '');

const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-CN');

onMounted(fetchData);
</script>

<style scoped>
.material-card {
  margin-bottom: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px dashed var(--border-wood);
  padding-bottom: 12px;
}
.order-no {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-wood);
}
.order-date {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-wood);
}
.total {
  font-size: 14px;
  color: #666;
}
.total span {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-wood);
  margin-left: 6px;
}
</style>
