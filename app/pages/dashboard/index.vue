<script setup lang="ts">
import { ArrowUpRight, Upload } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

const projectStore = useProjectStore()
const analyticsStore = useAnalyticsStore()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  // Fetch workspaces first so other stores can use activeWorkspace
  await workspaceStore.fetchWorkspaces()
  // Then fetch projects and analytics in parallel
  await Promise.all([
    projectStore.fetchProjects(),
    analyticsStore.fetchAnalytics(),
  ])
})

const statsCards = computed(() => [
  {
    title: 'Total Projects',
    value: analyticsStore.stats.totalProjects,
    change: 'Increased from last month',
    highlighted: true,
    icon: ArrowUpRight,
  },
  {
    title: 'Ended Projects',
    value: analyticsStore.stats.endedProjects,
    change: 'Increased from last month',
    highlighted: false,
    icon: ArrowUpRight,
  },
  {
    title: 'Running Projects',
    value: analyticsStore.stats.runningProjects,
    change: 'Increased from last month',
    highlighted: false,
    icon: ArrowUpRight,
  },
  {
    title: 'Pending Project',
    value: analyticsStore.stats.pendingProjects,
    change: 'On Discuss',
    highlighted: false,
    icon: ArrowUpRight,
  },
])
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <LayoutPageHeader title="Dashboard" subtitle="Plan, prioritize, and accomplish your tasks with ease.">
      <template #actions>
        <UiButton variant="outline" class="gap-2">
          <Upload class="h-4 w-4" />
          Import Data
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div v-for="(stat, index) in statsCards" :key="index" :class="[
        'rounded-xl border p-5 transition-shadow hover:shadow-md',
        stat.highlighted
          ? 'bg-[#478FC8] text-white border-[#478FC8]'
          : 'bg-[#EDF4FF] dark:bg-gray-900 border-[#EDF4FF]'
      ]">
        <div class="flex items-center justify-between">
          <p :class="['text-sm font-medium', stat.highlighted ? 'text-gray-700' : 'text-gray-500 dark:text-gray-400']">
            {{ stat.title }}
          </p>
          <button
            :class="['rounded-full p-1.5 transition', stat.highlighted ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700']">
            <component :is="stat.icon"
              :class="['h-4 w-4', stat.highlighted ? 'text-white' : 'text-gray-400 dark:text-gray-500']" />
          </button>
        </div>
        <p :class="['mt-2 text-3xl font-bold', stat.highlighted ? 'text-white' : 'text-gray-900 dark:text-white']">
          {{ stat.value }}
        </p>
        <div class="mt-2 flex items-center gap-1.5">
          <span v-if="stat.change.includes('Increased')" :class="[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            stat.highlighted
              ? 'bg-white/20 text-white'
              : 'bg-[#EDF4FF] text-[#478FC8]'
          ]">
            <svg class="h-3 w-3" viewBox="0 0 12 12" fill="none">
              <path d="M6 2.5v7M3.5 5L6 2.5 8.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
            {{ stat.change }}
          </span>

          <span v-else :class="[
            'text-xs',
            stat.highlighted
              ? 'text-white/80'
              : 'text-gray-400 dark:text-gray-500'
          ]">
            {{ stat.change }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Left: Analytics Chart -->
      <div class="xl:col-span-1">
        <AnalyticsWeeklyChart />
      </div>

      <!-- Center: Reminders -->
      <div class="xl:col-span-1">
        <AnalyticsReminders />
      </div>

      <!-- Right: Project List -->
      <div class="xl:col-span-1">
        <AnalyticsProjectList />
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Team Collaboration -->
      <div class="xl:col-span-1">
        <AnalyticsTeamCollaboration />
      </div>

      <!-- Project Progress -->
      <div class="xl:col-span-1">
        <AnalyticsProjectProgress />
      </div>

      <!-- Time Tracker -->
      <div class="xl:col-span-1">
        <AnalyticsTimeTracker />
      </div>
    </div>
  </LayoutPageContainer>
</template>
