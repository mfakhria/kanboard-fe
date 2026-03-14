<script setup lang="ts">
import { PieChart as PieChartIcon } from 'lucide-vue-next'

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
const cx = 80
const cy = 80
const r = 60
const strokeW = 18
const circumference = 2 * Math.PI * r

// Pie segments
const segments = computed(() => {
  const c = progress.value.completed || 0
  const ip = progress.value.inProgress || 0
  const p = progress.value.pending || 0
  const t = c + ip + p

  if (t === 0) {
    return [{ offset: 0, dash: circumference, color: '#e5e7eb' }]
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
</script>

<template>
  <UiCard class="h-full border border-gray-100 dark:border-gray-800 shadow-sm">
    <UiCardHeader class="px-5 pt-5 pb-2">
      <div class="flex items-center gap-2">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <PieChartIcon class="h-3.5 w-3.5 text-purple-500" />
        </div>
        <UiCardTitle class="text-sm text-gray-700 dark:text-gray-200">Project Progress</UiCardTitle>
      </div>
    </UiCardHeader>
    <UiCardContent class="px-5 pb-5 flex flex-col items-center gap-4">
      <!-- Donut Chart -->
      <div class="relative h-48 w-48">
        <svg :viewBox="`0 0 ${cx * 2} ${cy * 2}`" class="h-full w-full -rotate-90">
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
          <span class="text-3xl font-bold text-gray-800 dark:text-white">{{ pct }}%</span>
          <span class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">Project Ended</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-5 text-[11px] text-gray-500 dark:text-gray-400">
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-[#478FC8]" />
          Completed
        </div>
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-[#93c5fd]" />
          In Progress
        </div>
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full border-[1.5px] border-dashed border-gray-400 bg-gray-200 dark:bg-gray-700 dark:border-gray-500" />
          Pending
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid w-full grid-cols-3 gap-2 mt-1">
        <div class="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5">
          <span class="text-lg font-bold text-[#478FC8]">{{ completedCount }}</span>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 text-center">Completed</span>
        </div>
        <div class="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5">
          <span class="text-lg font-bold text-[#93c5fd]">{{ runningCount }}</span>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 text-center">In Progress</span>
        </div>
        <div class="flex flex-col items-center rounded-xl bg-gray-50 dark:bg-gray-800/50 p-2.5">
          <span class="text-lg font-bold text-gray-400">{{ pendingCount }}</span>
          <span class="text-[10px] text-gray-400 dark:text-gray-500 text-center">Pending</span>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
