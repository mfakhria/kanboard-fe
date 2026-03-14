<script setup lang="ts">
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Loader2,
  ExternalLink,
  Pencil,
  MoreHorizontal,
  ArrowUpRight,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
  await projectStore.fetchProjects()
})

// ─── View mode ───
const viewMode = ref<'card' | 'list'>('card')

// ─── Search & filters ───
const searchQuery = ref('')
const statusFilter = ref('')

// ─── Project card data from API ───
interface ProjectCard {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'pending' | 'overdue'
  pic: { name: string; avatar: string }
  completedTasks: number
  totalTasks: number
  deadline: string
  progress: number
  icon: string
  iconBg: string
  color: string
  gradientColor: string
}

const iconBgOptions = [
  'bg-blue-100 dark:bg-blue-900/30',
  'bg-emerald-100 dark:bg-emerald-900/30',
  'bg-amber-100 dark:bg-amber-900/30',
  'bg-violet-100 dark:bg-violet-900/30',
  'bg-orange-100 dark:bg-orange-900/30',
  'bg-teal-100 dark:bg-teal-900/30',
]

const gradientOptions = [
  'from-[#478FC8] to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
]

// ─── Combine API data ───
const projectCards = computed<ProjectCard[]>(() => {
  const now = new Date()
  return projectStore.projects.map((p, idx) => {
    let status: ProjectCard['status'] = 'pending'
    if (p.status === 'COMPLETED') {
      status = 'completed'
    } else if (p.status === 'ACTIVE') {
      if (p.dueDate && new Date(p.dueDate) < now) {
        status = 'overdue'
      } else {
        status = 'in_progress'
      }
    }

    return {
      id: p.id,
      name: p.name,
      status,
      pic: { name: p.pic?.name || '-', avatar: p.pic?.avatar || '' },
      completedTasks: p.completedTasks ?? 0,
      totalTasks: p.totalTasks ?? 0,
      deadline: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      progress: (p.totalTasks ?? 0) > 0 ? Math.round(((p.completedTasks ?? 0) / (p.totalTasks ?? 0)) * 100) : 0,
      icon: p.icon || 'FolderKanban',
      iconBg: p.color ? '' : (iconBgOptions[idx % iconBgOptions.length] ?? 'bg-blue-100 dark:bg-blue-900/30'),
      color: p.color || '',
      gradientColor: gradientOptions[idx % gradientOptions.length] ?? gradientOptions[0] ?? 'from-[#478FC8] to-indigo-600',
    }
  })
})

// ─── Filtered projects ───
const filteredProjects = computed(() => {
  let result = projectCards.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q))
  }
  if (statusFilter.value) {
    result = result.filter(p => p.status === statusFilter.value)
  }
  return result
})

// Ordered + filtered
const filteredOrderedProjects = computed(() => {
  const ids = new Set(filteredProjects.value.map(p => p.id))
  return orderedProjectCards.value.filter(p => ids.has(p.id))
})

// ─── Stats ───
const stats = computed(() => {
  const all = projectCards.value
  return {
    total: all.length,
    completed: all.filter(p => p.status === 'completed').length,
    inProgress: all.filter(p => p.status === 'in_progress').length,
    pending: all.filter(p => p.status === 'pending').length,
    overdue: all.filter(p => p.status === 'overdue').length,
  }
})

const activeStatFilter = ref('')

function toggleStatFilter(status: string) {
  if (activeStatFilter.value === status) {
    activeStatFilter.value = ''
    statusFilter.value = ''
  } else {
    activeStatFilter.value = status
    statusFilter.value = status
  }
}

const statCards = computed(() => [
  {
    key: '',
    title: 'Total Projects',
    value: stats.value.total,
    note: 'All projects',
    highlighted: activeStatFilter.value === '',
    icon: FolderKanban,
    iconBg: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10',
    iconColor: 'text-[#478FC8]',
  },
  {
    key: 'completed',
    title: 'Completed',
    value: stats.value.completed,
    note: 'Finished projects',
    highlighted: activeStatFilter.value === 'completed',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'in_progress',
    title: 'In Progress',
    value: stats.value.inProgress,
    note: 'Increased from last month',
    highlighted: activeStatFilter.value === 'in_progress',
    icon: Loader2,
    iconBg: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10',
    iconColor: 'text-[#478FC8]',
  },
  {
    key: 'pending',
    title: 'Pending',
    value: stats.value.pending,
    note: 'On Discuss',
    highlighted: activeStatFilter.value === 'pending',
    icon: Clock,
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500',
  },
  {
    key: 'overdue',
    title: 'Overdue',
    value: stats.value.overdue,
    note: 'Need attention',
    highlighted: activeStatFilter.value === 'overdue',
    icon: AlertTriangle,
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
  },
])

