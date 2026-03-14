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
  const completedData = trend?.map(w => w.completed) ?? [4, 7, 5, 12, 9, 15]
  const createdData = trend?.map(w => w.created) ?? [8, 10, 7, 9, 11, 8]
  const overdueData = trend?.map(w => w.overdue) ?? [1, 2, 1, 3, 2, 1]

  return {
    labels,
    datasets: [
      {
        label: 'Completed',
        data: completedData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6',
      },
      {
        label: 'Ongoing',
        data: createdData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.06)',
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#22c55e',
      },
      {
        label: 'Overdue',
        data: overdueData,
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#ef4444',
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
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#f1f5f9',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      titleFont: { size: 12, weight: 'bold' as const },
      bodyFont: { size: 12 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 11 },
        color: '#94a3b8',
      },
    },
    y: {
      min: 0,
      border: { display: false },
      ticks: {
        font: { size: 11 },
        color: '#94a3b8',
      },
      grid: {
        color: '#f1f5f9',
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
    <div>
      <p class="text-gray-900" style="font-size: 15px; font-weight: 800; letter-spacing: -0.3px">
        Task Performance Chart
      </p>
      <p class="text-gray-400 mt-0.5" style="font-size: 12px">
        Weekly task breakdown by status
      </p>
    </div>
    <div style="height: 220px">
      <ClientOnly>
        <Line :data="chartData" :options="chartOptions" />
        <template #fallback>
          <div class="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
