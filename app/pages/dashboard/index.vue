<script setup lang="ts">
import { ArrowUpRight, Upload, Mail, CheckCircle2, X, GripVertical, FolderKanban, CheckCheck, Zap, Hourglass, TrendingUp } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

const projectStore = useProjectStore()
const analyticsStore = useAnalyticsStore()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
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
  },
  {
    title: 'Ended Projects',
    value: analyticsStore.stats.endedProjects,
    note: 'Increased from last month',
    highlighted: false,
    icon: CheckCheck,
  },
  {
    title: 'Running Projects',
    value: analyticsStore.stats.runningProjects,
    note: 'Increased from last month',
    highlighted: false,
    icon: Zap,
  },
  {
    title: 'Pending Project',
    value: analyticsStore.stats.pendingProjects,
    note: 'On Discuss',
    highlighted: false,
    icon: Hourglass,
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

// ─── Dashboard Widget Drag & Drop ───
interface DashboardWidget {
  id: string
  label: string
  component: ReturnType<typeof resolveComponent>
}

const defaultWidgets = computed<DashboardWidget[]>(() => [
  { id: 'weekly-chart', label: 'Weekly Chart', component: resolveComponent('AnalyticsWeeklyChart') },
  { id: 'reminders', label: 'Reminders', component: resolveComponent('AnalyticsReminders') },
  { id: 'project-list', label: 'Project List', component: resolveComponent('AnalyticsProjectList') },
  { id: 'team-collaboration', label: 'Team Collaboration', component: resolveComponent('AnalyticsTeamCollaboration') },
  { id: 'project-progress', label: 'Project Progress', component: resolveComponent('AnalyticsProjectProgress') },
  { id: 'time-tracker', label: 'Time Tracker', component: resolveComponent('AnalyticsTimeTracker') },
])

const ALL_WIDGET_IDS = ['weekly-chart', 'reminders', 'project-list', 'team-collaboration', 'project-progress', 'time-tracker']

const authStore = useAuthStore()

const storageKey = computed(() => {
  const userId = authStore.currentUser?.id
  return userId ? `dashboard-widget-order-${userId}` : 'dashboard-widget-order'
})

function loadWidgetOrder(): string[] {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (saved) {
      const parsed = JSON.parse(saved) as string[]
      const validIds = new Set(ALL_WIDGET_IDS)
      if (parsed.every(id => validIds.has(id)) && parsed.length === ALL_WIDGET_IDS.length) {
        return parsed
      }
    }
  } catch {}
  return [...ALL_WIDGET_IDS]
}

const widgetOrder = ref<string[]>(loadWidgetOrder())

// Reload order when user changes (login switch)
watch(storageKey, () => {
  widgetOrder.value = loadWidgetOrder()
})

const orderedWidgets = computed(() => {
  const widgetMap = new Map(defaultWidgets.value.map(w => [w.id, w]))
  return widgetOrder.value.map(id => widgetMap.get(id)!).filter(Boolean)
})

watch(widgetOrder, (order) => {
  localStorage.setItem(storageKey.value, JSON.stringify(order))
}, { deep: true })

const widgetDragIndex = ref<number | null>(null)
const widgetDragOverIndex = ref<number | null>(null)

function onWidgetDragStart(index: number, e: DragEvent) {
  widgetDragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onWidgetDragOver(index: number, e: DragEvent) {
  e.preventDefault()
  widgetDragOverIndex.value = index
}

function onWidgetDragEnd() {
  if (
    widgetDragIndex.value !== null &&
    widgetDragOverIndex.value !== null &&
    widgetDragIndex.value !== widgetDragOverIndex.value
  ) {
    const arr = [...widgetOrder.value]
    const [moved] = arr.splice(widgetDragIndex.value, 1)
    if (moved) arr.splice(widgetDragOverIndex.value, 0, moved)
    widgetOrder.value = arr
  }
  widgetDragIndex.value = null
  widgetDragOverIndex.value = null
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <LayoutPageHeader title="Dashboard" subtitle="Plan, prioritize, and accomplish your tasks with ease.">
      <template #actions>
        <UiButton variant="outline" class="gap-2 border-gray-200 dark:border-gray-700 hover:border-[#478FC8] hover:text-[#478FC8] bg-white dark:bg-gray-900 shadow-sm">
          <Upload class="h-3.5 w-3.5" />
          Import Data
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="(stat, index) in statsCards"
        :key="index"
        :class="[
          'relative overflow-hidden rounded-xl border-0 p-5 shadow-sm transition-all hover:shadow-md',
          stat.highlighted
            ? 'text-white'
            : 'bg-white dark:bg-gray-900'
        ]"
        :style="stat.highlighted ? { background: 'linear-gradient(135deg, #478FC8 0%, #3570A5 100%)' } : {}"
      >
        <!-- Header: icon + title on left, arrow on right -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'flex h-8 w-8 items-center justify-center rounded-xl',
                stat.highlighted ? 'bg-white/20' : 'bg-[#EDF4FF] dark:bg-[#478FC8]/10'
              ]"
            >
              <component :is="stat.icon"
                :class="['h-4 w-4', stat.highlighted ? 'text-white' : 'text-[#478FC8]']" />
            </div>
            <p :class="['text-[13px]', stat.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400']">
              {{ stat.title }}
            </p>
          </div>
          <div
            :class="[
              'flex h-7 w-7 items-center justify-center rounded-full',
              stat.highlighted ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
            ]"
          >
            <ArrowUpRight
              :class="['h-3.5 w-3.5', stat.highlighted ? 'text-white' : 'text-gray-500 dark:text-gray-400']" />
          </div>
        </div>

        <!-- Value -->
        <p :class="['mt-2 mb-3 text-4xl font-bold', stat.highlighted ? 'text-white' : 'text-gray-800 dark:text-white']">
          {{ stat.value }}
        </p>

        <!-- Trend badge -->
        <div
          :class="[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px]',
            stat.highlighted
              ? 'bg-white/20 text-blue-50'
              : 'bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8]'
          ]"
        >
          <TrendingUp class="h-3 w-3" />
          <span>{{ stat.note }}</span>
        </div>

        <!-- Decorative circle for highlighted card -->
        <div v-if="stat.highlighted" class="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
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

    <!-- Dashboard Widgets (Draggable) -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div
        v-for="(widget, idx) in orderedWidgets"
        :key="widget.id"
        draggable="true"
        class="relative group transition-all"
        :class="[
          {
            'opacity-50 scale-95': widgetDragIndex === idx,
            'ring-2 ring-[#478FC8] ring-offset-2 rounded-xl': widgetDragOverIndex === idx && widgetDragIndex !== idx,
          },
        ]"
        @dragstart="onWidgetDragStart(idx, $event)"
        @dragover="onWidgetDragOver(idx, $event)"
        @dragend="onWidgetDragEnd"
      >
        <!-- Grip Handle -->
        <div class="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors opacity-0 group-hover:opacity-100">
          <GripVertical class="h-5 w-5" />
        </div>
        <component :is="widget.component" />
      </div>
    </div>
  </LayoutPageContainer>
</template>
