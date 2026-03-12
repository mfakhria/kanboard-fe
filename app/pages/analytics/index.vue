<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Download,
  CalendarDays,
  ChevronDown,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

const analyticsStore = useAnalyticsStore()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
  const wsId = workspaceStore.activeWorkspace?.id
  if (wsId) {
    await Promise.all([
      analyticsStore.fetchAnalytics(wsId),
      analyticsStore.fetchOverviewStats(wsId),
    ])
  }
})

const selectedPeriod = ref('month')
const periodOptions = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter' },
  { label: 'Year', value: 'year' },
]

const dateRange = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = now
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  return `${fmt(start)} - ${fmt(end)}`
})

const statsCards = computed(() => {
  const os = analyticsStore.overviewStats?.taskStats
  return [
  {
    title: 'Task Completed',
    value: String(os?.completed ?? 0).padStart(2, '0'),
    change: 0,
    description: 'This is the total number of tasks you have marked completed in this time frame.',
    icon: CheckCircle2,
    color: 'text-[#478FC8]',
    bgColor: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10',
    iconBg: 'bg-[#478FC8]/10',
  },
  {
    title: 'Task in Progress',
    value: String(os?.inProgress ?? 0).padStart(2, '0'),
    change: 0,
    description: 'This is the number of tasks your team is actively working on.',
    icon: Clock,
    color: 'text-[#84cc16]',
    bgColor: 'bg-lime-50 dark:bg-lime-900/10',
    iconBg: 'bg-lime-100 dark:bg-lime-900/20',
  },
  {
    title: 'Task Overdue',
    value: String(os?.overdue ?? 0).padStart(2, '0'),
    change: 0,
    description: 'This is the number of tasks that are yet to be completed and has passed their due date.',
    icon: AlertTriangle,
    color: 'text-[#dc2626]',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
    iconBg: 'bg-red-100 dark:bg-red-900/20',
  },
]})
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">Overview</h1>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <!-- Period Selector -->
        <div class="relative">
          <UiSelect
            v-model="selectedPeriod"
            :options="periodOptions"
            class="w-28 text-sm"
          />
        </div>

        <!-- Date Range -->
        <div class="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
          <CalendarDays class="h-4 w-4" />
          <span>{{ dateRange }}</span>
        </div>

        <!-- Export Button -->
        <UiButton class="gap-2">
          <Download class="h-4 w-4" />
          Export
        </UiButton>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="(stat, index) in statsCards"
        :key="index"
        class="relative overflow-hidden"
      >
        <UiCardContent class="p-5">
          <div class="flex items-start justify-between">
            <div :class="['flex h-10 w-10 items-center justify-center rounded-lg', stat.iconBg]">
              <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
            </div>
            <div class="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5">
              <ArrowUpRight class="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{{ stat.change }}%</span>
            </div>
          </div>
          <p class="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
          <p class="mt-1 text-xs text-muted-foreground leading-relaxed">{{ stat.description }}</p>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Charts Row 1: Task Performance & Project Trend -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <AnalyticsTaskPerformanceChart />
      <AnalyticsProjectTrendChart />
    </div>

    <!-- Charts Row 2: Team Performance & Task Distribution -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <AnalyticsTeamPerformanceChart />
      <AnalyticsTaskDistributionChart />
    </div>
  </LayoutPageContainer>
</template>