// ─── Pagination ───
const currentPage = ref(1)
const perPage = 6
const showAll = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredOrderedProjects.value.length / perPage)))

const paginatedProjects = computed(() => {
  if (showAll.value) return filteredOrderedProjects.value
  const start = (currentPage.value - 1) * perPage
  return filteredOrderedProjects.value.slice(start, start + perPage)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    showAll.value = false
  }
}

// ─── Status helpers ───
const statusConfig: Record<string, { label: string; class: string; dotClass: string }> = {
  completed: {
    label: 'Completed',
    class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  in_progress: {
    label: 'In progress',
    class: 'bg-[#EDF4FF] text-[#478FC8] dark:bg-[#478FC8]/15 dark:text-[#6db3e8]',
    dotClass: 'bg-[#478FC8]',
  },
  pending: {
    label: 'Pending',
    class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    dotClass: 'bg-gray-400',
  },
  overdue: {
    label: 'Overdue',
    class: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    dotClass: 'bg-red-500',
  },
}

function getProgressColor(progress: number) {
  if (progress >= 100) return 'bg-emerald-500'
  if (progress >= 50) return 'bg-[#478FC8]'
  if (progress >= 20) return 'bg-amber-500'
  return 'bg-gray-300 dark:bg-gray-600'
}

function getProgressTextColor(progress: number) {
  if (progress >= 100) return 'text-emerald-600 dark:text-emerald-400'
  if (progress >= 50) return 'text-[#478FC8]'
  if (progress >= 20) return 'text-amber-600 dark:text-amber-400'
  return 'text-gray-500 dark:text-gray-400'
}

// Reset page on filter
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
  showAll.value = false
})

// ─── Drag & Drop reorder ───
const authStore = useAuthStore()
const PROJECT_ORDER_KEY = computed(() => {
  const userId = authStore.currentUser?.id
  return userId ? `project-order-${userId}` : 'project-order'
})

function loadProjectOrder(): string[] {
  try {
    const saved = localStorage.getItem(PROJECT_ORDER_KEY.value)
    if (saved) return JSON.parse(saved) as string[]
  } catch {}
  return []
}

const projectOrder = ref<string[]>(loadProjectOrder())
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

watch(PROJECT_ORDER_KEY, () => {
  projectOrder.value = loadProjectOrder()
})

watch(() => projectStore.projects, (projects) => {
  const newIds = projects.map(p => p.id)
  const savedOrder = projectOrder.value.filter(id => newIds.includes(id))
  const newProjects = newIds.filter(id => !projectOrder.value.includes(id))
  projectOrder.value = [...savedOrder, ...newProjects]
}, { immediate: true })

watch(projectOrder, (order) => {
  localStorage.setItem(PROJECT_ORDER_KEY.value, JSON.stringify(order))
}, { deep: true })

const orderedProjectCards = computed<ProjectCard[]>(() => {
  const cardMap = new Map(projectCards.value.map(c => [c.id, c]))
  const ordered: ProjectCard[] = []
  for (const id of projectOrder.value) {
    const card = cardMap.get(id)
    if (card) ordered.push(card)
  }
  for (const card of projectCards.value) {
    if (!projectOrder.value.includes(card.id)) ordered.push(card)
  }
  return ordered
})

function onDragStart(index: number) {
  dragIndex.value = index
}

function onDragOver(index: number, e: DragEvent) {
  e.preventDefault()
  dragOverIndex.value = index
}

function onDragEnd() {
  if (dragIndex.value !== null && dragOverIndex.value !== null && dragIndex.value !== dragOverIndex.value) {
    const currentItems = filteredOrderedProjects.value
    const fromId = currentItems[dragIndex.value]?.id
    const toId = currentItems[dragOverIndex.value]?.id
    if (fromId && toId) {
      const arr = [...projectOrder.value]
      const fromIdx = arr.indexOf(fromId)
      const toIdx = arr.indexOf(toId)
      if (fromIdx !== -1 && toIdx !== -1) {
        arr.splice(fromIdx, 1)
        arr.splice(toIdx, 0, fromId)
        projectOrder.value = arr
      }
    }
  }
  dragIndex.value = null
  dragOverIndex.value = null
}

