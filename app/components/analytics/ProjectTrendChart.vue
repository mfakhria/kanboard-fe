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
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartTheme = computed(() => {
  if (isDark.value) {
    return {
      grid: 'rgba(148, 163, 184, 0.18)',
      tick: '#94a3b8',
      legend: '#cbd5e1',
      tooltipBg: '#0f172a',
      tooltipTitle: '#e2e8f0',
      tooltipBody: '#94a3b8',
      tooltipBorder: '#334155',
      pointBorder: '#0f172a',
    }
  }

  return {
    grid: '#f1f5f9',
    tick: '#94a3b8',
    legend: '#64748b',
    tooltipBg: '#ffffff',
    tooltipTitle: '#1e293b',
    tooltipBody: '#64748b',
    tooltipBorder: '#f1f5f9',
    pointBorder: '#ffffff',
  }
})

const chartData = computed(() => {
  const trend = analyticsStore.overviewStats?.weeklyTrend
  const labels = trend?.map(w => w.weekLabel) ?? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6']
  const data = trend?.map(w => {
    const total = w.completed + w.created
    return total > 0 ? Math.round((w.completed / total) * 100) : 0
  }) ?? [38, 45, 42, 68, 57, 79]

  return {
    labels,
    datasets: [
      {
        label: 'Completion Rate',
        data,
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: chartTheme.value.pointBorder,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
        boxHeight: 8,
        padding: 20,
        font: { size: 12, family: 'Inter' },
        color: chartTheme.value.legend,
      },
    },
    tooltip: {
      backgroundColor: chartTheme.value.tooltipBg,
      titleColor: chartTheme.value.tooltipTitle,
      bodyColor: chartTheme.value.tooltipBody,
      borderColor: chartTheme.value.tooltipBorder,
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      titleFont: { size: 12, weight: 'bold' as const },
      bodyFont: { size: 12 },
      callbacks: {
        label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 11 },
        color: chartTheme.value.tick,
      },
    },
    y: {
      min: 0,
      max: 100,
      border: { display: false },
      ticks: {
        font: { size: 11 },
        color: chartTheme.value.tick,
        callback: (v: any) => `${v}%`,
      },
      grid: {
        color: chartTheme.value.grid,
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-black/20 p-5 flex flex-col gap-4">
    <div>
      <p class="text-gray-900 dark:text-gray-100" style="font-size: 15px; font-weight: 800; letter-spacing: -0.3px">
        Project Trend
      </p>
      <p class="text-gray-400 dark:text-gray-500 mt-0.5" style="font-size: 12px">
        Task completion rate (%) over time
      </p>
    </div>
    <div style="height: 220px">
      <ClientOnly>
        <Line :data="chartData" :options="chartOptions" />
        <template #fallback>
          <div class="flex h-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">Loading chart...</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
