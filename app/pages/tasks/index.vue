<script setup lang="ts">
import {
  CheckSquare, CheckCircle2, Clock, AlertTriangle, Loader2,
  Search, SlidersHorizontal, LayoutGrid, List, Plus, ChevronDown,
  MoreHorizontal, Flag, CalendarDays, ArrowUpRight, User,
  FolderKanban, ChevronLeft, ChevronRight, Pencil, Trash2, Eye,
} from 'lucide-vue-next'
import { kanbanApi } from '~/features/kanban/services/task.api'

definePageMeta({ layout: 'dashboard' })

interface TaskItem {
  id: string
  title: string
  description?: string
  assignees: { id: string; name: string; avatar?: string }[]
  priority: 'high' | 'medium' | 'low'
  status: 'completed' | 'in_progress' | 'not_started'
  dueDate: string
  progress: number
  columnName?: string
  columnId?: string
  projectId?: string
  projectName?: string
  projectColor?: string
  tags?: string[]
}

const workspaceStore = useWorkspaceStore()
const searchQuery = ref('')
const filterOpen = ref(false)
const selectedPriority = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)
const isLoading = ref(false)
const viewMode = ref<'list' | 'card'>('list')

const tasks = ref<TaskItem[]>([])

function mapApiTask(t: any): TaskItem {
  const priority = (t.priority || 'medium').toLowerCase() as TaskItem['priority']
  const colName = (t.column?.name || '').toLowerCase()
  let status: TaskItem['status'] = 'not_started'
  if (t.completed) status = 'completed'
  else if (colName.includes('progress') || colName.includes('doing') || colName.includes('review')) status = 'in_progress'
  else if (colName.includes('done') || colName.includes('complete')) status = 'completed'
  const progress = status === 'completed' ? 100 : (status === 'in_progress' ? 50 : 0)

  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    assignees: t.assignee ? [{ id: t.assignee.id, name: t.assignee.name, avatar: t.assignee.avatar }] : [],
    priority,
    status,
    dueDate: t.dueDate || t.createdAt,
    progress,
    columnName: t.column?.name,
    columnId: t.column?.id,
    projectId: t.column?.board?.projectId,
    projectName: t.column?.board?.project?.name || '',
    projectColor: t.column?.board?.project?.color || '#478FC8',
    tags: t.labels?.map((l: any) => l.name) || [],
  }
}

async function loadTasks() {
  const wsId = workspaceStore.activeWorkspace?.id
  if (!wsId) return
  isLoading.value = true
  try {
    const { data } = await kanbanApi.listTasks(wsId)
    tasks.value = (data as any[]).map(mapApiTask)
  } catch (error) {
    console.error('Failed to load tasks:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
  await Promise.all([
    loadTasks(),
    projectStore.fetchProjects(),
  ])
})

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    const matchesSearch = !searchQuery.value
      || task.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      || task.assignees.some(a => a.name.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesPriority = !selectedPriority.value || task.priority === selectedPriority.value
    const matchesStatus = !selectedStatus.value || task.status === selectedStatus.value

    return matchesSearch && matchesPriority && matchesStatus
  })
})

const hasActiveFilters = computed(() => !!selectedPriority.value || !!selectedStatus.value)

function clearFilters() {
  selectedPriority.value = null
  selectedStatus.value = null
}

// ─── Stats ───
const taskStats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
  todo: tasks.value.filter(t => t.status === 'not_started').length,
  overdue: tasks.value.filter(t => {
    if (t.status === 'completed') return false
    return t.dueDate && new Date(t.dueDate) < new Date()
  }).length,
}))

const statsCards = computed(() => [
  {
    title: 'Total Tasks',
    value: taskStats.value.total,
    icon: CheckSquare,
    iconBg: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10',
    iconColor: 'text-blue-100',
    highlighted: true,
    trend: `${taskStats.value.total} total`,
  },
  {
    title: 'Completed',
    value: taskStats.value.completed,
    icon: CheckCircle2,
    iconBg: 'bg-green-50 dark:bg-green-900/20',
    iconColor: 'text-green-600',
    highlighted: false,
    trend: taskStats.value.completed > 0 ? `+${taskStats.value.completed} done` : undefined,
  },
  {
    title: 'In Progress',
    value: taskStats.value.inProgress,
    icon: Loader2,
    iconBg: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10',
    iconColor: 'text-[#478FC8]',
    highlighted: false,
    trend: undefined,
  },
  {
    title: 'To Do',
    value: taskStats.value.todo,
    icon: Clock,
    iconBg: 'bg-gray-50 dark:bg-gray-800',
    iconColor: 'text-gray-500',
    highlighted: false,
    trend: undefined,
  },
  {
    title: 'Overdue',
    value: taskStats.value.overdue,
    icon: AlertTriangle,
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-500',
    highlighted: false,
    trend: undefined,
  },
])

