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
        <el-tag v-if="order" :type="quoteStatusType(order.quoteStatus)" effect="dark" size="large" style="margin-right: 8px">
          {{ quoteStatusLabel(order.quoteStatus) }}
        </el-tag>
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
          <div class="card-header-row">
            <h3 style="margin: 0; color: var(--primary-wood)">💰 报价单</h3>
            <div>
              <el-button
                v-if="order.quoteStatus === 'unquoted'"
                size="small"
                type="primary"
                class="wood-btn"
                @click="handleCreateQuote"
              >
                生成报价
              </el-button>
              <el-button
                v-if="order.quote && (order.quoteStatus === 'pending_confirm')"
                size="small"
                type="warning"
                @click="showQuoteEdit = true"
              >
                调整费用
              </el-button>
              <el-button
                v-if="order.quote && order.quoteStatus === 'pending_confirm'"
                size="small"
                type="primary"
                class="wood-btn"
                @click="showDepositConfirm = true"
              >
                确认订金
              </el-button>
              <el-button
                v-if="order.quoteStatus === 'deposit_paid'"
                size="small"
                type="success"
                @click="handleSettleQuote"
              >
                结清尾款
              </el-button>
            </div>
          </div>

          <div v-if="order.quote" style="margin-top: 16px">
            <div class="quote-header">
              <div>
                <div class="quote-no">报价单号: {{ order.quote.quoteNo }}</div>
                <div class="quote-date">生成时间: {{ formatDate(order.quote.createdAt) }}</div>
              </div>
            </div>

            <el-table :data="order.quote.items" size="small" border style="margin-top: 12px">
              <el-table-column prop="name" label="项目" />
              <el-table-column prop="specification" label="规格" width="90" />
              <el-table-column label="数量" width="70">
                <template #default="{ row }">{{ row.quantity }}{{ row.unit }}</template>
              </el-table-column>
              <el-table-column label="单价" width="80" align="right">
                <template #default="{ row }">¥{{ row.unitPrice.toLocaleString() }}</template>
              </el-table-column>
              <el-table-column label="小计" width="90" align="right">
                <template #default="{ row }">¥{{ row.totalPrice.toLocaleString() }}</template>
              </el-table-column>
            </el-table>

            <el-table size="small" border style="margin-top: 12px" :show-header="false">
              <el-table-column width="120" />
              <el-table-column align="right" />
              <tr>
                <td class="cost-label">材料费小计</td>
                <td class="cost-value">¥{{ order.quote.materialCost.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="cost-label">人工费</td>
                <td class="cost-value">¥{{ order.quote.laborCost.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="cost-label">损耗费</td>
                <td class="cost-value">¥{{ order.quote.wastageCost.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="cost-label">运输安装费</td>
                <td class="cost-value">¥{{ order.quote.transportInstallCost.toLocaleString() }}</td>
              </tr>
              <tr class="total-row">
                <td class="cost-label">报价总额</td>
                <td class="cost-total">¥{{ order.quote.totalAmount.toLocaleString() }}</td>
              </tr>
            </el-table>

            <div v-if="order.quote.quoteRemark" class="quote-remark">
              <strong>备注：</strong>{{ order.quote.quoteRemark }}
            </div>
          </div>
          <el-empty v-else description="尚未生成报价单，点击右上角「生成报价」按钮" :image-size="80" />
        </div>

        <div class="wood-card" style="margin-bottom: 16px">
          <h3 style="margin-bottom: 16px; color: var(--primary-wood)">💵 订金记录</h3>
          <div v-if="order.deposit">
            <el-descriptions :column="1" border size="small">
              <el-descriptions-item label="订金比例">
                <el-tag type="primary">{{ order.deposit.ratio }}%</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="订金金额">
                <span style="color: #67c23a; font-size: 18px; font-weight: 600">
                  ¥{{ order.deposit.amount.toLocaleString() }}
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="确认时间">
                {{ formatDate(order.deposit.confirmedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="付款状态">
                <el-tag v-if="order.deposit.paid" type="success">已付款</el-tag>
                <el-tag v-else type="warning">待付款</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="付款时间" v-if="order.deposit.paidAt">
                {{ formatDate(order.deposit.paidAt) }}
              </el-descriptions-item>
            </el-descriptions>
            <div v-if="order.quote" style="margin-top: 12px; padding: 12px; background: #f5f7fa; border-radius: 4px">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
                <span style="color: #666">报价总额：</span>
                <span>¥{{ order.quote.totalAmount.toLocaleString() }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px">
                <span style="color: #666">已收订金：</span>
                <span style="color: #67c23a">¥{{ order.deposit.amount.toLocaleString() }}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 600; padding-top: 6px; border-top: 1px dashed #ddd">
                <span>待收尾款：</span>
                <span style="color: #e6a23c; font-size: 16px">
                  ¥{{ (order.quote.totalAmount - order.deposit.amount).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无订金记录" :image-size="60" />
        </div>

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

    <el-dialog v-model="showQuoteEdit" title="调整报价费用" width="600px" :close-on-click-modal="false">
      <el-form :model="quoteForm" label-width="110px" v-if="order?.quote">
        <el-form-item label="材料费小计">
          <el-input :model-value="'¥' + quoteForm.materialCost.toLocaleString()" disabled />
          <div style="font-size: 12px; color: #999; margin-top: 4px">根据用料清单自动计算</div>
        </el-form-item>
        <el-form-item label="人工费" required>
          <el-input-number v-model="quoteForm.laborCost" :min="0" :step="100" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="损耗费" required>
          <el-input-number v-model="quoteForm.wastageCost" :min="0" :step="50" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="运输安装费" required>
          <el-input-number v-model="quoteForm.transportInstallCost" :min="0" :step="100" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="报价备注">
          <el-input v-model="quoteForm.quoteRemark" type="textarea" :rows="3" placeholder="可填写报价相关备注说明" />
        </el-form-item>
        <el-form-item label="报价总额">
          <span style="font-size: 22px; color: var(--primary-wood); font-weight: 700">
            ¥{{ computedQuoteTotal.toLocaleString() }}
          </span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showQuoteEdit = false">取消</el-button>
        <el-button type="primary" class="wood-btn" @click="saveQuote">保存调整</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDepositConfirm" title="确认订金" width="480px" :close-on-click-modal="false">
      <el-form :model="depositForm" label-width="100px" v-if="order?.quote">
        <el-form-item label="报价总额">
          <span style="font-size: 18px; color: var(--primary-wood); font-weight: 600">
            ¥{{ order.quote.totalAmount.toLocaleString() }}
          </span>
        </el-form-item>
        <el-form-item label="订金比例" required>
          <el-radio-group v-model="depositForm.ratio">
            <el-radio-button :value="30">30%</el-radio-button>
            <el-radio-button :value="50">50%</el-radio-button>
            <el-radio-button :value="100">100%</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="订金金额" required>
          <el-input-number
            v-model="depositForm.amount"
            :min="0"
            :max="order.quote.totalAmount"
            :step="100"
            controls-position="right"
            style="width: 100%"
            @change="onDepositAmountChange"
          />
          <div style="font-size: 12px; color: #999; margin-top: 4px">
            按 {{ depositForm.ratio }}% 比例计算应为 ¥{{ computedDepositAmount.toLocaleString() }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDepositConfirm = false">取消</el-button>
        <el-button type="primary" class="wood-btn" @click="submitDepositConfirm">确认并付款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
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
const showQuoteEdit = ref(false);
const showDepositConfirm = ref(false);
const quoteForm = ref({
  laborCost: 0,
  wastageCost: 0,
  transportInstallCost: 0,
  materialCost: 0,
  quoteRemark: '',
  items: [] as any[],
});
const depositForm = ref({
  ratio: 30,
  amount: 0,
});

const activeStep = computed(() => {
  if (!order.value) return 0;
  return order.value.craftRecords.findIndex((s: any) => !s.completed);
});

const computedQuoteTotal = computed(() => {
  return quoteForm.value.materialCost + quoteForm.value.laborCost + quoteForm.value.wastageCost + quoteForm.value.transportInstallCost;
});

const computedDepositAmount = computed(() => {
  if (!order.value?.quote) return 0;
  return Math.round(order.value.quote.totalAmount * depositForm.value.ratio / 100);
});

watch(() => depositForm.value.ratio, (val) => {
  if (order.value?.quote) {
    depositForm.value.amount = Math.round(order.value.quote.totalAmount * val / 100);
  }
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

const quoteStatusLabel = (s: string) => ({
  unquoted: '未报价', pending_confirm: '待确认', deposit_paid: '已付订金', settled: '已结清',
}[s] || s);

const quoteStatusType = (s: string) => ({
  unquoted: 'info', pending_confirm: 'warning', deposit_paid: 'primary', settled: 'success',
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
    difficulty: stepForm.value.difficulty,
    notes: stepForm.value.notes,
    assignee: stepForm.value.assignee,
    blockingReason: stepForm.value.blockingReason,
    plannedStartDate: stepForm.value.plannedStartDate
      ? new Date(stepForm.value.plannedStartDate).toISOString()
      : '',
    plannedEndDate: stepForm.value.plannedEndDate
      ? new Date(stepForm.value.plannedEndDate).toISOString()
      : '',
  };
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

const handleCreateQuote = async () => {
  try {
    order.value = await orderApi.createQuote(order.value.id);
    ElMessage.success('报价单已生成');
  } catch (e) {}
};

watch(showQuoteEdit, (val) => {
  if (val && order.value?.quote) {
    quoteForm.value = {
      laborCost: order.value.quote.laborCost,
      wastageCost: order.value.quote.wastageCost,
      transportInstallCost: order.value.quote.transportInstallCost,
      materialCost: order.value.quote.materialCost,
      quoteRemark: order.value.quote.quoteRemark || '',
      items: JSON.parse(JSON.stringify(order.value.quote.items || [])),
    };
  }
});

const saveQuote = async () => {
  try {
    order.value = await orderApi.updateQuote(order.value.id, {
      laborCost: quoteForm.value.laborCost,
      wastageCost: quoteForm.value.wastageCost,
      transportInstallCost: quoteForm.value.transportInstallCost,
      quoteRemark: quoteForm.value.quoteRemark,
      items: quoteForm.value.items,
    });
    ElMessage.success('报价已更新');
    showQuoteEdit.value = false;
  } catch (e) {}
};

watch(showDepositConfirm, (val) => {
  if (val && order.value?.quote) {
    depositForm.value = {
      ratio: 30,
      amount: Math.round(order.value.quote.totalAmount * 0.3),
    };
  }
});

const onDepositAmountChange = () => {
  if (!order.value?.quote) return;
  const ratio = Math.round(depositForm.value.amount / order.value.quote.totalAmount * 100);
  if ([30, 50, 100].includes(ratio)) {
    depositForm.value.ratio = ratio;
  }
};

const submitDepositConfirm = async () => {
  try {
    order.value = await orderApi.confirmDeposit(order.value.id, {
      depositRatio: depositForm.value.ratio,
      depositAmount: depositForm.value.amount,
    });
    ElMessage.success('订金已确认');
    showDepositConfirm.value = false;
  } catch (e) {}
};

const handleSettleQuote = async () => {
  try {
    await ElMessageBox.confirm('确定已收到全部尾款并结清该订单？', '确认结清', { type: 'warning' });
    order.value = await orderApi.settleQuote(order.value.id);
    ElMessage.success('已结清尾款');
  } catch (e) {}
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
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quote-header {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: linear-gradient(135deg, #faf6ef 0%, #f5f1ea 100%);
  border-radius: 6px;
  border: 1px solid var(--border-wood);
}
.quote-no {
  font-weight: 600;
  color: var(--primary-wood);
  font-size: 14px;
}
.quote-date {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.cost-label {
  color: #666;
  padding: 8px 12px !important;
  background: #fafafa;
  font-size: 13px;
}
.cost-value {
  padding: 8px 12px !important;
  font-size: 13px;
}
.total-row .cost-label {
  background: var(--bg-paper);
  font-weight: 600;
  color: var(--primary-wood);
  font-size: 14px;
}
.cost-total {
  padding: 8px 12px !important;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-wood);
}
.quote-remark {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fff9e6;
  border-radius: 4px;
  font-size: 13px;
  color: #8b6914;
  line-height: 1.6;
}
:deep(.el-table__body tr:last-child td) {
  border-bottom: 1px solid #ebeef5;
}
</style>
