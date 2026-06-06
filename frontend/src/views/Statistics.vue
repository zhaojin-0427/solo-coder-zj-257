<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">统计分析</h2>
    </div>

    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">订单总数</div>
          <div class="stat-value">{{ data?.overview?.totalOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">待处理</div>
          <div class="stat-value warning">{{ data?.overview?.pendingOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">进行中</div>
          <div class="stat-value primary">{{ data?.overview?.producingOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">已完成</div>
          <div class="stat-value success">{{ data?.overview?.completedOrders || 0 }}</div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">平均交付周期</div>
          <div class="stat-value">{{ data?.overview?.avgDeliveryCycle || 0 }}<span style="font-size: 14px"> 天</span></div>
        </div>
      </el-col>
      <el-col :span="4">
        <div class="stat-card wood-card">
          <div class="stat-label">客户满意度</div>
          <div class="stat-value success">
            {{ data?.overview?.avgSatisfaction || 0 }}<span style="font-size: 14px"> / 5</span>
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
import { ref, onMounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import { statisticsApi } from '@/api';

const data = ref<any>(null);
const woodChartRef = ref<HTMLElement>();
const tenonChartRef = ref<HTMLElement>();
const deliveryChartRef = ref<HTMLElement>();
const satisfactionChartRef = ref<HTMLElement>();

const woodColors = ['#8b5a2b', '#a67c52', '#6b4226', '#c9a066', '#8b6914', '#5c4033', '#8b4513', '#cd853f'];

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
};

onMounted(async () => {
  data.value = await statisticsApi.dashboard();
  await nextTick();
  initCharts();

  window.addEventListener('resize', () => {
    [woodChartRef, tenonChartRef, deliveryChartRef, satisfactionChartRef].forEach((ref) => {
      if (ref.value) echarts.getInstanceByDom(ref.value)?.resize();
    });
  });
});
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 20px 12px;
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
</style>
