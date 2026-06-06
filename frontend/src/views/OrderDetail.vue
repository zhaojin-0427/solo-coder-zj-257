<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">
        <el-button link @click="$router.back()">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        订单详情 · {{ order?.orderNo }}
      </h2>
      <div>
        <el-tag v-if="order" :type="statusType(order.status)" size="large" style="margin-right: 8px">
          {{ statusLabel(order.status) }}
        </el-tag>
        <el-tag v-if="order && scheduleType(order.scheduleStatus)" :type="scheduleType(order.scheduleStatus)" size="large" effect="dark">
          {{ scheduleLabel(order.scheduleStatus) }}
        </el-tag>
      </div>
    </div>

    <el-row :gutter="16" v-if="order">
      <el-col :span="14">
        <div class="wood-card" style="margin-bottom: 16px">
          <h3 style="margin-bottom: 16px; color: var(--primary-wood)">📋 基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="客户姓名">{{ order.customerName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ order.customerPhone }}</el-descriptions-item>
            <el-descriptions-item label="家具名称">{{ order.furnitureName }}</el-descriptions-item>
            <el-descriptions-item label="木料偏好">{{ order.woodPreference }}</el-descriptions-item>
            <el-descriptions-item label="尺寸">{{ order.dimensions.length }}×{{ order.dimensions.width }}×{{ order.dimensions.height }}{{ order.dimensions.unit }}</el-descriptions-item>
            <el-descriptions-item label="工艺难度">
              <el-tag :type="complexityType(order.complexity)">{{ complexityLabel(order.complexity) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="所需榫卯">
              <el-tag v-for="t in order.requiredTenons" :key="t" style="margin-right: 4px">{{ t }}</el-tag>
              <span v-if="!order.requiredTenons?.length" style="color: #999">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDate(order.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="预计交付" v-if="order.estimatedDelivery">
              {{ formatDate(order.estimatedDelivery) }}
            </el-descriptions-item>
            <el-descriptions-item label="实际交付" v-if="order.actualDelivery">
              {{ formatDate(order.actualDelivery) }}
            </el-descriptions-item>
            <el-descriptions-item label="特殊要求" :span="2">
              {{ order.specialRequirements || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="wood-card">
          <h3 style="margin-bottom: 16px; color: var(--primary-wood)">🔨 施工工序</h3>
          <el-steps direction="vertical" :active="activeStep" finish-status="success">
            <el-step
              v-for="(step, idx) in order.craftRecords"
              :key="step.id"
              :title="step.stepName"
              :status="step.completed ? 'success' : (idx === activeStep ? 'process' : 'wait')"
              :class="{ 'step-overdue': isOverdue(step) && !step.completed }"
            >
              <template #description>
                <div style="margin-top: 8px">
                  <el-row :gutter="8">
                    <el-col :span="12">
                      <div class="craft-info">
                        <span class="info-label">计划开始:</span>
                        <span class="info-value">{{ step.plannedStartDate ? formatDateOnly(step.plannedStartDate) : '未设置' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="craft-info">
                        <span class="info-label">计划结束:</span>
                        <span class="info-value" :class="{ 'text-danger': isOverdue(step) && !step.completed }">
                          {{ step.plannedEndDate ? formatDateOnly(step.plannedEndDate) : '未设置' }}
                          <span v-if="isOverdue(step) && !step.completed" style="margin-left: 4px">⚠️ 已逾期</span>
                        </span>
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="8" style="margin-top: 4px">
                    <el-col :span="12">
                      <div class="craft-info">
                        <span class="info-label">负责人:</span>
                        <span class="info-value">{{ step.assignee || '未分配' }}</span>
                      </div>
                    </el-col>
                    <el-col :span="12" v-if="step.blockingReason && !step.completed">
                      <div class="craft-info">
                        <span class="info-label">阻塞原因:</span>
                        <span class="info-value text-danger">{{ step.blockingReason }}</span>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div v-if="step.completed" style="font-size: 12px; color: #67c23a; margin-top: 6px">
                  ✅ 完成于 {{ formatDate(step.completedAt!) }}
                </div>
                <div v-if="step.difficulty" style="font-size: 12px; color: #e6a23c; margin-top: 4px">
                  ⚠ 难点: {{ step.difficulty }}
                </div>
                <div v-if="step.notes" style="font-size: 12px; color: #666; margin-top: 4px">
                  📝 备注: {{ step.notes }}
                </div>
                <div style="margin-top: 8px">
                  <el-button
                    v-if="!step.completed"
                    size="small"
                    type="primary"
                    class="wood-btn"
                    @click="toggleStep(step, true)"
                  >
                    标记完成
                  </el-button>
                  <el-button
                    v-if="step.completed"
                    size="small"
                    @click="toggleStep(step, false)"
                  >
                    撤销完成
                  </el-button>
                  <el-button size="small" type="warning" @click="editStep(step)">
                    编辑排期/备注
                  </el-button>
                </div>
              </template>
            </el-step>
          </el-steps>
        </div>
      </el-col>

      <el-col :span="10">
        <div class="wood-card" style="margin-bottom: 16px">
          <h3 style="margin-bottom: 16px; color: var(--primary-wood)">📊 用料清单</h3>
          <div v-if="materialList">
            <el-table :data="materialList.items" size="small" border>
              <el-table-column prop="name" label="材料名称" />
              <el-table-column prop="specification" label="规格" width="100" />
              <el-table-column label="数量" width="80">
                <template #default="{ row }">{{ row.quantity }}{{ row.unit }}</template>
              </el-table-column>
              <el-table-column label="小计" width="90" align="right">
                <template #default="{ row }">¥{{ row.totalPrice.toLocaleString() }}</template>
              </el-table-column>
            </el-table>
            <div style="text-align: right; margin-top: 12px; font-size: 16px; font-weight: 600; color: var(--primary-wood)">
              合计: ¥{{ materialList.totalCost.toLocaleString() }}
            </div>
          </div>
          <el-empty v-else description="暂未生成用料清单" :image-size="80" />
        </div>

        <div class="wood-card" v-if="order.status === 'completed' || order.status === 'accepted'">
          <h3 style="margin-bottom: 16px; color: var(--primary-wood)">⭐ 客户验收评价</h3>
          <div v-if="order.craftsmanshipRating">
            <el-rate v-model="order.craftsmanshipRating" disabled />
            <div style="margin-top: 8px; font-size: 14px; color: #333">{{ order.customerComment }}</div>
          </div>
          <div v-else-if="order.status === 'completed'">
            <el-form :model="acceptForm" label-width="100px">
              <el-form-item label="工艺评分">
                <el-rate v-model="acceptForm.craftsmanshipRating" />
              </el-form-item>
              <el-form-item label="评价">
                <el-input v-model="acceptForm.comment" type="textarea" :rows="3" />
              </el-form-item>
              <el-button type="primary" class="wood-btn" @click="submitAccept">提交验收</el-button>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="showStepEdit" title="编辑工序排期与备注" width="500px">
      <el-form :model="stepForm" label-width="100px">
        <el-form-item label="计划开始">
          <el-date-picker
            v-model="stepForm.plannedStartDate"
            type="date"
            placeholder="选择计划开始日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="计划结束">
          <el-date-picker
            v-model="stepForm.plannedEndDate"
            type="date"
            placeholder="选择计划结束日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="stepForm.assignee" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="阻塞原因" v-if="!editingStep?.completed">
          <el-input
            v-model="stepForm.blockingReason"
            type="textarea"
            :rows="2"
            placeholder="若工序被阻塞，请填写阻塞原因"
          />
        </el-form-item>
        <el-form-item label="工艺难点">
          <el-input v-model="stepForm.difficulty" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="stepForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStepEdit = false">取消</el-button>
        <el-button type="primary" class="wood-btn" @click="saveStep">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { orderApi, materialApi } from '@/api';

const route = useRoute();
const order = ref<any>(null);
const materialList = ref<any>(null);
const showStepEdit = ref(false);
const editingStep = ref<any>(null);
const stepForm = ref({
  difficulty: '',
  notes: '',
  plannedStartDate: '',
  plannedEndDate: '',
  assignee: '',
  blockingReason: '',
});
const acceptForm = ref({ craftsmanshipRating: 5, comment: '' });

const activeStep = computed(() => {
  if (!order.value) return 0;
  return order.value.craftRecords.findIndex((s: any) => !s.completed);
});

const fetchData = async () => {
  const id = route.params.id as string;
  order.value = await orderApi.detail(id);
  materialList.value = await materialApi.byOrder(id);
};

const statusLabel = (s: string) => ({
  pending: '待处理', designing: '设计中', producing: '生产中', completed: '已完工', accepted: '已验收',
}[s] || s);

const statusType = (s: string) => ({
  pending: 'info', designing: 'warning', producing: 'primary', completed: 'success', accepted: '',
}[s] || '');

const scheduleLabel = (s: string) => ({
  overdue: '🚨 工序逾期', near: '⏰ 临近交付', normal: '',
}[s] || '');

const scheduleType = (s: string) => ({
  overdue: 'danger', near: 'warning', normal: '',
}[s] || '');

const complexityLabel = (c: string) => ({
  simple: '简单', medium: '普通', complex: '复杂', master: '大师级',
}[c] || c);

const complexityType = (c: string) => ({
  simple: 'success', medium: '', complex: 'warning', master: 'danger',
}[c] || '');

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN');
const formatDateOnly = (d: string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const isOverdue = (step: any) => {
  if (!step.plannedEndDate || step.completed) return false;
  return new Date(step.plannedEndDate).getTime() < new Date().getTime();
};

const toggleStep = async (step: any, completed: boolean) => {
  await orderApi.updateCraft(order.value.id, step.id, { completed });
  ElMessage.success(completed ? '已标记完成' : '已撤销');
  fetchData();
};

const editStep = (step: any) => {
  editingStep.value = step;
  stepForm.value = {
    difficulty: step.difficulty || '',
    notes: step.notes || '',
    plannedStartDate: step.plannedStartDate ? formatDateOnly(step.plannedStartDate) : '',
    plannedEndDate: step.plannedEndDate ? formatDateOnly(step.plannedEndDate) : '',
    assignee: step.assignee || '',
    blockingReason: step.blockingReason || '',
  };
  showStepEdit.value = true;
};

const saveStep = async () => {
  const payload: any = {
    difficulty: stepForm.value.difficulty || undefined,
    notes: stepForm.value.notes || undefined,
    assignee: stepForm.value.assignee || undefined,
    blockingReason: stepForm.value.blockingReason || undefined,
  };
  if (stepForm.value.plannedStartDate) {
    payload.plannedStartDate = new Date(stepForm.value.plannedStartDate).toISOString();
  }
  if (stepForm.value.plannedEndDate) {
    payload.plannedEndDate = new Date(stepForm.value.plannedEndDate).toISOString();
  }
  await orderApi.updateCraft(order.value.id, editingStep.value.id, payload);
  ElMessage.success('保存成功');
  showStepEdit.value = false;
  fetchData();
};

const submitAccept = async () => {
  await orderApi.accept(order.value.id, acceptForm.value);
  ElMessage.success('验收完成');
  fetchData();
};

onMounted(fetchData);
</script>

<style scoped>
.craft-info {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
}
.info-label {
  color: #999;
  margin-right: 4px;
}
.info-value {
  color: #333;
}
.text-danger {
  color: #f56c6c;
  font-weight: 500;
}
.step-overdue :deep(.el-step__title) {
  color: #f56c6c !important;
  font-weight: 600;
}
</style>
