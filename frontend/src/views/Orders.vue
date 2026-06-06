<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
      <el-button type="primary" class="wood-btn" @click="showCreate = true">
        <el-icon><Plus /></el-icon>新建订单
      </el-button>
    </div>

    <div class="wood-card">
      <div class="filter-bar">
        <el-select v-model="statusFilter" placeholder="状态筛选" clearable style="width: 160px">
          <el-option label="待处理" value="pending" />
          <el-option label="设计中" value="designing" />
          <el-option label="生产中" value="producing" />
          <el-option label="已完工" value="completed" />
          <el-option label="已验收" value="accepted" />
        </el-select>
        <el-input
          v-model="searchText"
          placeholder="搜索订单号 / 客户 / 家具"
          style="width: 280px"
          :prefix-icon="Search"
        />
      </div>

      <el-table :data="filteredOrders" style="width: 100%" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column label="客户信息" width="180">
          <template #default="{ row }">
            <div style="font-weight: 500">{{ row.customerName }}</div>
            <div style="font-size: 12px; color: #888">{{ row.customerPhone }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="furnitureName" label="家具名称" width="140" />
        <el-table-column prop="woodPreference" label="木料" width="100" />
        <el-table-column label="尺寸" width="160">
          <template #default="{ row }">
            {{ row.dimensions.length }}×{{ row.dimensions.width }}×{{ row.dimensions.height }}{{ row.dimensions.unit }}
          </template>
        </el-table-column>
        <el-table-column label="工艺难度" width="100">
          <template #default="{ row }">
            <el-tag :type="complexityType(row.complexity)">
              {{ complexityLabel(row.complexity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="goDetail(row.id)">查看</el-button>
            <el-dropdown trigger="click" @command="(cmd: any) => handleCommand(cmd, row)">
              <el-button type="primary" link>
                状态<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="pending">待处理</el-dropdown-item>
                  <el-dropdown-item command="designing">设计中</el-dropdown-item>
                  <el-dropdown-item command="producing">生产中</el-dropdown-item>
                  <el-dropdown-item command="completed">已完工</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog v-model="showCreate" title="新建订单" width="600px" :close-on-click-modal="false">
      <el-form :model="form" label-width="100px" ref="formRef">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户姓名" prop="customerName" required>
              <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="customerPhone" required>
              <el-input v-model="form.customerPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="家具名称" prop="furnitureName" required>
              <el-input v-model="form.furnitureName" placeholder="如：明式圈椅" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="木料偏好" prop="woodPreference" required>
              <el-select v-model="form.woodPreference" style="width: 100%">
                <el-option v-for="w in woodTypes" :key="w" :label="w" :value="w" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="尺寸要求" required>
          <el-row :gutter="8">
            <el-col :span="7">
              <el-input-number v-model="form.dimensions.length" :min="1" controls-position="right" style="width: 100%" />
              <div style="text-align: center; font-size: 12px; color: #888">长</div>
            </el-col>
            <el-col :span="7">
              <el-input-number v-model="form.dimensions.width" :min="1" controls-position="right" style="width: 100%" />
              <div style="text-align: center; font-size: 12px; color: #888">宽</div>
            </el-col>
            <el-col :span="7">
              <el-input-number v-model="form.dimensions.height" :min="1" controls-position="right" style="width: 100%" />
              <div style="text-align: center; font-size: 12px; color: #888">高</div>
            </el-col>
            <el-col :span="3">
              <el-select v-model="form.dimensions.unit" style="width: 100%">
                <el-option label="cm" value="cm" />
                <el-option label="mm" value="mm" />
              </el-select>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="工艺难度" prop="complexity" required>
          <el-radio-group v-model="form.complexity">
            <el-radio-button value="simple">简单</el-radio-button>
            <el-radio-button value="medium">普通</el-radio-button>
            <el-radio-button value="complex">复杂</el-radio-button>
            <el-radio-button value="master">大师级</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="特殊要求">
          <el-input v-model="form.specialRequirements" type="textarea" :rows="3" placeholder="填写特殊工艺要求、风格偏好等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" class="wood-btn" @click="submitCreate">提交订单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { Search, Plus, ArrowDown } from '@element-plus/icons-vue';
import { orderApi } from '@/api';

const router = useRouter();
const orders = ref<any[]>([]);
const statusFilter = ref('');
const searchText = ref('');
const showCreate = ref(false);
const formRef = ref<FormInstance>();

const woodTypes = ['黄花梨', '紫檀', '酸枝', '鸡翅木', '楠木', '榆木', '榉木', '松木'];

const form = ref({
  customerName: '',
  customerPhone: '',
  furnitureName: '',
  woodPreference: '黄花梨',
  dimensions: { length: 100, width: 50, height: 80, unit: 'cm' },
  complexity: 'medium',
  requiredTenons: [],
  specialRequirements: '',
});

const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    if (statusFilter.value && o.status !== statusFilter.value) return false;
    if (searchText.value) {
      const s = searchText.value.toLowerCase();
      return (
        o.orderNo.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.furnitureName.toLowerCase().includes(s)
      );
    }
    return true;
  });
});

const fetchOrders = async () => {
  orders.value = await orderApi.list();
};

const statusLabel = (s: string) => ({
  pending: '待处理',
  designing: '设计中',
  producing: '生产中',
  completed: '已完工',
  accepted: '已验收',
}[s] || s);

const statusType = (s: string) => ({
  pending: 'info',
  designing: 'warning',
  producing: 'primary',
  completed: 'success',
  accepted: '',
}[s] || '');

const complexityLabel = (c: string) => ({
  simple: '简单',
  medium: '普通',
  complex: '复杂',
  master: '大师级',
}[c] || c);

const complexityType = (c: string) => ({
  simple: 'success',
  medium: '',
  complex: 'warning',
  master: 'danger',
}[c] || '');

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN');

const goDetail = (id: string) => router.push(`/orders/${id}`);

const handleCommand = async (cmd: string, row: any) => {
  await orderApi.updateStatus(row.id, cmd);
  ElMessage.success('状态已更新');
  fetchOrders();
};

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定删除订单 ${row.orderNo}?`, '提示', { type: 'warning' });
    await orderApi.delete(row.id);
    ElMessage.success('删除成功');
    fetchOrders();
  } catch {}
};

const submitCreate = async () => {
  await formRef.value?.validate();
  await orderApi.create(form.value);
  ElMessage.success('订单创建成功');
  showCreate.value = false;
  form.value = {
    customerName: '',
    customerPhone: '',
    furnitureName: '',
    woodPreference: '黄花梨',
    dimensions: { length: 100, width: 50, height: 80, unit: 'cm' },
    complexity: 'medium',
    requiredTenons: [],
    specialRequirements: '',
  };
  fetchOrders();
};

onMounted(fetchOrders);
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
