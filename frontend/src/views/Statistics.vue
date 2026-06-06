<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">统计分析</h2>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ data?.overview?.totalOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">待处理</div>
          <div class="stat-value warning">{{ data?.overview?.pendingOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">进行中</div>
          <div class="stat-value primary">{{ data?.overview?.producingOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">已完成</div>
          <div class="stat-value success">{{ data?.overview?.completedOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">🚨 工序逾期</div>
          <div class="stat-value danger">{{ data?.overview?.overdueCraftCount || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">平均工序时长</div>
          <div class="stat-value">
            {{ data?.overview?.avgCraftDuration || 0 }}<span style="font-size: 14px"> 天</span>
          </div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">平均交付周期</div>
          <div class="stat-value">{{ data?.overview?.avgDeliveryCycle || 0 }}<span style="font-size: 14px"> 天</span></div>
        </div>
      </el-col>
      <el-col :span="3">
        <div class="stat-card wood-card">
          <div class="stat-label">客户满意度</div>
          <div class="stat-value success">
            {{ data?.overview?.avgSatisfaction || 0 }}<span style="font-size: 14px"> / 5</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <div class="stat-card wood-card stat-card-primary">
          <div class="stat-label">💰 报价总额</div>
          <div class="stat-value" style="color: var(--primary-wood)">
            ¥{{ (data?.quotation?.totalQuoteAmount || 0).toLocaleString() }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card wood-card stat-card-success">
          <div class="stat-label">✅ 已收订金</div>
          <div class="stat-value" style="color: #67c23a">
            ¥{{ (data?.quotation?.totalDepositReceived || 0).toLocaleString() }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card wood-card stat-card-warning">
          <div class="stat-label">⏳ 待收尾款</div>
          <div class="stat-value" style="color: #e6a23c">
            ¥{{ (data?.quotation?.totalPendingBalance || 0).toLocaleString() }}
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card wood-card">
          <div class="stat-label">📊 报价状态</div>
          <div class="quote-status-row">
            <el-tag type="info" size="small">未 {{ data?.quotation?.statusCounts?.unquoted || 0 }}</el-tag>
            <el-tag type="warning" size="small">待 {{ data?.quotation?.statusCounts?.pending_confirm || 0 }}</el-tag>
            <el-tag type="primary" size="small">订 {{ data?.quotation?.statusCounts?.deposit_paid || 0 }}</el-tag>
            <el-tag type="success" size="small">结 {{ data?.quotation?.statusCounts?.settled || 0 }}</el-tag>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">📊 木料消耗趋势 (按金额)</h3>
          <div ref="woodChartRef" class="chart"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">🔧 榫卯类型使用频次</h3>
          <div ref="tenonChartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">📅 订单交付周期</h3>
          <div ref="deliveryChartRef" class="chart"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">⭐ 客户满意度分布</h3>
          <div ref="satisfactionChartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">🪵 不同木料订单平均报价</h3>
          <div ref="woodAvgQuoteChartRef" class="chart"></div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="wood-card chart-card">
          <h3 class="chart-title">💴 报价收款概览</h3>
          <div ref="quoteOverviewChartRef" class="chart"></div>
        </div>
      </el-col>
    </el-row>

    <div class="wood-card" style="margin-top: 16px">
      <h3 class="chart-title">⏰ 临近交付订单列表</h3>
      <el-table :data="data?.nearDeliveryOrders || []" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column prop="furnitureName" label="家具名称" width="160" />
        <el-table-column prop="customerName" label="客户" width="120" />
        <el-table-column label="预计交付" width="160">
          <template #default="{ row }">
            <span class="text-warning">
              {{ row.estimatedDelivery ? formatDateOnly(row.estimatedDelivery) : '-' }}
            </span>
            <div style="font-size: 11px; color: #e6a23c">
              {{ deliveryDaysText(row) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="逾期工序" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.overdueCraftCount > 0" type="danger" size="small">
              {{ row.overdueCraftCount }} 道
            </el-tag>
            <span v-else style="color: #67c23a">0</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="goOrder(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!data?.nearDeliveryOrders?.length" description="暂无临近交付的订单" :image-size="60" />
    </div>

    <div class="wood-card" style="margin-top: 16px">
      <h3 class="chart-title">💬 客户评价列表</h3>
      <el-table :data="data?.satisfaction?.ratings || []" stripe>
        <el-table-column prop="orderNo" label="订单号" width="140" />
        <el-table-column prop="furnitureName" label="家具名称" width="160" />
        <el-table-column label="评分" width="160">
          <template #default="{ row }">
            <el-rate v-model="row.rating" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="评价内容" />
      </el-table>
      <el-empty v-if="!data?.satisfaction?.ratings?.length" description="暂无客户评价" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import * as echarts from 'echarts';
import { statisticsApi } from '@/api';

const router = useRouter();
const data = ref<any>(null);
const woodChartRef = ref<HTMLElement>();
const tenonChartRef = ref<HTMLElement>();
const deliveryChartRef = ref<HTMLElement>();
const satisfactionChartRef = ref<HTMLElement>();
const woodAvgQuoteChartRef = ref<HTMLElement>();
const quoteOverviewChartRef = ref<HTMLElement>();

const woodColors = ['#8b5a2b', '#a67c52', '#6b4226', '#c9a066', '#8b6914', '#5c4033', '#8b4513', '#cd853f'];

const formatDateOnly = (d: string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const deliveryDaysText = (row: any) => {
  if (!row.estimatedDelivery) return '';
  const days = Math.ceil(
    (new Date(row.estimatedDelivery).getTime() - new Date().getTime()) / (24 * 3600 * 1000),
  );
  if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
  if (days === 0) return '今日到期';
  return `剩余 ${days} 天`;
};

const goOrder = (id: string) => router.push(`/orders/${id}`);

const initCharts = () => {
  if (!data.value) return;

  if (woodChartRef.value) {
    const chart = echarts.init(woodChartRef.value);
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      legend: {
        bottom: 0,
        type: 'scroll',
      },
      color: woodColors,
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n¥{c}',
          },
          data: data.value.woodConsumptionTrend,
        },
      ],
    });
  }

  if (tenonChartRef.value) {
    const chart = echarts.init(tenonChartRef.value);
    const tenonData = data.value.tenonFrequency.slice(0, 8);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      yAxis: {
        type: 'category',
        data: tenonData.map((d: any) => d.name).reverse(),
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      series: [
        {
          type: 'bar',
          data: tenonData.map((d: any) => d.value).reverse(),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#8b5a2b' },
              { offset: 1, color: '#c9a066' },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c} 次',
          },
          barWidth: 18,
        },
      ],
    });
  }

  if (deliveryChartRef.value) {
    const chart = echarts.init(deliveryChartRef.value);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const p = params[0];
          return `${p.name}<br/>交付周期: ${p.value} 天`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.value.deliveryCycles.map((d: any) => d.orderNo),
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      yAxis: {
        type: 'value',
        name: '天',
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      series: [
        {
          type: 'line',
          data: data.value.deliveryCycles.map((d: any) => d.days),
          smooth: true,
          symbol: 'circle',
          symbolSize: 10,
          lineStyle: { color: '#8b5a2b', width: 3 },
          itemStyle: { color: '#8b5a2b', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 90, 43, 0.3)' },
              { offset: 1, color: 'rgba(139, 90, 43, 0.02)' },
            ]),
          },
          label: {
            show: true,
            formatter: '{c}天',
            position: 'top',
          },
        },
      ],
    });
  }

  if (satisfactionChartRef.value) {
    const chart = echarts.init(satisfactionChartRef.value);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.value.satisfaction.distribution.map((d: any) => `${d.star}星`),
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      yAxis: {
        type: 'value',
        name: '订单数',
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      series: [
        {
          type: 'bar',
          data: data.value.satisfaction.distribution.map((d: any) => d.count),
          itemStyle: {
            color: (params: any) => {
              const colors = ['#f56c6c', '#e6a23c', '#e6d83c', '#95d475', '#67c23a'];
              return colors[params.dataIndex];
            },
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c} 单',
          },
          barWidth: 40,
        },
      ],
    });
  }

  if (woodAvgQuoteChartRef.value && data.value.quotation?.woodAverageQuotes) {
    const chart = echarts.init(woodAvgQuoteChartRef.value);
    const woodData = data.value.quotation.woodAverageQuotes;
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = params[0];
          const item = woodData[p.dataIndex];
          return `${p.name}<br/>平均报价: ¥${p.value.toLocaleString()}<br/>订单数: ${item.count} 单`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: woodData.map((d: any) => d.name),
        axisLine: { lineStyle: { color: '#c9a066' } },
      },
      yAxis: {
        type: 'value',
        name: '平均报价 (¥)',
        axisLine: { lineStyle: { color: '#c9a066' } },
        axisLabel: {
          formatter: (val: number) => '¥' + (val / 1000) + 'k',
        },
      },
      series: [
        {
          type: 'bar',
          data: woodData.map((d: any) => d.average),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#a67c52' },
              { offset: 1, color: '#8b5a2b' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
          label: {
            show: true,
            position: 'top',
            formatter: (p: any) => '¥' + (p.value / 1000).toFixed(1) + 'k',
          },
          barWidth: 36,
        },
      ],
    });
  }

  if (quoteOverviewChartRef.value && data.value.quotation) {
    const chart = echarts.init(quoteOverviewChartRef.value);
    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      legend: {
        bottom: 0,
        type: 'scroll',
      },
      color: ['#67c23a', '#e6a23c', '#909399'],
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n¥{c}',
          },
          data: [
            { name: '已收订金', value: data.value.quotation.totalDepositReceived || 0 },
            { name: '待收尾款', value: data.value.quotation.totalPendingBalance || 0 },
          ],
        },
      ],
    });
  }
};

