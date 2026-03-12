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
  const completedData = trend?.map(w => w.completed) ?? [0, 0, 0, 0, 0, 0]
  const createdData = trend?.map(w => w.created) ?? [0, 0, 0, 0, 0, 0]
  const overdueData = trend?.map(w => w.overdue) ?? [0, 0, 0, 0, 0, 0]

  return {
  labels,
  datasets: [
    {
      label: 'Complete',
      data: completedData,
      borderColor: '#478FC8',
      backgroundColor: 'rgba(71, 143, 200, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#478FC8',
    },
    {
      label: 'Ongoing',
      data: createdData,
      borderColor: '#84cc16',
      backgroundColor: 'rgba(132, 204, 22, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#84cc16',
    },
    {
      label: 'Overdue',
      data: overdueData,
      borderColor: '#dc2626',
      backgroundColor: 'rgba(220, 38, 38, 0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#dc2626',
    },
  ],
}})

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
        boxWidth: 6,
        boxHeight: 6,
        padding: 20,
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
      max: 35,
      ticks: {
        stepSize: 5,
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
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Project Trend</UiCardTitle>
        <span class="flex items-center gap-1 text-xs text-muted-foreground">
          <span class="inline-block h-2 w-2 rounded-full bg-[#478FC8]"></span>
          Project Completion Rate
        </span>
      </div>
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
