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

const analyticsStore = useAnalyticsStore()

// Team member data (from store or fallback)
const teamData = computed(() => {
  const members = analyticsStore.teamMembers
  if (members.length > 0) {
    return members.map((m, i) => {
      const fills = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4', '#f97316']
      return {
        name: m.name,
        initial: m.name.charAt(0),
        tasks: 10,
        completed: m.status === 'completed' ? 8 : m.status === 'in_progress' ? 5 : 3,
        fill: fills[i % fills.length],
      }
    })
  }
  return [
    { name: 'Muhammad Fakhri', initial: 'M', tasks: 12, completed: 9, fill: '#3b82f6' },
    { name: 'Hidayat', initial: 'H', tasks: 7, completed: 5, fill: '#6366f1' },
    { name: 'Rina', initial: 'R', tasks: 10, completed: 8, fill: '#8b5cf6' },
    { name: 'Dian', initial: 'D', tasks: 5, completed: 3, fill: '#06b6d4' },
  ]
})

// Priority bar chart data
const priorityColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  URGENT: '#ef4444',
  CRITICAL: '#ef4444',
}

const priorityChartData = computed(() => {
  const byPriority = analyticsStore.overviewStats?.tasksByPriority
  const labels = byPriority?.map(p => p.priority) ?? ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
  const data = byPriority?.map(p => p.count) ?? [3, 8, 14, 6]
  const bgColors = labels.map(l => priorityColors[l] ?? '#478FC8')

  return {
    labels,
    datasets: [
      {
        label: 'Tasks',
        data,
        backgroundColor: bgColors,
        borderRadius: 4,
        barThickness: 10,
      },
    ],
  }
})

const priorityChartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
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
        label: (ctx: any) => `${ctx.raw} Tasks`,
      },
    },
  },
  scales: {
    x: {
      min: 0,
      border: { display: false },
      ticks: {
        font: { size: 10 },
        color: '#94a3b8',
      },
      grid: {
        color: '#f1f5f9',
      },
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 10, weight: 'bold' as const },
        color: '#64748b',
      },
    },
  },
}))

function getPercent(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-4">
    <div>
      <p class="text-gray-900" style="font-size: 15px; font-weight: 800; letter-spacing: -0.3px">
        Team Performance
      </p>
      <p class="text-gray-400 mt-0.5" style="font-size: 12px">
        Tasks completed vs. assigned per member
      </p>
    </div>

    <!-- Member progress bars -->
    <div class="flex flex-col gap-3">
      <div v-for="member in teamData" :key="member.name" class="flex flex-col gap-1.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-lg flex items-center justify-center text-white"
              :style="{ background: member.fill, fontSize: '10px', fontWeight: 800 }"
            >
              {{ member.initial }}
            </div>
            <span class="text-gray-700" style="font-size: 13px; font-weight: 600">
              {{ member.name }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-gray-400" style="font-size: 12px">
              {{ member.completed }}/{{ member.tasks }}
            </span>
            <span
              class="px-1.5 py-0.5 rounded-md"
              :style="{
                fontSize: '11px',
                fontWeight: 700,
                color: member.fill,
                background: member.fill + '18',
              }"
            >
              {{ getPercent(member.completed, member.tasks) }}%
            </span>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${getPercent(member.completed, member.tasks)}%`, background: member.fill }"
          />
        </div>
      </div>
    </div>

    <!-- Priority bar chart -->
    <div style="height: 130px" class="mt-2">
      <ClientOnly>
        <Bar :data="priorityChartData" :options="priorityChartOptions" />
        <template #fallback>
          <div class="flex h-full items-center justify-center text-sm text-gray-400">Loading chart...</div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