// ─── Create Project Dialog ───
const showCreateProject = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')
const newProjectColor = ref('#6366f1')
const newProjectDueDate = ref('')
const newProjectPicId = ref('')
const newProjectIcon = ref('FolderKanban')
const newProjectVisibility = ref<'PUBLIC' | 'PRIVATE'>('PUBLIC')
const isCreatingProject = ref(false)

const wsMembers = computed(() => workspaceStore.members)

function resetCreateForm() {
  newProjectName.value = ''
  newProjectDescription.value = ''
  newProjectColor.value = '#6366f1'
  newProjectDueDate.value = ''
  newProjectPicId.value = ''
  newProjectIcon.value = 'FolderKanban'
  newProjectVisibility.value = 'PUBLIC'
}

async function handleCreateProject() {
  if (!newProjectName.value.trim()) return
  const wsId = workspaceStore.activeWorkspace?.id
  if (!wsId) {
    alert('No workspace selected. Please create or select a workspace first.')
    return
  }
  isCreatingProject.value = true
  try {
    await projectStore.createProject({
      name: newProjectName.value.trim(),
      description: newProjectDescription.value.trim() || undefined,
      workspaceId: wsId,
      color: newProjectColor.value || undefined,
      dueDate: newProjectDueDate.value || undefined,
      picId: newProjectPicId.value || undefined,
      icon: newProjectIcon.value || undefined,
      visibility: newProjectVisibility.value,
    })
    resetCreateForm()
    showCreateProject.value = false
  } catch (error) {
    console.error('Failed to create project:', error)
  } finally {
    isCreatingProject.value = false
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <LayoutPageContainer>
    <!-- ═══ Page Header ═══ -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3a7bb3]" />
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Projects</h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-4">
          Manage and track <span class="font-semibold text-[#478FC8]">all</span> your projects in one place.
        </p>
      </div>
      <UiButton
        class="gap-2 bg-[#478FC8] hover:bg-[#3a7bb3] text-white shadow-sm shadow-[#478FC8]/20 hover:shadow-md transition-all shrink-0"
        @click="showCreateProject = true"
      >
        <Plus class="h-4 w-4" />
        Add Project
      </UiButton>
    </div>

    <!-- ═══ Stats Cards (same style as Dashboard) ═══ -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <button
        v-for="stat in statCards"
        :key="stat.key"
        :class="[
          'relative overflow-hidden rounded-xl border-0 p-5 shadow-sm transition-all hover:shadow-md text-left cursor-pointer',
          stat.highlighted
            ? 'text-white'
            : 'bg-white dark:bg-gray-900'
        ]"
        :style="stat.highlighted ? { background: 'linear-gradient(135deg, #478FC8 0%, #3570A5 100%)' } : {}"
        @click="toggleStatFilter(stat.key)"
      >
        <!-- Header: icon + title on left, arrow on right -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'flex h-8 w-8 items-center justify-center rounded-xl',
                stat.highlighted ? 'bg-white/20' : stat.iconBg
              ]"
            >
              <component :is="stat.icon"
                :class="['h-4 w-4', stat.highlighted ? 'text-white' : stat.iconColor]" />
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
      </button>
    </div>

    <!-- ═══ Filters & View Toggle ═══ -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Search -->
      <div class="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 focus-within:border-[#478FC8] transition-all min-w-[200px]">
        <Search class="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search project..."
          class="flex-1 bg-transparent text-[13px] text-gray-700 dark:text-gray-300 outline-none placeholder:text-gray-400"
        />
      </div>

      <!-- Status filter -->
      <div class="relative">
        <select
          v-model="statusFilter"
          class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3.5 pr-8 text-[13px] font-medium text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none transition-all cursor-pointer"
        >
          <option value="">Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
        <ChevronDown class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
      </div>

      <!-- More filters -->
      <button class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-[13px] font-medium text-gray-500 dark:text-gray-400 hover:border-[#478FC8] hover:text-[#478FC8] transition-all">
        <SlidersHorizontal class="h-3.5 w-3.5" />
        More filters
      </button>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- View Toggle -->
      <div class="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        <button
          :class="[
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all',
            viewMode === 'list'
              ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
          @click="viewMode = 'list'"
        >
          <List class="h-3.5 w-3.5" />
          List
        </button>
        <button
          :class="[
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all',
            viewMode === 'card'
              ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-800 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
          @click="viewMode = 'card'"
        >
          <LayoutGrid class="h-3.5 w-3.5" />
          Card
        </button>
      </div>
    </div>

    <!-- ═══ Project Cards Grid ═══ -->
    <div v-if="viewMode === 'card'" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="(project, idx) in paginatedProjects"
        :key="project.id"
        draggable="true"
        class="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all"
        :class="{
          'opacity-50 scale-95': dragIndex === idx,
          'ring-2 ring-[#478FC8] ring-offset-2': dragOverIndex === idx && dragIndex !== idx,
        }"
        @dragstart="onDragStart(idx)"
        @dragover="onDragOver(idx, $event)"
        @dragend="onDragEnd"
      >
        <!-- Gradient top bar -->
        <div :class="['h-1.5 w-full bg-gradient-to-r', project.gradientColor]" />

        <div class="flex flex-col gap-4 p-5 flex-1">
          <!-- Title Row -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-3">
              <div
                :class="['flex h-9 w-9 items-center justify-center rounded-xl shrink-0', project.iconBg]"
                :style="project.color ? { backgroundColor: project.color + '20' } : {}"
              >
                <UiLucideIcon :name="project.icon" :size="18" :style="project.color ? { color: project.color } : {}" />
              </div>
              <h3 class="text-[15px] font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[180px]">
                {{ project.name }}
              </h3>
            </div>
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
                  statusConfig[project.status]?.class
                ]"
              >
                <span :class="['h-1.5 w-1.5 rounded-full', statusConfig[project.status]?.dotClass]" />
                {{ statusConfig[project.status]?.label }}
              </span>
              <button class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p class="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">PIC</p>
              <div class="flex items-center gap-2">
                <div class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white shrink-0">
                  {{ getInitials(project.pic.name) }}
                </div>
                <span class="text-[12.5px] font-medium text-gray-700 dark:text-gray-300 truncate">
                  {{ project.pic.name.split(' ').slice(0, 2).join(' ') }}
                </span>
              </div>
            </div>
            <div>
              <p class="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Deadline</p>
              <span class="text-[12.5px] font-medium text-gray-700 dark:text-gray-300">{{ project.deadline }}</span>
            </div>
            <div>
              <p class="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Tasks</p>
              <span class="text-[12.5px] font-semibold text-gray-700 dark:text-gray-300">
                {{ project.completedTasks }}<span class="text-gray-400 dark:text-gray-500">/{{ project.totalTasks }}</span>
              </span>
            </div>
            <div>
              <p class="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">Progress</p>
              <span :class="['text-[13px] font-bold', getProgressTextColor(project.progress)]">{{ project.progress }}%</span>
            </div>
          </div>

          <!-- Progress Bar -->
          <div>
            <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all duration-500', getProgressColor(project.progress)]"
                :style="{ width: `${project.progress}%` }"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
            <NuxtLink :to="`/project/${project.id}`" class="flex-1">
              <button class="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <ExternalLink class="h-3.5 w-3.5" />
                View Details
              </button>
            </NuxtLink>
            <NuxtLink :to="`/project/${project.id}`">
              <button class="flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-semibold text-[#478FC8] hover:bg-[#EDF4FF] dark:hover:bg-[#478FC8]/10 transition-all">
                <Pencil class="h-3 w-3" />
                Edit
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Project List View ═══ -->
    <div v-else class="space-y-2">
      <!-- List header -->
      <div class="flex items-center gap-4 px-5 py-2">
        <div class="w-8" />
        <div class="flex-1 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Name</div>
        <div class="w-28 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:block">Status</div>
        <div class="w-28 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden md:block">PIC</div>
        <div class="w-32 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:block">Progress</div>
        <div class="w-20 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden sm:block">Deadline</div>
        <div class="w-16" />
      </div>

      <!-- List rows -->
      <div
        v-for="(project, idx) in paginatedProjects"
        :key="project.id"
        draggable="true"
        class="group flex items-center gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-3.5 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all"
        :class="{
          'opacity-50': dragIndex === idx,
          'ring-2 ring-[#478FC8]': dragOverIndex === idx && dragIndex !== idx,
        }"
        @dragstart="onDragStart(idx)"
        @dragover="onDragOver(idx, $event)"
        @dragend="onDragEnd"
      >
        <div
          :class="['flex h-8 w-8 items-center justify-center rounded-lg shrink-0', project.iconBg]"
          :style="project.color ? { backgroundColor: project.color + '20' } : {}"
        >
          <UiLucideIcon :name="project.icon" :size="16" :style="project.color ? { color: project.color } : {}" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ project.name }}</p>
        </div>
        <div class="w-28 hidden lg:block">
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              statusConfig[project.status]?.class
            ]"
          >
            <span :class="['h-1.5 w-1.5 rounded-full', statusConfig[project.status]?.dotClass]" />
            {{ statusConfig[project.status]?.label }}
          </span>
        </div>
        <div class="w-28 hidden md:flex items-center gap-2">
          <div class="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white shrink-0">
            {{ getInitials(project.pic.name) }}
          </div>
          <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ project.pic.name.split(' ')[0] }}</span>
        </div>
        <div class="w-32 hidden lg:block">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[11px] text-gray-500">{{ project.progress }}%</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              :class="['h-full rounded-full transition-all', getProgressColor(project.progress)]"
              :style="{ width: `${project.progress}%` }"
            />
          </div>
        </div>
        <span class="text-xs text-gray-500 text-right hidden sm:block min-w-[80px]">{{ project.deadline }}</span>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <NuxtLink :to="`/project/${project.id}`">
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#478FC8] transition-all">
              <ExternalLink class="h-3.5 w-3.5" />
            </button>
          </NuxtLink>
          <NuxtLink :to="`/project/${project.id}`">
            <button class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-all">
              <Pencil class="h-3.5 w-3.5" />
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ═══ Pagination ═══ -->
    <div class="flex items-center justify-between pt-2">
      <p class="text-[13px] text-gray-500 dark:text-gray-400">
        Showing
        <span class="font-semibold text-gray-800 dark:text-white">
          {{ showAll ? 1 : (currentPage - 1) * perPage + 1 }} to {{ showAll ? filteredOrderedProjects.length : Math.min(currentPage * perPage, filteredOrderedProjects.length) }}
        </span>
        of
        <span class="font-semibold text-gray-800 dark:text-white">{{ filteredOrderedProjects.length }}</span>
        entries
      </p>

      <div class="flex items-center gap-2">
        <button
          :disabled="currentPage <= 1 || showAll"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-3.5 w-3.5" />
        </button>
        <template v-if="!showAll">
          <button
            v-for="page in Math.min(totalPages, 5)"
            :key="page"
            :class="[
              'flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold transition-all',
              currentPage === page
                ? 'bg-[#478FC8] text-white shadow-sm shadow-[#478FC8]/20'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:text-gray-800'
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>
        <button
          :disabled="currentPage >= totalPages || showAll"
          class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          @click="goToPage(currentPage + 1)"
        >
          <ChevronRight class="h-3.5 w-3.5" />
        </button>
        <button
          class="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#478FC8] hover:bg-[#EDF4FF] dark:hover:bg-[#478FC8]/10 transition-all"
          @click="showAll = !showAll"
        >
          {{ showAll ? 'Paginate' : 'Show All' }}
        </button>
      </div>
    </div>
  </LayoutPageContainer>

  <!-- Create Project Dialog -->
  <UiDialog v-model:open="showCreateProject" title="Create Project" description="Add a new project to your workspace.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="handleCreateProject">
        <div>
          <UiLabel for="project-name">Project Name</UiLabel>
          <UiInput id="project-name" v-model="newProjectName" placeholder="e.g. Website Redesign" class="mt-1.5" />
        </div>
        <div>
          <UiLabel for="project-desc">Description</UiLabel>
          <UiTextarea id="project-desc" v-model="newProjectDescription" placeholder="Brief description of the project..." class="mt-1.5" rows="3" />
        </div>
        <div>
          <UiLabel>Icon</UiLabel>
          <div class="mt-1.5">
            <UiIconPicker v-model="newProjectIcon" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="project-color">Color</UiLabel>
            <UiInput id="project-color" v-model="newProjectColor" type="color" class="mt-1.5 h-10" />
          </div>
          <div>
            <UiLabel for="project-due">Deadline</UiLabel>
            <UiInput id="project-due" v-model="newProjectDueDate" type="date" class="mt-1.5" />
          </div>
        </div>
        <div>
          <UiLabel for="project-pic">PIC (Person In Charge)</UiLabel>
          <select
            id="project-pic"
            v-model="newProjectPicId"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">-- Select PIC --</option>
            <option v-for="m in wsMembers" :key="m.userId" :value="m.userId">{{ m.user?.name || m.userId }}</option>
          </select>
        </div>
        <div>
          <UiLabel for="project-visibility">Visibility</UiLabel>
          <select
            id="project-visibility"
            v-model="newProjectVisibility"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="PUBLIC">Public — Visible to all workspace members</option>
            <option value="PRIVATE">Private — Only invited members</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" type="button" @click="resetCreateForm(); close()">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreatingProject || !newProjectName.trim()" class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white">
            {{ isCreatingProject ? 'Creating...' : 'Create Project' }}
          </UiButton>
        </div>
      </form>
    </template>
  </UiDialog>
</template>
