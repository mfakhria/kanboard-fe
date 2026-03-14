<script setup lang="ts">
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Download,
  CalendarDays,
  BarChart3,
  Users,
  Target,
  Zap,
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

type Period = 'Week' | 'Month' | 'Year'
const selectedPeriod = ref<Period>('Week')

const periodLabel = computed(() => {
  const now = new Date()
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  switch (selectedPeriod.value) {
    case 'Week': {
      const start = new Date(now)
      start.setDate(now.getDate() - 13)
      return `${fmt(start)} – ${fmt(now)}`
    }
    case 'Month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
    }
    case 'Year': {
      return `Q1 ${now.getFullYear() - 1} – Q4 ${now.getFullYear() - 1}`
    }
    default: return ''
  }
})

const statsCards = computed(() => {
  const os = analyticsStore.overviewStats?.taskStats
  return [
    {
      value: String(os?.completed ?? 0).padStart(2, '0'),
      label: 'Tasks Completed',
      description: 'Total tasks you have marked completed in this time frame.',
      icon: CheckCircle2,
      iconColor: 'text-[#478FC8]',
      iconBg: 'linear-gradient(135deg,#dbeafe,#eff6ff)',
      accent: 'linear-gradient(90deg,#478FC8,#5BA3D9)',
      trend: '+12%',
      trendUp: true,
    },
    {
      value: String(os?.inProgress ?? 0).padStart(2, '0'),
      label: 'Tasks In Progress',
      description: 'Number of tasks your team is actively working on.',
      icon: Clock,
      iconColor: 'text-emerald-600',
      iconBg: 'linear-gradient(135deg,#d1fae5,#ecfdf5)',
      accent: 'linear-gradient(90deg,#059669,#34d399)',
      trend: '+5%',
      trendUp: true,
    },
    {
      value: String(os?.overdue ?? 0).padStart(2, '0'),
      label: 'Tasks Overdue',
      description: 'Tasks yet to be completed that have passed their due date.',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'linear-gradient(135deg,#fee2e2,#fff1f2)',
      accent: 'linear-gradient(90deg,#dc2626,#f87171)',
      trend: '-3%',
      trendUp: false,
    },
  ]
})

const quickMetrics = computed(() => [
  {
    icon: Target,
    iconColor: 'text-[#478FC8]',
    accent: '#dbeafe',
    label: 'Completion Rate',
    value: '79%',
    sub: 'vs 62% last period',
  },
  {
    icon: Zap,
    iconColor: 'text-amber-600',
    accent: '#fef3c7',
    label: 'Avg. Task Speed',
    value: '2.4d',
    sub: 'Days to close a task',
  },
  {
    icon: Users,
    iconColor: 'text-purple-600',
    accent: '#ede9fe',
    label: 'Active Members',
    value: String(workspaceStore.members.length || 0),
    sub: 'Contributing this period',
  },
  {
    icon: BarChart3,
    iconColor: 'text-emerald-600',
    accent: '#d1fae5',
    label: 'Projects Active',
    value: String(analyticsStore.stats.runningProjects || 0),
    sub: 'Across all workspaces',
  },
])
</script>

