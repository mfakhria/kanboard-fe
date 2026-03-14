<script setup lang="ts">
import { BarChart2, TrendingUp } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()

const days = computed(() => analyticsStore.weeklyProductivity.labels)
const data = computed(() => analyticsStore.weeklyProductivity.data)
const weeklyTotal = computed(() => data.value.reduce((sum, v) => sum + v, 0))
const hasData = computed(() => data.value.some(v => v > 0))

// Generate SVG area chart
const chartWidth = 300
const chartHeight = 150
const padding = { top: 15, right: 15, bottom: 5, left: 30 }
const innerW = chartWidth - padding.left - padding.right
const innerH = chartHeight - padding.top - padding.bottom

const maxValue = computed(() => {
  const max = Math.max(...data.value)
  return max > 0 ? max : 10
})

// Y-axis scale (nice round numbers)
const yTicks = computed(() => {
  const max = maxValue.value
  const step = Math.ceil(max / 4) || 1
  const ticks = []
  for (let i = 0; i <= 4; i++) {
    ticks.push(i * step)
  }
  return ticks
})

const yMax = computed(() => yTicks.value[yTicks.value.length - 1] || 10)

const points = computed(() => {
  return data.value.map((v, i) => {
    const x = padding.left + (i / Math.max(data.value.length - 1, 1)) * innerW
    const y = padding.top + innerH - (v / yMax.value) * innerH
    return { x, y, value: v }
  })
})

const linePath = computed(() => {
  if (points.value.length === 0) return ''
  const pts = points.value
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1]
    const p1 = pts[i]
    const cpx1 = p0.x + (p1.x - p0.x) * 0.4
    const cpx2 = p0.x + (p1.x - p0.x) * 0.6
    d += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
})

const areaPath = computed(() => {
  if (points.value.length === 0) return ''
  const bottom = padding.top + innerH
  return `${linePath.value} L ${points.value[points.value.length - 1].x} ${bottom} L ${points.value[0].x} ${bottom} Z`
})

// Horizontal grid lines
const gridLines = computed(() => {
  return yTicks.value.map((tick) => {
    const y = padding.top + innerH - (tick / yMax.value) * innerH
    return { y, label: tick }
  })
})
</script>

<template>
  <UiCard class="h-full border border-gray-100 dark:border-gray-800 shadow-sm">
    <UiCardHeader class="px-5 pt-5 pb-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EDF4FF] dark:bg-[#478FC8]/10">
            <BarChart2 class="h-3.5 w-3.5 text-[#478FC8]" />
          </div>
          <UiCardTitle class="text-sm text-gray-700 dark:text-gray-200">Project Analytics</UiCardTitle>
        </div>
        <div class="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
          <span class="h-2 w-2 rounded-full bg-[#478FC8]" />
          {{ weeklyTotal }} tasks this week
        </div>
      </div>
    </UiCardHeader>
    <UiCardContent class="px-2 pb-4">
      <!-- Empty state -->
      <div v-if="!hasData" class="flex flex-col items-center justify-center h-44 text-gray-400 dark:text-gray-500">
        <TrendingUp class="h-10 w-10 mb-3 opacity-20" />
        <p class="text-xs font-medium">No activity this week</p>
        <p class="text-[10px] mt-0.5 text-gray-300 dark:text-gray-600">Complete tasks to see your chart</p>
      </div>

      <!-- Area Chart SVG -->
      <svg v-else :viewBox="`0 0 ${chartWidth} ${chartHeight + 25}`" class="w-full h-44" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#478FC8" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#478FC8" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Y-axis labels + grid lines -->
        <template v-for="(line, i) in gridLines" :key="'grid-' + i">
          <line
            :x1="padding.left"
            :y1="line.y"
            :x2="chartWidth - padding.right"
            :y2="line.y"
            stroke="#f0f0f0"
            stroke-dasharray="3 3"
            class="dark:stroke-gray-800"
          />
          <text
            :x="padding.left - 5"
            :y="line.y + 3"
            text-anchor="end"
            class="fill-gray-300 dark:fill-gray-600"
            style="font-size: 9px;"
          >
            {{ line.label }}
          </text>
        </template>

        <!-- Area fill -->
        <path
          :d="areaPath"
          fill="url(#areaGradient)"
        />

        <!-- Line -->
        <path
          :d="linePath"
          fill="none"
          stroke="#478FC8"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Dots + value labels -->
        <template v-for="(pt, i) in points" :key="'pt-' + i">
          <!-- Value label above dot -->
          <text
            v-if="pt.value > 0"
            :x="pt.x"
            :y="pt.y - 8"
            text-anchor="middle"
            class="fill-[#478FC8]"
            style="font-size: 9px; font-weight: 600;"
          >
            {{ pt.value }}
          </text>
          <!-- Dot outer glow -->
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="5"
            fill="#478FC8"
            fill-opacity="0.15"
          />
          <!-- Dot -->
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="3"
            fill="#478FC8"
            stroke="white"
            stroke-width="2"
            class="dark:stroke-gray-900"
          />
        </template>

        <!-- X-axis labels -->
        <text
          v-for="(pt, i) in points"
          :key="'label-' + i"
          :x="pt.x"
          :y="chartHeight + 18"
          text-anchor="middle"
          class="fill-gray-400 dark:fill-gray-500"
          style="font-size: 10px;"
        >
          {{ days[i] }}
        </text>
      </svg>
    </UiCardContent>
  </UiCard>
</template>
