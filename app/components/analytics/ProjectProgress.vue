<script setup lang="ts">
import { Zap } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const progress = computed(() => analyticsStore.projectProgress)

const total = computed(() => {
  const t = analyticsStore.stats.totalProjects
  return t > 0 ? t : 0
})
const completedCount = computed(() => analyticsStore.stats.endedProjects)
const runningCount = computed(() => analyticsStore.stats.runningProjects)
const pendingCount = computed(() => Math.max(0, total.value - completedCount.value - runningCount.value))

const pct = computed(() => progress.value.completed)

// Donut chart calculations
const cx = 70
const cy = 70
const r = 52
const strokeW = 14
const circumference = 2 * Math.PI * r

// Pie segments
const segments = computed(() => {
  const c = progress.value.completed || 0
  const ip = progress.value.inProgress || 0
  const p = progress.value.pending || 0
  const t = c + ip + p

  if (t === 0) {
    return [{ offset: 0, dash: circumference, gap: 0, color: '#e5e7eb' }]
  }

  const completedLen = (c / 100) * circumference
  const inProgressLen = (ip / 100) * circumference
  const pendingLen = (p / 100) * circumference

  let offset = 0
  const segs = []

  if (completedLen > 0) {
    segs.push({ offset: -offset, dash: completedLen, gap: circumference - completedLen, color: '#478FC8' })
    offset += completedLen
  }
  if (inProgressLen > 0) {
    segs.push({ offset: -offset, dash: inProgressLen, gap: circumference - inProgressLen, color: '#93c5fd' })
    offset += inProgressLen
  }
  if (pendingLen > 0 || segs.length === 0) {
    segs.push({ offset: -offset, dash: pendingLen || circumference, gap: circumference - (pendingLen || circumference), color: '#e5e7eb' })
  }

  return segs
})

const donutLegend = computed(() => [
  { name: 'Completed', color: '#478FC8' },
  { name: 'In Progress', color: '#93c5fd' },
  { name: 'Pending', color: '#e5e7eb' },
])
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <Zap class="h-4 w-4 text-[#478FC8]" />
        <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Project Progress</span>
      </div>
    </div>
    <!-- Content -->
    <div class="flex flex-col items-center justify-center gap-4 py-6 px-5 flex-1">
      <!-- Donut Chart -->
      <div class="relative">
        <svg :viewBox="`0 0 ${cx * 2} ${cy * 2}`" class="h-36 w-36 -rotate-90">
          <!-- Background -->
          <circle
            :cx="cx" :cy="cy" :r="r"
            fill="none" stroke="#e5e7eb" :stroke-width="strokeW"
            class="dark:stroke-gray-700"
          />
          <!-- Segments -->
          <circle
            v-for="(seg, i) in segments"
            :key="i"
            :cx="cx" :cy="cy" :r="r"
            fill="none"
            :stroke="seg.color"
            :stroke-width="strokeW"
            :stroke-dasharray="`${seg.dash} ${seg.gap || circumference - seg.dash}`"
            :stroke-dashoffset="seg.offset"
            stroke-linecap="round"
          />
        </svg>
        <!-- Center -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{{ pct }}%</span>
          <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500">Project Ended</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-4 flex-wrap justify-center">
        <div v-for="d in donutLegend" :key="d.name" class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: d.color }" />
          <span class="text-gray-500 dark:text-gray-400 text-[11px] font-medium">{{ d.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