<template>
  <LayoutPageContainer>
    <div class="analytics-page flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <div
              class="w-1 h-8 rounded-full"
              style="background: linear-gradient(to bottom, #478FC8, #3570A5)"
            />
            <h1
              style="font-size: clamp(20px, 2.5vw, 28px); font-weight: 900; letter-spacing: -0.8px; color: var(--analytics-title); line-height: 1.15"
            >
              Overview
            </h1>
          </div>
          <p class="pl-4" style="font-size: 13.5px; line-height: 1.6; color: var(--analytics-subtitle)">
            Track your team's
            <span
              style="font-weight: 600; background: linear-gradient(90deg, #478FC8, #5BA3D9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text"
            >performance</span>
            and project metrics.
          </p>
        </div>

        <!-- Controls -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Period toggle -->
          <div class="flex items-center gap-1 p-1 rounded-xl shadow-sm border" style="background: var(--analytics-control-bg); border-color: var(--analytics-control-border)">
            <button
              v-for="p in (['Week', 'Month', 'Year'] as Period[])"
              :key="p"
              :class="[
                'px-3.5 py-1.5 rounded-lg transition-all',
                selectedPeriod === p
                  ? 'bg-[#478FC8] text-white shadow-sm'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/80',
              ]"
              :style="{ fontSize: '13px', fontWeight: selectedPeriod === p ? 700 : 500, color: selectedPeriod === p ? '#fff' : 'var(--analytics-control-text)' }"
              @click="selectedPeriod = p"
            >
              {{ p }}
            </button>
          </div>

          <!-- Date range -->
          <div class="flex items-center gap-2 rounded-xl px-3 py-2 shadow-sm border" style="background: var(--analytics-control-bg); border-color: var(--analytics-control-border); color: var(--analytics-control-text)">
            <CalendarDays :size="14" />
            <span style="font-size: 13px">{{ periodLabel }}</span>
          </div>

          <!-- Export -->
          <button
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.30)"
          >
            <Download :size="14" />
            Export
          </button>
        </div>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="(stat, idx) in statsCards"
          :key="idx"
          class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
        >
          <!-- Accent bar -->
          <div class="h-1" :style="{ background: stat.accent }" />
          <div class="p-5 flex flex-col gap-4 flex-1">
            <div class="flex items-start justify-between">
              <div
                class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                :style="{ background: stat.iconBg }"
              >
                <component :is="stat.icon" :size="20" :class="stat.iconColor" />
              </div>
              <span
                :class="[
                  'flex items-center gap-1 px-2 py-0.5 rounded-full',
                  stat.trendUp ? 'bg-green-50 text-green-600 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-50 text-red-500 dark:bg-red-500/20 dark:text-red-300',
                ]"
                style="font-size: 11.5px; font-weight: 700"
              >
                <TrendingUp v-if="stat.trendUp" :size="11" />
                <TrendingDown v-else :size="11" />
                {{ stat.trend }}
              </span>
            </div>

            <div>
              <p
                class="text-gray-900 dark:text-gray-100"
                style="font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.1"
              >
                {{ stat.value }}
              </p>
              <p class="text-gray-500 dark:text-gray-300 mt-1" style="font-size: 13px; font-weight: 600">
                {{ stat.label }}
              </p>
              <p class="text-gray-400 dark:text-gray-500 mt-1" style="font-size: 12px; line-height: 1.5">
                {{ stat.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row 1: Task Performance & Project Trend -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsTaskPerformanceChart />
        <AnalyticsProjectTrendChart />
      </div>

      <!-- Charts Row 2: Team Performance & Task Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnalyticsTeamPerformanceChart />
        <AnalyticsTaskDistributionChart />
      </div>

      <!-- Quick Metrics Row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          v-for="(card, idx) in quickMetrics"
          :key="idx"
          class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-sm dark:shadow-black/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            :style="{ background: card.accent }"
          >
            <component :is="card.icon" :size="16" :class="card.iconColor" />
          </div>
          <div class="min-w-0">
            <p
              class="text-gray-900 dark:text-gray-100"
              style="font-size: 18px; font-weight: 900; letter-spacing: -0.5px; line-height: 1.2"
            >
              {{ card.value }}
            </p>
            <p class="text-gray-600 dark:text-gray-300 truncate" style="font-size: 12px; font-weight: 600">
              {{ card.label }}
            </p>
            <p class="text-gray-400 dark:text-gray-500 truncate" style="font-size: 11px">
              {{ card.sub }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </LayoutPageContainer>
</template>

<style scoped>
.analytics-page {
  --analytics-title: #0f172a;
  --analytics-subtitle: #64748b;
  --analytics-control-bg: #ffffff;
  --analytics-control-border: #f3f4f6;
  --analytics-control-text: #6b7280;
}

:root.dark .analytics-page {
  --analytics-title: #e5e7eb;
  --analytics-subtitle: #94a3b8;
  --analytics-control-bg: #0f172a;
  --analytics-control-border: #1f2937;
  --analytics-control-text: #cbd5e1;
}
</style>