// ─── Config Maps ───
const priorityMap: Record<string, { label: string; bg: string; text: string }> = {
  high: { label: 'High', bg: 'bg-red-500', text: 'text-white' },
  medium: { label: 'Medium', bg: 'bg-amber-400', text: 'text-white' },
  low: { label: 'Low', bg: 'bg-gray-400', text: 'text-white' },
}

const statusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  completed: { label: 'Completed', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  not_started: { label: 'To Do', bg: 'bg-gray-100 dark:bg-gray-800/50', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
}

function priorityLabel(priority: string) {
  return priorityMap[priority]?.label || priority.charAt(0).toUpperCase() + priority.slice(1)
}

function statusLabel(status: string) {
  return statusMap[status]?.label || status
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getAssigneeInitials(name: string) {
  return name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)
}

const assigneeColors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500']

// ─── Card menu ───
const openMenuId = ref<string | null>(null)
function toggleMenu(taskId: string) {
  openMenuId.value = openMenuId.value === taskId ? null : taskId
}

// ─── Pagination ───
const currentPage = ref(1)
const perPage = 10
const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredTasks.value.slice(start, start + perPage)
})
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / perPage) || 1)

// ─── Create Task Dialog ───
const showCreateTask = ref(false)
const newTaskTitle = ref('')
const newTaskDescription = ref('')
const newTaskPriority = ref('MEDIUM')
const newTaskDueDate = ref('')
const newTaskProjectId = ref('')
const newTaskColumnId = ref('')
const isCreatingTask = ref(false)

const projectStore = useProjectStore()
const kanbanStore = useKanbanStore()

// Role-based: map projectId → myRole
const projectRoleMap = computed(() => {
  const map: Record<string, string | null> = {}
  for (const p of projectStore.projects) {
    map[p.id] = (p as any).myRole ?? null
  }
  return map
})

function canEditTask(task: TaskItem) {
  const role = task.projectId ? projectRoleMap.value[task.projectId] : null
  return role !== 'VIEWER'
}

const hasEditableProjects = computed(() =>
  projectStore.projects.some((p: any) => p.myRole && p.myRole !== 'VIEWER'),
)

const projectOptions = computed(() =>
  projectStore.projects
    .filter((p: any) => p.myRole && p.myRole !== 'VIEWER')
    .map(p => ({ label: p.name, value: p.id })),
)

const columnOptions = computed(() =>
  kanbanStore.columns.map(c => ({ label: c.title, value: c.id })),
)

const priorityOptions = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
]

watch(newTaskProjectId, async (projectId) => {
  newTaskColumnId.value = ''
  if (projectId) {
    await kanbanStore.fetchBoard(projectId)
    if (kanbanStore.columns.length > 0) {
      newTaskColumnId.value = kanbanStore.columns[0]?.id ?? ''
    }
  }
})

function resetTaskForm() {
  newTaskTitle.value = ''
  newTaskDescription.value = ''
  newTaskPriority.value = 'MEDIUM'
  newTaskDueDate.value = ''
  newTaskProjectId.value = ''
  newTaskColumnId.value = ''
}

async function handleCreateTask() {
  if (!newTaskTitle.value.trim() || !newTaskColumnId.value) return
  isCreatingTask.value = true
  try {
    await kanbanApi.createTask({
      title: newTaskTitle.value.trim(),
      description: newTaskDescription.value.trim() || undefined,
      columnId: newTaskColumnId.value,
      priority: newTaskPriority.value as any,
      dueDate: newTaskDueDate.value || undefined,
    })
    resetTaskForm()
    showCreateTask.value = false
    await loadTasks()
  } catch (error) {
    console.error('Failed to create task:', error)
  } finally {
    isCreatingTask.value = false
  }
}

async function openCreateTask() {
  if (!projectStore.projects.length) {
    await projectStore.fetchProjects()
  }
  showCreateTask.value = true
}

// ─── View Details Dialog ───
const showViewDetail = ref(false)
const viewTask = ref<TaskItem | null>(null)

function handleViewDetails(task: TaskItem) {
  viewTask.value = task
  showViewDetail.value = true
}

