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

const chartData = computed(() => ({
  labels: ['To Do', 'Completed', 'Ongoing', 'Overdue'],
  datasets: [
    {
      data: [30, 35, 25, 10],
      backgroundColor: [
        '#334155',
        '#478FC8',
        '#84cc16',
        '#7c3aed',
      ],
      borderWidth: 0,
      hoverOffset: 6,
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      display: true,
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
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
      callbacks: {
        label: (ctx: any) => `${ctx.label}: ${ctx.raw}%`,
      },
    },
  },
}))
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-2">
      <UiCardTitle class="text-base">Task Distribution Chart</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div class="h-64">
        <ClientOnly>
          <Doughnut :data="chartData" :options="chartOptions" />
          <template #fallback>
            <div class="flex h-full items-center justify-center text-sm text-muted-foreground">Loading chart...</div>
          </template>
        </ClientOnly>
      </div>
    </UiCardContent>
  </UiCard>
</template>
