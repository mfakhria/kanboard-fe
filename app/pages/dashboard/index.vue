<script setup lang="ts">
import { ArrowUpRight, Upload, Mail, CheckCircle2, X, FolderKanban, CheckCheck, Zap, Hourglass, TrendingUp, ChevronRight, Timer } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

const projectStore = useProjectStore()
const analyticsStore = useAnalyticsStore()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  // Clean up old drag-and-drop widget order from localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('dashboard-widget-order')) localStorage.removeItem(key)
  })

  // Fetch workspaces first so other stores can use activeWorkspace
  await workspaceStore.fetchWorkspaces()
  // Then fetch projects, analytics, and pending invitations in parallel
  await Promise.all([
    projectStore.fetchProjects(),
    analyticsStore.fetchAnalytics(),
    projectStore.fetchPendingInvitations(),
  ])
})

const statsCards = computed(() => [
  {
    title: 'Total Projects',
    value: analyticsStore.stats.totalProjects,
    note: 'Increased from last month',
    highlighted: true,
    icon: FolderKanban,
    trendIcon: TrendingUp,
  },
  {
    title: 'Ended Projects',
    value: analyticsStore.stats.endedProjects,
    note: 'Increased from last month',
    highlighted: false,
    icon: CheckCircle2,
    trendIcon: TrendingUp,
  },
  {
    title: 'Running Projects',
    value: analyticsStore.stats.runningProjects,
    note: 'Increased from last month',
    highlighted: false,
    icon: Zap,
    trendIcon: TrendingUp,
  },
  {
    title: 'Pending Project',
    value: analyticsStore.stats.pendingProjects,
    note: 'On Discuss',
    highlighted: false,
    icon: Timer,
    trendIcon: ChevronRight,
  },
])

async function handleAcceptInvitation(token: string) {
  try {
    const result = await projectStore.acceptInvitation(token)
    // Refresh workspace list (user may now be a member of a new workspace)
    await workspaceStore.fetchWorkspaces()
    // Switch to the workspace containing the accepted project
    if (result?.project?.workspaceId) {
      const ws = workspaceStore.allWorkspaces.find(w => w.id === result.project.workspaceId)
      if (ws) {
        workspaceStore.setCurrentWorkspace(ws.id)
      }
    }
    // Refresh projects and analytics for the (now active) workspace
    await Promise.all([
      projectStore.fetchProjects(),
      analyticsStore.fetchAnalytics(),
    ])
  } catch (error) {
    console.error('Failed to accept invitation:', error)
  }
}

// ─── Dashboard Widgets (row 1 and row 2) ───
const widgetsRow1 = computed(() => [
  { id: 'weekly-chart', component: resolveComponent('AnalyticsWeeklyChart') },
  { id: 'reminders', component: resolveComponent('AnalyticsReminders') },
  { id: 'project-list', component: resolveComponent('AnalyticsProjectList') },
])

const widgetsRow2 = computed(() => [
  { id: 'team-collaboration', component: resolveComponent('AnalyticsTeamCollaboration') },
  { id: 'project-progress', component: resolveComponent('AnalyticsProjectProgress') },
  { id: 'time-tracker', component: resolveComponent('AnalyticsTimeTracker') },
])
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3570A5]" />
          <h1 class="text-[clamp(22px,3vw,30px)] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            Dashboard
          </h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-4 leading-relaxed">
          Plan, prioritize, and accomplish your tasks
          <span class="font-semibold bg-gradient-to-r from-[#478FC8] to-[#6db3e8] bg-clip-text text-transparent">with ease</span>.
        </p>
      </div>
      <UiButton variant="outline" class="gap-2 border-gray-200 dark:border-gray-700 hover:border-[#478FC8] hover:text-[#478FC8] bg-white dark:bg-gray-900 shadow-sm shrink-0">
        <Upload class="h-3.5 w-3.5" />
        Import Data
      </UiButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div
        v-for="(stat, index) in statsCards"
        :key="index"
        :class="[
          'relative flex flex-col gap-3 rounded-xl border p-5 transition-all duration-200 cursor-pointer overflow-hidden',
          stat.highlighted
            ? 'bg-[#478FC8] border-[#478FC8] text-white shadow-md shadow-[#478FC8]/20'
            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-[#478FC8]/30 hover:shadow-sm'
        ]"
      >
        <!-- Decorative circle -->
        <div v-if="stat.highlighted" class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />

        <!-- Header: icon + arrow -->
        <div class="flex items-center justify-between">
          <div
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
              stat.highlighted ? 'bg-white/20' : 'bg-[#EDF4FF] dark:bg-[#478FC8]/10'
            ]"
          >
            <component :is="stat.icon"
              :class="['h-[18px] w-[18px]', stat.highlighted ? 'text-blue-100' : 'text-[#478FC8]']" />
          </div>
          <ArrowUpRight :class="['h-4 w-4', stat.highlighted ? 'text-blue-200' : 'text-gray-300 dark:text-gray-600']" />
        </div>

        <!-- Label + Value -->
        <div>
          <p :class="['text-xs font-medium leading-snug', stat.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400']">
            {{ stat.title }}
          </p>
          <span :class="['text-[28px] font-extrabold leading-tight tracking-tight', stat.highlighted ? 'text-white' : 'text-gray-900 dark:text-white']">
            {{ stat.value }}
          </span>
        </div>

        <!-- Trend badge -->
        <div :class="['flex items-center gap-1.5 text-[11.5px] font-medium', stat.highlighted ? 'text-blue-200' : 'text-green-600 dark:text-green-400']">
          <component :is="stat.trendIcon" class="h-3 w-3" />
          <span>{{ stat.note }}</span>
        </div>
      </div>
    </div>

    <!-- Pending Invitations -->
    <div v-if="projectStore.pendingInvitations.length > 0" class="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4">
      <h3 class="text-sm font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
        <Mail class="h-4 w-4" />
        Pending Project Invitations ({{ projectStore.pendingInvitations.length }})
      </h3>
      <div class="space-y-2">
        <div
          v-for="inv in projectStore.pendingInvitations"
          :key="inv.id"
          class="flex items-center justify-between rounded-lg bg-white dark:bg-gray-900 p-3 border border-amber-100 dark:border-amber-900/30"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
              :style="{ backgroundColor: (inv.project.color || '#6366f1') + '20' }"
            >
              <UiLucideIcon :name="inv.project.icon || 'FolderKanban'" :size="16" :style="{ color: inv.project.color || '#6366f1' }" />
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ inv.project.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Invited by {{ inv.inviter.name }} as <strong>{{ inv.role }}</strong>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1 rounded-md bg-[#478FC8] hover:bg-[#3a7bb3] text-white px-3 py-1.5 text-xs font-medium transition-colors"
              @click="handleAcceptInvitation(inv.token)"
            >
              <CheckCircle2 class="h-3.5 w-3.5" />
              Accept
            </button>
            <button
              class="inline-flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors"
              @click="projectStore.declineInvitation(inv.token)"
            >
              <X class="h-3.5 w-3.5" />
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Widgets Row 1 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-for="widget in widgetsRow1" :key="widget.id">
        <component :is="widget.component" />
      </div>
    </div>

    <!-- Dashboard Widgets Row 2 -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div v-for="widget in widgetsRow2" :key="widget.id">
        <component :is="widget.component" />
      </div>
    </div>
  </LayoutPageContainer>
</template>