// ─── Edit Task Dialog ───
const showEditTask = ref(false)
const editTaskId = ref('')
const editTaskTitle = ref('')
const editTaskDescription = ref('')
const editTaskPriority = ref('MEDIUM')
const editTaskDueDate = ref('')
const isEditingTask = ref(false)

function handleEditTask(task: TaskItem) {
  editTaskId.value = task.id
  editTaskTitle.value = task.title
  editTaskDescription.value = task.description || ''
  editTaskPriority.value = task.priority.toUpperCase()
  editTaskDueDate.value = task.dueDate ? (new Date(task.dueDate).toISOString().split('T')[0] ?? '') : ''
  showEditTask.value = true
}

async function submitEditTask() {
  if (!editTaskTitle.value.trim()) return
  isEditingTask.value = true
  try {
    await kanbanApi.updateTask(editTaskId.value, {
      title: editTaskTitle.value.trim(),
      description: editTaskDescription.value.trim() || undefined,
      priority: editTaskPriority.value.toLowerCase() as any,
      dueDate: editTaskDueDate.value || undefined,
    })
    showEditTask.value = false
    await loadTasks()
  } catch (error) {
    console.error('Failed to update task:', error)
  } finally {
    isEditingTask.value = false
  }
}

// ─── Move to Board ───
const router = useRouter()

function handleMoveToBoard(task: TaskItem) {
  if (task.projectId) {
    router.push(`/project/${task.projectId}`)
  }
}

// ─── Delete Task ───
const showDeleteConfirm = ref(false)
const deleteTaskTarget = ref<TaskItem | null>(null)
const isDeletingTask = ref(false)

function handleDeleteTask(task: TaskItem) {
  deleteTaskTarget.value = task
  showDeleteConfirm.value = true
}

