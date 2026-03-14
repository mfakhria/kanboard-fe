<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const analyticsStore = useAnalyticsStore()

const distColors = ['#3b82f6', '#1e293b', '#6366f1', '#e2e8f0']

const distributionItems = computed(() => {
  const dist = analyticsStore.overviewStats?.taskDistribution
  if (dist && dist.length > 0) {
    return dist.map((d, i) => ({
      name: d.label,
      value: d.percentage,
      color: distColors[i % distColors.length],
    }))
  }
  return [
    { name: 'Done', value: 38, color: '#3b82f6' },
    { name: 'In Review', value: 22, color: '#1e293b' },
    { name: 'In Progress', value: 25, color: '#6366f1' },
    { name: 'Todo', value: 15, color: '#e2e8f0' },
  ]
})

const chartData = computed(() => {
  const items = distributionItems.value
  return {
    labels: items.map(d => d.name),
    datasets: [
      {
        data: items.map(d => d.value),
        backgroundColor: items.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 6,
        spacing: 3,
      },
    ],
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#f1f5f9',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.raw}%`,
      },
    },
  },
}))
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
    <div>
      <p class="text-gray-900" style="font-size: 15px; font-weight: 800; letter-spacing: -0.3px">
        Task Distribution Chart
      </p>
      <p class="text-gray-400 mt-0.5" style="font-size: 12px">
        Breakdown of tasks by current status
      </p>
    </div>

    <!-- Doughnut chart -->
    <div class="flex items-center justify-center" style="height: 240px">
      <ClientOnly>
        <Doughnut :data="chartData" :options="chartOptions" />
        <template #fallback>
          <div class="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
        </template>
      </ClientOnly>
    </div>

    <!-- Custom legend grid -->
    <div class="grid grid-cols-2 gap-2 mt-1">
      <div
        v-for="item in distributionItems"
        :key="item.name"
        class="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5"
      >
        <div
          class="w-3 h-3 rounded-full flex-shrink-0"
          :style="{ background: item.color }"
        />
        <div class="flex-1 min-w-0">
          <p class="text-gray-700 truncate" style="font-size: 12px; font-weight: 600">
            {{ item.name }}
          </p>
          <p class="text-gray-400" style="font-size: 11px">
            {{ item.value }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