onMounted(async () => {
  data.value = await statisticsApi.dashboard();
  await nextTick();
  initCharts();

  window.addEventListener('resize', () => {
    [woodChartRef, tenonChartRef, deliveryChartRef, satisfactionChartRef, woodAvgQuoteChartRef, quoteOverviewChartRef].forEach((ref) => {
      if (ref.value) echarts.getInstanceByDom(ref.value)?.resize();
    });
  });
});
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 20px 8px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
}
.stat-card-primary {
  background: linear-gradient(135deg, #fff 0%, #faf6ef 100%);
}
.stat-card-success {
  background: linear-gradient(135deg, #fff 0%, #f0f9eb 100%);
}
.stat-card-warning {
  background: linear-gradient(135deg, #fff 0%, #fdf6ec 100%);
}
.stat-label {
  font-size: 13px;
  color: #888;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-wood);
}
.stat-value.primary {
  color: #409eff;
}
.stat-value.success {
  color: #67c23a;
}
.stat-value.warning {
  color: #e6a23c;
}
.stat-value.danger {
  color: #f56c6c;
}
.quote-status-row {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.chart-card {
  padding: 20px;
}
.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--primary-wood);
}
.chart {
  width: 100%;
  height: 320px;
}
.text-warning {
  color: #e6a23c;
  font-weight: 600;
}
</style>
