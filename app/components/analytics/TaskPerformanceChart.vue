<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const analyticsStore = useAnalyticsStore()

const chartData = computed(() => {
  const trend = analyticsStore.overviewStats?.weeklyTrend
  const labels = trend?.map(w => w.weekLabel) ?? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']
  const data = trend?.map(w => {
    const total = w.completed + w.created
    return total > 0 ? Math.round((w.completed / total) * 100) : 0
  }) ?? [0, 0, 0, 0, 0, 0]

  return {
  labels,
  datasets: [
    {
      label: 'Task Completion Rate',
      data,
      borderColor: '#478FC8',
      backgroundColor: 'rgba(71, 143, 200, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#478FC8',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
}})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
      align: 'end' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'rectRounded',
        boxWidth: 8,
        boxHeight: 8,
        padding: 16,
        font: { size: 12, family: 'Inter' },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 12, family: 'Inter' },
        color: '#94a3b8',
      },
    },
    y: {
      min: 0,
      max: 100,
      ticks: {
        stepSize: 20,
        font: { size: 12, family: 'Inter' },
        color: '#94a3b8',
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
    },
  },
}))
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-2">
      <UiCardTitle class="text-base">Task Performance Chart</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="h-64">
        <ClientOnly>
          <Line :data="chartData" :options="chartOptions" />
          <template #fallback>
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
          </template>
        </ClientOnly>
      </div>
    </UiCardContent>
  </UiCard>
</template>
