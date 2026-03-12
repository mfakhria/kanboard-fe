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
const picFilter = ref('')
const departmentFilter = ref('')
const progressFilter = ref('')
const deadlineFilter = ref('')

// ─── Mock project data removed — uses real API data ───
interface ProjectCard {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'pending' | 'overdue'
  pic: { name: string; avatar: string }
  department: string
  role: string
  completedTasks: number
  totalTasks: number
  deadline: string
  progress: number
  icon: string
  iconBg: string
  color: string
}

const iconBgOptions = [
  'bg-orange-100 dark:bg-orange-900/30',
  'bg-emerald-100 dark:bg-emerald-900/30',
  'bg-blue-100 dark:bg-blue-900/30',
  'bg-teal-100 dark:bg-teal-900/30',
  'bg-amber-100 dark:bg-amber-900/30',
  'bg-violet-100 dark:bg-violet-900/30',
]

// ─── Combine API data ───
const projectCards = computed<ProjectCard[]>(() => {
  return projectStore.projects.map((p) => {
    const statusMap: Record<string, ProjectCard['status']> = {
      ACTIVE: 'in_progress',
      COMPLETED: 'completed',
      ARCHIVED: 'pending',
    }
    return {
      id: p.id,
      name: p.name,
      status: statusMap[p.status] || 'pending',
      pic: { name: p.pic?.name || '-', avatar: p.pic?.avatar || '' },
      department: '-',
      role: '-',
      completedTasks: p.completedTasks ?? 0,
      totalTasks: p.totalTasks ?? 0,
      deadline: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      progress: (p.totalTasks ?? 0) > 0 ? Math.round(((p.completedTasks ?? 0) / (p.totalTasks ?? 0)) * 100) : 0,
      icon: p.icon || 'FolderKanban',
      iconBg: p.color ? '' : (iconBgOptions[projectStore.projects.indexOf(p) % iconBgOptions.length] ?? 'bg-blue-100 dark:bg-blue-900/30'),
      color: p.color || '',
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

// ─── Pagination ───
const currentPage = ref(1)
const perPage = 6

const totalPages = computed(() => Math.max(1, Math.ceil(filteredProjects.value.length / perPage)))

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProjects.value.slice(start, start + perPage)
})

const visiblePages = computed(() => {
  const pages: (number | '...')[] = []
  const total = totalPages.value
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3)
    if (currentPage.value > 4) pages.push('...')
    if (!pages.includes(total)) pages.push(total)
  }
  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
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
    class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    dotClass: 'bg-amber-500',
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
})

// ─── Create Project Dialog ───
const showCreateProject = ref(false)
const newProjectName = ref('')
const newProjectDescription = ref('')
const newProjectColor = ref('#6366f1')
const newProjectDueDate = ref('')
const newProjectPicId = ref('')
const newProjectIcon = ref('FolderKanban')
const isCreatingProject = ref(false)

// Workspace members for PIC dropdown
const wsMembers = computed(() => workspaceStore.members)

function resetCreateForm() {
  newProjectName.value = ''
  newProjectDescription.value = ''
  newProjectColor.value = '#6366f1'
  newProjectDueDate.value = ''
  newProjectPicId.value = ''
  newProjectIcon.value = 'FolderKanban'
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
    })
    resetCreateForm()
    showCreateProject.value = false
  } catch (error) {
    console.error('Failed to create project:', error)
  } finally {
    isCreatingProject.value = false
  }
}
</script>