async function confirmDeleteTask() {
  if (!deleteTaskTarget.value) return
  isDeletingTask.value = true
  try {
    await kanbanApi.deleteTask(deleteTaskTarget.value.id)
    showDeleteConfirm.value = false
    deleteTaskTarget.value = null
    await loadTasks()
  } catch (error) {
    console.error('Failed to delete task:', error)
  } finally {
    isDeletingTask.value = false
  }
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3570A5]" />
          <h1 class="text-[clamp(22px,3vw,30px)] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            All Tasks
          </h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-4 leading-relaxed">
          Manage and track
          <span class="font-semibold bg-gradient-to-r from-[#478FC8] to-[#6db3e8] bg-clip-text text-transparent">all</span>
          your tasks across projects.
        </p>
      </div>
      <button
        v-if="hasEditableProjects"
        class="flex items-center gap-2 px-4 py-2.5 bg-[#478FC8] text-white rounded-xl hover:bg-[#3a7bb3] transition-all shadow-sm shrink-0"
        style="font-size: 13.5px; font-weight: 600;"
        @click="openCreateTask"
      >
        <Plus class="h-[15px] w-[15px]" />
        Create Task
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <div
        v-for="(stat, index) in statsCards"
        :key="index"
        :class="[
          'relative flex flex-col gap-3 px-5 py-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden',
          stat.highlighted
            ? 'bg-[#478FC8] border-[#478FC8] text-white shadow-md shadow-[#478FC8]/20'
            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-[#478FC8]/30 hover:shadow-sm'
        ]"
      >
        <div v-if="stat.highlighted" class="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
        <div class="flex items-center justify-between">
          <div
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-xl shrink-0',
              stat.highlighted ? 'bg-white/20' : stat.iconBg
            ]"
          >
            <component :is="stat.icon" :class="['h-[18px] w-[18px]', stat.highlighted ? 'text-blue-100' : stat.iconColor]" />
          </div>
          <ArrowUpRight :class="['h-4 w-4', stat.highlighted ? 'text-blue-200' : 'text-gray-300 dark:text-gray-600']" />
        </div>
        <div>
          <p :class="['leading-snug', stat.highlighted ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400']" style="font-size: 12px; font-weight: 500;">
            {{ stat.title }}
          </p>
          <span :class="['leading-tight tracking-tight', stat.highlighted ? 'text-white' : 'text-gray-900 dark:text-white']" style="font-size: 26px; font-weight: 800; letter-spacing: -1px; line-height: 1.2;">
            {{ stat.value }}
          </span>
        </div>
        <div
          v-if="stat.trend"
          :class="['flex items-center gap-1', stat.highlighted ? 'text-blue-200' : 'text-green-600 dark:text-green-400']"
          style="font-size: 11.5px; font-weight: 500;"
        >
          <ArrowUpRight class="h-3 w-3" />
          <span>{{ stat.trend }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Search -->
      <div class="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 focus-within:border-[#478FC8] transition-all min-w-[220px]">
        <Search class="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search tasks..."
          class="bg-transparent flex-1 outline-none text-gray-700 dark:text-gray-200 placeholder:text-gray-400"
          style="font-size: 13px;"
        />
      </div>

      <!-- Filter buttons -->
      <UiDropdown v-model:open="filterOpen">
        <template #trigger>
          <button class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" style="font-size: 13px; font-weight: 500;">
            Status
            <ChevronDown class="h-[13px] w-[13px] text-gray-400" />
            <span
              v-if="selectedStatus"
              class="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#478FC8] text-[9px] font-bold text-white"
            >1</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="w-44 p-2">
            <button
              v-for="s in ['completed', 'in_progress', 'not_started']"
              :key="s"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              :class="selectedStatus === s ? 'text-[#478FC8] font-semibold' : 'text-gray-700 dark:text-gray-300'"
              style="font-size: 13px;"
              @click="selectedStatus = selectedStatus === s ? null : s; close()"
            >
              <span :class="['w-1.5 h-1.5 rounded-full shrink-0', statusMap[s]?.dot]" />
              {{ statusLabel(s) }}
            </button>
          </div>
        </template>
      </UiDropdown>

      <UiDropdown>
        <template #trigger>
          <button class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all" style="font-size: 13px; font-weight: 500;">
            Priority
            <ChevronDown class="h-[13px] w-[13px] text-gray-400" />
            <span
              v-if="selectedPriority"
              class="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#478FC8] text-[9px] font-bold text-white"
            >1</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="w-36 p-2">
            <button
              v-for="p in ['high', 'medium', 'low']"
              :key="p"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
              :class="selectedPriority === p ? 'text-[#478FC8] font-semibold' : 'text-gray-700 dark:text-gray-300'"
              style="font-size: 13px;"
              @click="selectedPriority = selectedPriority === p ? null : p; close()"
            >
              <Flag class="h-[10px] w-[10px]" :class="priorityMap[p]?.bg.replace('bg-', 'text-')" />
              {{ priorityLabel(p) }}
            </button>
          </div>
        </template>
      </UiDropdown>

      <button
        v-if="hasActiveFilters"
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 hover:border-[#478FC8] hover:text-[#478FC8] transition-all"
        style="font-size: 13px; font-weight: 500;"
        @click="clearFilters"
      >
        <SlidersHorizontal class="h-[13px] w-[13px]" />
        Clear filters
      </button>

      <div class="flex-1" />

      <!-- Task count -->
      <span class="text-gray-500 dark:text-gray-400 hidden md:block" style="font-size: 13px;">
        <span class="text-gray-800 dark:text-white" style="font-weight: 600;">{{ filteredTasks.length }}</span> tasks
      </span>

      <!-- View toggle -->
      <div class="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
        <button
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
            viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'
          ]"
          style="font-size: 13px; font-weight: 500;"
          @click="viewMode = 'list'"
        >
          <List class="h-[14px] w-[14px]" />
          List
        </button>
        <button
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all',
            viewMode === 'card' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 hover:text-gray-700'
          ]"
          style="font-size: 13px; font-weight: 500;"
          @click="viewMode = 'card'"
        >
          <LayoutGrid class="h-[14px] w-[14px]" />
          Card
        </button>
      </div>
    </div>

    <!-- ═══ LIST VIEW ═══ -->
    <div v-if="viewMode === 'list'" class="flex flex-col gap-2">
      <!-- List header -->
      <div class="flex items-center gap-4 px-5 py-2">
        <div class="w-8" />
        <div class="flex-1 text-gray-400 dark:text-gray-500 uppercase" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Task</div>
        <div class="w-40 text-gray-400 dark:text-gray-500 uppercase hidden md:block" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Assignee</div>
        <div class="w-20 text-gray-400 dark:text-gray-500 uppercase hidden sm:block" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Priority</div>
        <div class="w-24 text-gray-400 dark:text-gray-500 uppercase hidden sm:block" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Status</div>
        <div class="w-28 text-gray-400 dark:text-gray-500 uppercase hidden lg:block" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Due Date</div>
        <div class="w-32 text-gray-400 dark:text-gray-500 uppercase hidden xl:block" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Progress</div>
        <div class="w-24 text-gray-400 dark:text-gray-500 uppercase" style="font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">Actions</div>
      </div>

      <!-- Empty state -->
      <div v-if="paginatedTasks.length === 0" class="flex flex-col items-center justify-center gap-3 py-20">
        <CheckSquare class="h-12 w-12 text-gray-200 dark:text-gray-700" />
        <p class="text-gray-500 dark:text-gray-400" style="font-size: 14px; font-weight: 600;">No tasks found</p>
        <p class="text-gray-400 dark:text-gray-500" style="font-size: 13px;">Try adjusting your search or filters</p>
      </div>

      <!-- Task Rows -->
      <div
        v-for="(task, idx) in paginatedTasks"
        :key="task.id"
        class="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm transition-all group"
      >
        <!-- Status icon -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', statusMap[task.status]?.bg]">
          <CheckSquare class="h-[15px] w-[15px]" :class="statusMap[task.status]?.text" />
        </div>

        <!-- Title + project -->
        <div class="flex-1 min-w-0">
          <p class="text-gray-900 dark:text-white truncate" style="font-size: 13.5px; font-weight: 600;">{{ task.title }}</p>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full shrink-0" :style="{ backgroundColor: task.projectColor || '#478FC8' }" />
            <span class="text-gray-400 dark:text-gray-500" style="font-size: 11.5px;">{{ task.projectName || 'No project' }}</span>
          </div>
        </div>

        <!-- Assignee -->
        <div class="hidden md:flex items-center gap-2 w-40 shrink-0">
          <template v-if="task.assignees.length > 0">
            <UiAvatar v-if="task.assignees[0].avatar" :src="task.assignees[0].avatar" :alt="task.assignees[0].name" size="xs" />
            <div
              v-else
              :class="['w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0', assigneeColors[idx % assigneeColors.length]]"
              style="font-size: 10px; font-weight: 700;"
            >
              {{ getAssigneeInitials(task.assignees[0].name) }}
            </div>
            <span class="text-gray-600 dark:text-gray-300 truncate" style="font-size: 12.5px;">{{ task.assignees[0].name.split(' ')[0] }}</span>
          </template>
          <span v-else class="text-gray-400 dark:text-gray-500" style="font-size: 12.5px;">Unassigned</span>
        </div>

        <!-- Priority -->
        <div class="hidden sm:block shrink-0">
          <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', priorityMap[task.priority]?.bg]">
            <Flag class="h-[10px] w-[10px]" :class="priorityMap[task.priority]?.text" />
            <span :class="priorityMap[task.priority]?.text" style="font-size: 11.5px; font-weight: 700;">{{ priorityLabel(task.priority) }}</span>
          </span>
        </div>

        <!-- Status -->
        <div class="hidden sm:block shrink-0">
          <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', statusMap[task.status]?.bg]">
            <span :class="['w-1.5 h-1.5 rounded-full shrink-0', statusMap[task.status]?.dot]" />
            <span :class="statusMap[task.status]?.text" style="font-size: 11.5px; font-weight: 600;">{{ statusLabel(task.status) }}</span>
          </span>
        </div>

        <!-- Due date -->
        <div class="hidden lg:flex items-center gap-1.5 shrink-0 w-28">
          <CalendarDays class="h-3 w-3 text-gray-400" />
          <span class="text-gray-600 dark:text-gray-300" style="font-size: 12px;">{{ formatDate(task.dueDate) }}</span>
        </div>

        <!-- Progress -->
        <div class="hidden xl:flex items-center gap-2.5 w-32 shrink-0">
          <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              :class="[
                'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                task.progress === 100 ? 'from-green-400 to-emerald-500'
                  : task.progress > 50 ? 'from-blue-400 to-blue-600'
                  : task.progress > 0 ? 'from-amber-400 to-orange-400'
                  : 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700',
              ]"
              :style="{ width: `${task.progress}%` }"
            />
          </div>
          <span
            :class="[
              'shrink-0',
              task.progress === 100 ? 'text-green-600' : 'text-[#478FC8]',
            ]"
            style="font-size: 12px; font-weight: 700;"
          >
            {{ task.progress }}%
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <button
            class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#478FC8] transition-all"
            @click="handleViewDetails(task)"
          >
            <Eye class="h-[13px] w-[13px]" />
          </button>
          <template v-if="canEditTask(task)">
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-all"
              @click="handleEditTask(task)"
            >
              <Pencil class="h-[13px] w-[13px]" />
            </button>
            <button
              class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
              @click="handleDeleteTask(task)"
            >
              <Trash2 class="h-[13px] w-[13px]" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ═══ CARD VIEW ═══ -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <!-- Empty state -->
      <div v-if="paginatedTasks.length === 0" class="col-span-3 flex flex-col items-center justify-center gap-3 py-20">
        <CheckSquare class="h-12 w-12 text-gray-200 dark:text-gray-700" />
        <p class="text-gray-500 dark:text-gray-400" style="font-size: 14px; font-weight: 600;">No tasks found</p>
      </div>

      <!-- Task Cards -->
      <div
        v-for="(task, idx) in paginatedTasks"
        :key="task.id"
        class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 group flex flex-col"
      >
        <!-- Top color stripe -->
        <div
          :class="[
            'h-1.5 w-full bg-gradient-to-r',
            task.status === 'completed' ? 'from-green-400 to-emerald-500'
              : task.status === 'in_progress' ? 'from-blue-400 to-blue-600'
              : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700',
          ]"
        />

        <div class="p-5 flex flex-col gap-4 flex-1">
          <!-- Title + menu -->
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1 min-w-0">
              <h3 class="text-gray-900 dark:text-white leading-snug" style="font-size: 14px; font-weight: 700;">{{ task.title }}</h3>
              <div class="flex items-center gap-1.5 mt-1.5">
                <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: task.projectColor || '#478FC8' }" />
                <span class="text-gray-500 dark:text-gray-400" style="font-size: 12px; font-weight: 500;">{{ task.projectName || 'No project' }}</span>
              </div>
            </div>
            <div class="relative shrink-0">
              <button
                class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                @click="toggleMenu(task.id)"
              >
                <MoreHorizontal class="h-[15px] w-[15px]" />
              </button>
              <div
                v-if="openMenuId === task.id"
                class="absolute right-0 top-8 z-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg py-1 w-32"
                @mouseleave="openMenuId = null"
              >
                <button class="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" style="font-size: 13px; font-weight: 500;" @click="openMenuId = null; handleViewDetails(task)">
                  <Eye class="h-[13px] w-[13px]" />
                  View
                </button>
                <template v-if="canEditTask(task)">
                  <button class="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300" style="font-size: 13px; font-weight: 500;" @click="openMenuId = null; handleEditTask(task)">
                    <Pencil class="h-[13px] w-[13px]" />
                    Edit
                  </button>
                  <button class="w-full flex items-center gap-2 px-3 py-2 text-left transition-all hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500" style="font-size: 13px; font-weight: 500;" @click="openMenuId = null; handleDeleteTask(task)">
                    <Trash2 class="h-[13px] w-[13px]" />
                    Delete
                  </button>
                </template>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in task.tags"
              :key="tag"
              class="px-2 py-0.5 rounded-md bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8]"
              style="font-size: 10.5px; font-weight: 600;"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Meta grid -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p class="text-gray-400 dark:text-gray-500 mb-1" style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;">Assignee</p>
              <div class="flex items-center gap-2">
                <template v-if="task.assignees.length > 0">
                  <UiAvatar v-if="task.assignees[0].avatar" :src="task.assignees[0].avatar" :alt="task.assignees[0].name" size="xs" />
                  <div
                    v-else
                    :class="['w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0', assigneeColors[idx % assigneeColors.length]]"
                    style="font-size: 10px; font-weight: 700;"
                  >
                    {{ getAssigneeInitials(task.assignees[0].name) }}
                  </div>
                  <span class="text-gray-700 dark:text-gray-300 truncate" style="font-size: 12.5px; font-weight: 500;">{{ task.assignees[0].name.split(' ')[0] }}</span>
                </template>
                <span v-else class="text-gray-400" style="font-size: 12.5px;">Unassigned</span>
              </div>
            </div>
            <div>
              <p class="text-gray-400 dark:text-gray-500 mb-1" style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;">Priority</p>
              <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', priorityMap[task.priority]?.bg]">
                <Flag class="h-[10px] w-[10px]" :class="priorityMap[task.priority]?.text" />
                <span :class="priorityMap[task.priority]?.text" style="font-size: 11.5px; font-weight: 700;">{{ priorityLabel(task.priority) }}</span>
              </span>
            </div>
            <div>
              <p class="text-gray-400 dark:text-gray-500 mb-1" style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;">Status</p>
              <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', statusMap[task.status]?.bg]">
                <span :class="['w-1.5 h-1.5 rounded-full shrink-0', statusMap[task.status]?.dot]" />
                <span :class="statusMap[task.status]?.text" style="font-size: 11.5px; font-weight: 600;">{{ statusLabel(task.status) }}</span>
              </span>
            </div>
            <div>
              <p class="text-gray-400 dark:text-gray-500 mb-1" style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;">Due Date</p>
              <div class="flex items-center gap-1.5">
                <CalendarDays class="h-3 w-3 text-gray-400" />
                <span class="text-gray-700 dark:text-gray-300" style="font-size: 12.5px; font-weight: 500;">{{ formatDate(task.dueDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Progress -->
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <span class="text-gray-500 dark:text-gray-400" style="font-size: 12px; font-weight: 500;">Progress</span>
              <span
                :class="[
                  task.progress === 100 ? 'text-green-600' : task.progress > 0 ? 'text-[#478FC8]' : 'text-gray-400',
                ]"
                style="font-size: 13px; font-weight: 700;"
              >
                {{ task.progress }}%
              </span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                :class="[
                  'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                  task.progress === 100 ? 'from-green-400 to-emerald-500'
                    : task.progress > 50 ? 'from-blue-400 to-blue-600'
                    : task.progress > 0 ? 'from-amber-400 to-orange-400'
                    : 'from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700',
                ]"
                :style="{ width: `${task.progress}%` }"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50 dark:border-gray-800">
            <button
              class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 transition-all"
              style="font-size: 13px; font-weight: 600;"
              @click="handleViewDetails(task)"
            >
              <Eye class="h-[13px] w-[13px]" />
              View Task
            </button>
            <button
              v-if="canEditTask(task)"
              class="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[#478FC8] hover:bg-[#EDF4FF] dark:hover:bg-[#478FC8]/10 transition-all"
              style="font-size: 13px; font-weight: 600;"
              @click="handleEditTask(task)"
            >
              <Pencil class="h-3 w-3" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between pt-2">
      <p class="text-gray-500 dark:text-gray-400" style="font-size: 13px;">
        Showing
        <span class="text-gray-800 dark:text-white" style="font-weight: 600;">{{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredTasks.length) }}</span>
        of
        <span class="text-gray-800 dark:text-white" style="font-weight: 600;">{{ filteredTasks.length }}</span> entries
      </p>
      <div class="flex items-center gap-2">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 disabled:opacity-40 transition-all"
          :disabled="currentPage <= 1"
          @click="currentPage--"
        >
          <ChevronLeft class="h-[14px] w-[14px]" />
        </button>
        <template v-for="page in totalPages" :key="page">
          <button
            :class="[
              'w-8 h-8 flex items-center justify-center rounded-lg transition-all',
              page === currentPage
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800',
            ]"
            style="font-size: 13px; font-weight: 700;"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
        </template>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 disabled:opacity-40 transition-all"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          <ChevronRight class="h-[14px] w-[14px]" />
        </button>
      </div>
    </div>
  </LayoutPageContainer>

  <!-- Create Task Dialog -->
  <UiDialog v-model:open="showCreateTask" title="Create Task" description="Add a new task to a project board.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="handleCreateTask">
        <div>
          <UiLabel for="task-title">Task Title</UiLabel>
          <UiInput id="task-title" v-model="newTaskTitle" placeholder="e.g. Implement login page" class="mt-1.5" />
        </div>
        <div>
          <UiLabel for="task-desc">Description</UiLabel>
          <UiTextarea id="task-desc" v-model="newTaskDescription" placeholder="Task details..." class="mt-1.5" rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="task-project">Project</UiLabel>
            <UiSelect id="task-project" v-model="newTaskProjectId" :options="projectOptions" placeholder="Select project" class="mt-1.5" />
          </div>
          <div>
            <UiLabel for="task-column">Column</UiLabel>
            <UiSelect id="task-column" v-model="newTaskColumnId" :options="columnOptions" :disabled="!newTaskProjectId" placeholder="Select column" class="mt-1.5" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="task-priority">Priority</UiLabel>
            <UiSelect id="task-priority" v-model="newTaskPriority" :options="priorityOptions" class="mt-1.5" />
          </div>
          <div>
            <UiLabel for="task-due">Due Date</UiLabel>
            <UiInput id="task-due" v-model="newTaskDueDate" type="date" class="mt-1.5" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" type="button" @click="resetTaskForm(); close()">Cancel</UiButton>
          <UiButton type="submit" :disabled="isCreatingTask || !newTaskTitle.trim() || !newTaskColumnId">
            {{ isCreatingTask ? 'Creating...' : 'Create Task' }}
          </UiButton>
        </div>
      </form>
    </template>
  </UiDialog>

  <!-- View Task Details Dialog -->
  <UiDialog v-model:open="showViewDetail" title="Task Details" description="View task information.">
    <template #default="{ close }">
      <div v-if="viewTask" class="space-y-4">
        <div>
          <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Title</p>
          <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{{ viewTask.title }}</p>
        </div>
        <div>
          <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Description</p>
          <p class="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ viewTask.description || 'No description' }}</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Priority</p>
            <span :class="['mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', priorityMap[viewTask.priority]?.bg]">
              <Flag class="h-[10px] w-[10px]" :class="priorityMap[viewTask.priority]?.text" />
              <span :class="priorityMap[viewTask.priority]?.text" style="font-size: 11.5px; font-weight: 700;">{{ priorityLabel(viewTask.priority) }}</span>
            </span>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Status</p>
            <span :class="['mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', statusMap[viewTask.status]?.bg]">
              <span :class="['w-1.5 h-1.5 rounded-full shrink-0', statusMap[viewTask.status]?.dot]" />
              <span :class="statusMap[viewTask.status]?.text" style="font-size: 11.5px; font-weight: 600;">{{ statusLabel(viewTask.status) }}</span>
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Due Date</p>
            <div class="mt-1 flex items-center gap-1.5">
              <CalendarDays class="h-3 w-3 text-gray-400" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ formatDate(viewTask.dueDate) }}</span>
            </div>
          </div>
          <div>
            <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Column</p>
            <p class="mt-1 text-sm text-gray-700 dark:text-gray-300">{{ viewTask.columnName || '-' }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Assignee</p>
          <div class="mt-1 flex items-center gap-2">
            <template v-if="viewTask.assignees.length">
              <UiAvatar v-for="a in viewTask.assignees" :key="a.id" :alt="a.name" :src="a.avatar" size="sm" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ viewTask.assignees.map(a => a.name).join(', ') }}</span>
            </template>
            <span v-else class="text-sm text-gray-400 dark:text-gray-500">Unassigned</span>
          </div>
        </div>
        <div>
          <p class="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">Progress</p>
          <div class="mt-1 flex items-center gap-3">
            <div class="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                :class="[
                  'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                  viewTask.progress === 100 ? 'from-green-400 to-emerald-500'
                    : viewTask.progress > 50 ? 'from-blue-400 to-blue-600'
                    : viewTask.progress > 0 ? 'from-amber-400 to-orange-400'
                    : 'from-gray-200 to-gray-300',
                ]"
                :style="{ width: `${viewTask.progress}%` }"
              />
            </div>
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ viewTask.progress }}%</span>
          </div>
        </div>
        <div class="flex justify-end pt-2">
          <UiButton variant="outline" @click="close()">Close</UiButton>
        </div>
      </div>
    </template>
  </UiDialog>

  <!-- Edit Task Dialog -->
  <UiDialog v-model:open="showEditTask" title="Edit Task" description="Update task information.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="submitEditTask">
        <div>
          <UiLabel for="edit-task-title">Task Title</UiLabel>
          <UiInput id="edit-task-title" v-model="editTaskTitle" placeholder="Task title" class="mt-1.5" />
        </div>
        <div>
          <UiLabel for="edit-task-desc">Description</UiLabel>
          <UiTextarea id="edit-task-desc" v-model="editTaskDescription" placeholder="Task details..." class="mt-1.5" rows="3" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="edit-task-priority">Priority</UiLabel>
            <UiSelect id="edit-task-priority" v-model="editTaskPriority" :options="priorityOptions" class="mt-1.5" />
          </div>
          <div>
            <UiLabel for="edit-task-due">Due Date</UiLabel>
            <UiInput id="edit-task-due" v-model="editTaskDueDate" type="date" class="mt-1.5" />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" type="button" @click="close()">Cancel</UiButton>
          <UiButton type="submit" :disabled="isEditingTask || !editTaskTitle.trim()">
            {{ isEditingTask ? 'Saving...' : 'Save Changes' }}
          </UiButton>
        </div>
      </form>
    </template>
  </UiDialog>

  <!-- Delete Task Confirmation Dialog -->
  <UiDialog v-model:open="showDeleteConfirm" title="Delete Task" description="This action cannot be undone.">
    <template #default="{ close }">
      <div class="space-y-4">
        <p class="text-sm text-muted-foreground">
          Are you sure you want to delete <span class="font-semibold text-foreground">"{{ deleteTaskTarget?.title }}"</span>? This action is permanent and cannot be undone.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" @click="close()">Cancel</UiButton>
          <UiButton variant="destructive" :disabled="isDeletingTask" @click="confirmDeleteTask">
            {{ isDeletingTask ? 'Deleting...' : 'Delete Task' }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiDialog>
</template>
