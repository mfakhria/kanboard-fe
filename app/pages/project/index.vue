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

// ─── Mock project data (used when API data is empty) ───
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
}

const mockProjects: ProjectCard[] = [
  {
    id: '1', name: 'Onboarding Process', status: 'in_progress',
    pic: { name: 'Jenny Lim', avatar: '' }, department: 'Human Resource', role: 'Talent Officer',
    completedTasks: 5, totalTasks: 21, deadline: 'May 24, 2025', progress: 42,
    icon: '📋', iconBg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    id: '2', name: 'Cybersecurity Policy Upda...', status: 'completed',
    pic: { name: 'Michael Ardi', avatar: '' }, department: 'Engineer', role: 'IT Security Officer',
    completedTasks: 14, totalTasks: 14, deadline: 'May 10, 2025', progress: 100,
    icon: '🔒', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  {
    id: '3', name: 'Talent Development Program', status: 'pending',
    pic: { name: 'Lisa Kim', avatar: '' }, department: 'Human Resource', role: 'Talent Officer',
    completedTasks: 1, totalTasks: 12, deadline: 'June 25, 2025', progress: 10,
    icon: '🎯', iconBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: '4', name: 'Internship 2025', status: 'completed',
    pic: { name: 'Peter Gabrielle', avatar: '' }, department: 'Human Resource', role: 'HR Lead',
    completedTasks: 3, totalTasks: 3, deadline: 'May 30, 2025', progress: 100,
    icon: '🎓', iconBg: 'bg-teal-100 dark:bg-teal-900/30',
  },
  {
    id: '5', name: 'Network Infrastructure Up...', status: 'in_progress',
    pic: { name: 'Daniel Chong', avatar: '' }, department: 'Engineer', role: 'IT Lead',
    completedTasks: 9, totalTasks: 12, deadline: 'June 10, 2025', progress: 75,
    icon: '🌐', iconBg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    id: '6', name: 'Website SEO Optimization', status: 'completed',
    pic: { name: 'Thomas Yeo', avatar: '' }, department: 'Marketing', role: 'SEO Specialist',
    completedTasks: 15, totalTasks: 15, deadline: 'May 10, 2025', progress: 100,
    icon: '🔍', iconBg: 'bg-violet-100 dark:bg-violet-900/30',
  },
]

// ─── Combine API data with mock ───
const projectCards = computed<ProjectCard[]>(() => {
  if (projectStore.projects.length > 0) {
    return projectStore.projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status === 'running' ? 'in_progress' as const : p.status as ProjectCard['status'],
      pic: { name: '-', avatar: '' },
      department: '-',
      role: '-',
      completedTasks: 0,
      totalTasks: 0,
      deadline: p.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
      progress: 0,
      icon: p.icon || '📁',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    }))
  }
  return mockProjects
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
        <UiButton class="gap-2 bg-[#478FC8] hover:bg-[#3a7bb3] text-white shadow-sm hover:shadow-md transition-all">
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
            <div :class="['flex h-10 w-10 items-center justify-center rounded-lg text-lg', project.iconBg]">
              {{ project.icon }}
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
          <UiButton variant="ghost" size="sm" class="flex-1 text-xs text-[#478FC8]">
            Edit Project Info
          </UiButton>
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
                    <div :class="['flex h-9 w-9 items-center justify-center rounded-lg text-base', project.iconBg]">
                      {{ project.icon }}
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
</template>