<template>
  <LayoutPageContainer>
    <!-- ═══ Page Header ═══ -->
    <LayoutPageHeader title="Projects" subtitle="Manage and track all your projects in one place." />

    <!-- ═══ Stats Cards ═══ -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      <!-- Total -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF4FF] dark:bg-[#478FC8]/20">
          <FolderKanban class="h-5 w-5 text-[#478FC8]" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
        </div>
      </div>
      <!-- Completed -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
          <CheckCircle2 class="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Completed Projects</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.completed }}</p>
        </div>
      </div>
      <!-- In Progress -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
          <Loader2 class="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">In Progress</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.inProgress }}</p>
        </div>
      </div>
      <!-- Pending -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Clock class="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Pending Projects</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.pending }}</p>
        </div>
      </div>
      <!-- Overdue -->
      <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <AlertTriangle class="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Overdue</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.overdue }}</p>
        </div>
      </div>
    </div>

    <!-- ═══ Filters & View Toggle ═══ -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <!-- Left: Search + Filters -->
      <div class="flex flex-wrap items-center gap-2">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search project..."
            class="h-9 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          />
        </div>
        <!-- Status -->
        <div class="relative">
          <select
            v-model="statusFilter"
            class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 text-sm text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          >
            <option value="">Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <!-- PIC -->
        <div class="relative">
          <select
            v-model="picFilter"
            class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 text-sm text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          >
            <option value="">PIC</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <!-- Department -->
        <div class="relative">
          <select
            v-model="departmentFilter"
            class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 text-sm text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          >
            <option value="">Department</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <!-- Progress -->
        <div class="relative">
          <select
            v-model="progressFilter"
            class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 text-sm text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          >
            <option value="">Progress</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <!-- Deadline -->
        <div class="relative">
          <select
            v-model="deadlineFilter"
            class="h-9 appearance-none rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-3 pr-8 text-sm text-gray-600 dark:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          >
            <option value="">Deadline</option>
          </select>
          <ChevronDown class="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <!-- Right: View Toggle + Add Project -->
      <div class="flex items-center gap-2">
        <div class="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-0.5">
          <button
            :class="[
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
            @click="viewMode = 'list'"
          >
            <List class="h-4 w-4" />
            List
          </button>
          <button
            :class="[
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              viewMode === 'card'
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            ]"
            @click="viewMode = 'card'"
          >
            <LayoutGrid class="h-4 w-4" />
            Card
          </button>
        </div>
        <UiButton class="gap-2 bg-[#478FC8] hover:bg-[#3a7bb3] text-white shadow-sm hover:shadow-md transition-all" @click="showCreateProject = true">
          <Plus class="h-4 w-4" />
          Add Project
        </UiButton>
      </div>
    </div>

    <!-- ═══ Project Cards Grid ═══ -->
    <div v-if="viewMode === 'card'" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UiCard
        v-for="project in paginatedProjects"
        :key="project.id"
        class="flex flex-col p-5 transition-shadow hover:shadow-md"
      >
        <!-- Card Header: Icon + Name + Status -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              :class="['flex h-10 w-10 items-center justify-center rounded-lg text-lg', project.iconBg]"
              :style="project.color ? { backgroundColor: project.color + '20' } : {}"
            >
              <UiLucideIcon :name="project.icon" :size="20" :style="project.color ? { color: project.color } : {}" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white leading-tight max-w-[160px] truncate">
              {{ project.name }}
            </h3>
          </div>
          <span
            :class="[
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
              statusConfig[project.status]?.class
            ]"
          >
            <span :class="['h-1.5 w-1.5 rounded-full', statusConfig[project.status]?.dotClass]" />
            {{ statusConfig[project.status]?.label }}
          </span>
        </div>

        <!-- PIC & Department -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-1.5">PIC:</p>
            <div class="flex items-center gap-2">
              <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white shrink-0">
                {{ project.pic.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}
              </div>
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ project.pic.name }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-1.5">Department/Role:</p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project.department }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ project.role }}</p>
          </div>
        </div>

        <!-- Tasks & Deadline -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">Completed Tasks:</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-bold text-gray-900 dark:text-white">{{ project.completedTasks }}</span>
              <span class="text-gray-400"> / {{ project.totalTasks }}</span>
            </p>
          </div>
          <div>
            <p class="text-xs text-gray-400 dark:text-gray-500 mb-1">Deadline:</p>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project.deadline }}</p>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-5">
          <div class="flex items-center justify-between mb-1.5">
            <p class="text-xs text-gray-400 dark:text-gray-500">Progress:</p>
            <p :class="['text-xs font-semibold', getProgressTextColor(project.progress)]">{{ project.progress }}%</p>
          </div>
          <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              :class="['h-full rounded-full transition-all', getProgressColor(project.progress)]"
              :style="{ width: `${project.progress}%` }"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          <NuxtLink
            :to="`/project/${project.id}`"
            class="flex-1"
          >
            <UiButton variant="outline" size="sm" class="w-full text-xs">
              View Details
            </UiButton>
          </NuxtLink>
          <NuxtLink :to="`/project/${project.id}`" class="flex-1">
            <UiButton variant="ghost" size="sm" class="w-full text-xs text-[#478FC8]">
              Edit Project Info
            </UiButton>
          </NuxtLink>
        </div>
      </UiCard>
    </div>

    <!-- ═══ Project List View ═══ -->
    <div v-else>
      <UiCard class="overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800">
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PIC</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th class="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deadline</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="project in paginatedProjects"
                :key="project.id"
                class="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      :class="['flex h-9 w-9 items-center justify-center rounded-lg text-base', project.iconBg]"
                      :style="project.color ? { backgroundColor: project.color + '20' } : {}"
                    >
                      <UiLucideIcon :name="project.icon" :size="18" :style="project.color ? { color: project.color } : {}" />
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ project.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                      statusConfig[project.status]?.class
                    ]"
                  >
                    <span :class="['h-1.5 w-1.5 rounded-full', statusConfig[project.status]?.dotClass]" />
                    {{ statusConfig[project.status]?.label }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-2">
                    <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white shrink-0">
                      {{ project.pic.name.split(' ').map(n => n[0]).join('').slice(0, 2) }}
                    </div>
                    <span class="text-gray-700 dark:text-gray-300">{{ project.pic.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-gray-600 dark:text-gray-400">{{ project.department }}</td>
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3 min-w-[120px]">
                    <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        :class="['h-full rounded-full transition-all', getProgressColor(project.progress)]"
                        :style="{ width: `${project.progress}%` }"
                      />
                    </div>
                    <span :class="['text-xs font-semibold whitespace-nowrap', getProgressTextColor(project.progress)]">{{ project.progress }}%</span>
                  </div>
                </td>
                <td class="px-5 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ project.deadline }}</td>
                <td class="px-5 py-4 text-right">
                  <NuxtLink :to="`/project/${project.id}`">
                    <UiButton variant="ghost" size="sm" class="text-xs text-[#478FC8]">View</UiButton>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiCard>
    </div>

    <!-- ═══ Pagination ═══ -->
    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredProjects.length) }} of {{ filteredProjects.length }} entries
      </p>
      <div class="flex items-center gap-1">
        <button
          :disabled="currentPage === 1"
          class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          @click="goToPage(currentPage - 1)"
        >
          <ChevronLeft class="h-4 w-4" />
          Previous
        </button>
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-2 text-sm text-gray-400">...</span>
          <button
            v-else
            :class="[
              'h-8 w-8 rounded-lg text-sm font-medium transition-colors',
              currentPage === page
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="goToPage(page as number)"
          >
            {{ page }}
          </button>
        </template>
        <button
          :disabled="currentPage === totalPages"
          class="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          @click="goToPage(currentPage + 1)"
        >
          Next
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
      <button
        class="text-sm text-[#478FC8] hover:underline"
        @click="currentPage = 1; /* show all handled by perPage */"
      >
        Show All
      </button>
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
