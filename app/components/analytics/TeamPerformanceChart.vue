<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = computed(() => ({
  labels: ['Design', 'Software & Dev', 'Sales & Marketing', 'Video', 'P.M.'],
  datasets: [
    {
      label: 'Tasks',
      data: [25, 18, 12, 15, 8],
      backgroundColor: [
        '#478FC8',
        '#a78bfa',
        '#84cc16',
        '#478FC8',
        '#dc2626',
      ],
      borderRadius: 4,
      barThickness: 20,
    },
  ],
}))

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1e293b',
      bodyColor: '#64748b',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: (ctx: any) => `${ctx.raw} Tasks`,
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 30,
      ticks: {
        stepSize: 5,
        font: { size: 12, family: 'Inter' },
        color: '#94a3b8',
      },
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
    },
    y: {
      grid: { display: false },
      ticks: {
        font: { size: 12, family: 'Inter' },
        color: '#64748b',
      },
    },
  },
}))
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-2">
      <UiCardTitle class="text-base">Team Performance</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="h-64">
        <ClientOnly>
          <Bar :data="chartData" :options="chartOptions" />
          <template #fallback>
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
          </template>
        </ClientOnly>
      </div>
      <p class="mt-2 text-center text-xs text-muted-foreground">Tasks</p>
    </UiCardContent>
  </UiCard>
</template>
