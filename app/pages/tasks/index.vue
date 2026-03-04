<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

interface TaskItem {
  id: string
  title: string
  assignees: { id: string; name: string; avatar?: string }[]
  priority: 'high' | 'medium' | 'low'
  status: 'completed' | 'in_progress' | 'not_started'
  dueDate: string
  progress: number
}

const searchQuery = ref('')
const filterOpen = ref(false)
const selectedPriority = ref<string | null>(null)
const selectedStatus = ref<string | null>(null)

const tasks = ref<TaskItem[]>([
  {
    id: '1',
    title: 'Design Landing Page Wireframe',
    assignees: [
      { id: 'u1', name: 'Sarah Miller' },
      { id: 'u2', name: 'Jake Owen' },
      { id: 'u3', name: 'Li Wei' },
      { id: 'u4', name: 'Amy Diaz' },
    ],
    priority: 'high',
    status: 'in_progress',
    dueDate: '2025-02-15',
    progress: 65,
  },
  {
    id: '2',
    title: 'Implement User Authentication',
    assignees: [
      { id: 'u5', name: 'Tom Bradley' },
    ],
    priority: 'high',
    status: 'in_progress',
    dueDate: '2025-02-18',
    progress: 40,
  },
  {
    id: '3',
    title: 'Setup CI/CD Pipeline',
    assignees: [
      { id: 'u6', name: 'Nina Patel' },
      { id: 'u7', name: 'Carlos Ruiz' },
    ],
    priority: 'medium',
    status: 'completed',
    dueDate: '2025-02-10',
    progress: 100,
  },
  {
    id: '4',
    title: 'Write API Documentation',
    assignees: [
      { id: 'u8', name: 'Emma Chen' },
    ],
    priority: 'low',
    status: 'not_started',
    dueDate: '2025-02-25',
    progress: 0,
  },
  {
    id: '5',
    title: 'Database Schema Migration',
    assignees: [
      { id: 'u9', name: 'David Kim' },
      { id: 'u10', name: 'Rachel Green' },
      { id: 'u11', name: 'Oleg Petrov' },
    ],
    priority: 'high',
    status: 'in_progress',
    dueDate: '2025-02-12',
    progress: 80,
  },
  {
    id: '6',
    title: 'Create Onboarding Flow',
    assignees: [
      { id: 'u12', name: 'Mia Torres' },
    ],
    priority: 'medium',
    status: 'not_started',
    dueDate: '2025-03-01',
    progress: 0,
  },
  {
    id: '7',
    title: 'Performance Optimization Audit',
    assignees: [
      { id: 'u5', name: 'Tom Bradley' },
      { id: 'u9', name: 'David Kim' },
    ],
    priority: 'medium',
    status: 'in_progress',
    dueDate: '2025-02-20',
    progress: 50,
  },
  {
    id: '8',
    title: 'Integrate Payment Gateway',
    assignees: [
      { id: 'u6', name: 'Nina Patel' },
      { id: 'u1', name: 'Sarah Miller' },
      { id: 'u2', name: 'Jake Owen' },
      { id: 'u3', name: 'Li Wei' },
    ],
    priority: 'high',
    status: 'not_started',
    dueDate: '2025-03-05',
    progress: 0,
  },
  {
    id: '9',
    title: 'Mobile Responsive Fixes',
    assignees: [
      { id: 'u12', name: 'Mia Torres' },
    ],
    priority: 'low',
    status: 'completed',
    dueDate: '2025-02-08',
    progress: 100,
  },
  {
    id: '10',
    title: 'Unit Test Coverage Improvement',
    assignees: [
      { id: 'u7', name: 'Carlos Ruiz' },
      { id: 'u8', name: 'Emma Chen' },
    ],
    priority: 'low',
    status: 'in_progress',
    dueDate: '2025-02-22',
    progress: 30,
  },
])

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

function priorityVariant(priority: string) {
  switch (priority) {
    case 'high': return 'destructive' as const
    case 'medium': return 'warning' as const
    case 'low': return 'success' as const
    default: return 'secondary' as const
  }
}

function priorityLabel(priority: string) {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function statusClasses(status: string) {
  switch (status) {
    case 'completed':
      return 'border-transparent bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-400'
    case 'in_progress':
      return 'border-transparent bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
    case 'not_started':
      return 'border-transparent bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400'
    default:
      return ''
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'completed': return 'Completed'
    case 'in_progress': return 'In Progress'
    case 'not_started': return 'Not Started'
    default: return status
  }
}

function progressColor(progress: number) {
  if (progress === 100) return 'bg-lime-500'
  if (progress >= 60) return 'bg-blue-500'
  if (progress >= 30) return 'bg-yellow-500'
  return 'bg-gray-400 dark:bg-gray-500'
}

function progressTrack(progress: number) {
  if (progress === 100) return 'bg-lime-500/20'
  if (progress >= 60) return 'bg-blue-500/20'
  if (progress >= 30) return 'bg-yellow-500/20'
  return 'bg-gray-200 dark:bg-gray-700'
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function visibleAssignees(assignees: TaskItem['assignees']) {
  return assignees.slice(0, 2)
}

function extraAssigneeCount(assignees: TaskItem['assignees']) {
  return assignees.length > 2 ? assignees.length - 2 : 0
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <LayoutPageHeader title="All Tasks" subtitle="Manage and track all your tasks across projects">
      <template #actions>
        <UiButton variant="success" class="shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Create Task
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Toolbar -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <UiInput
          v-model="searchQuery"
          placeholder="Search tasks..."
          class="pl-10"
        />
      </div>
      <div class="flex items-center gap-2">
        <UiDropdown v-model:open="filterOpen">
          <template #trigger>
            <UiButton variant="outline" class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              Filter
              <span
                v-if="hasActiveFilters"
                class="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              >
                {{ (selectedPriority ? 1 : 0) + (selectedStatus ? 1 : 0) }}
              </span>
            </UiButton>
          </template>
          <template #default="{ close }">
            <div class="w-56 p-2">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</p>
              <div class="mb-3 flex flex-wrap gap-1">
                <button
                  v-for="p in ['high', 'medium', 'low']"
                  :key="p"
                  class="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
                  :class="selectedPriority === p
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'"
                  @click="selectedPriority = selectedPriority === p ? null : p"
                >
                  {{ p.charAt(0).toUpperCase() + p.slice(1) }}
                </button>
              </div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
              <div class="mb-3 flex flex-wrap gap-1">
                <button
                  v-for="s in ['completed', 'in_progress', 'not_started']"
                  :key="s"
                  class="rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors"
                  :class="selectedStatus === s
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'"
                  @click="selectedStatus = selectedStatus === s ? null : s"
                >
                  {{ statusLabel(s) }}
                </button>
              </div>
              <div v-if="hasActiveFilters" class="border-t border-border pt-2">
                <button
                  class="w-full rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  @click="clearFilters(); close()"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </template>
        </UiDropdown>
      </div>
    </div>

    <!-- Task Count -->
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{{ filteredTasks.length }} task{{ filteredTasks.length !== 1 ? 's' : '' }}</span>
      <span v-if="hasActiveFilters" class="text-xs">
        &middot;
        <button class="text-primary hover:underline" @click="clearFilters">Clear filters</button>
      </span>
    </div>

    <!-- Tasks Table -->
    <UiCard class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Task</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Assignee</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Priority</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Due Date</th>
              <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Progress</th>
              <th class="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="task in filteredTasks"
              :key="task.id"
              class="border-b border-border last:border-0 transition-colors hover:bg-muted/30"
            >
              <!-- Task Name -->
              <td class="px-6 py-4">
                <span class="font-medium text-foreground">{{ task.title }}</span>
              </td>

              <!-- Assignee -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex -space-x-2">
                    <UiAvatar
                      v-for="assignee in visibleAssignees(task.assignees)"
                      :key="assignee.id"
                      :alt="assignee.name"
                      :src="assignee.avatar"
                      size="sm"
                      class="ring-2 ring-card"
                    />
                    <span
                      v-if="extraAssigneeCount(task.assignees) > 0"
                      class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-card"
                    >
                      +{{ extraAssigneeCount(task.assignees) }}
                    </span>
                  </div>
                  <span class="hidden text-sm text-muted-foreground lg:inline">
                    {{ task.assignees[0]?.name }}
                  </span>
                </div>
              </td>

              <!-- Priority -->
              <td class="px-6 py-4">
                <UiBadge :variant="priorityVariant(task.priority)">
                  {{ priorityLabel(task.priority) }}
                </UiBadge>
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                  :class="statusClasses(task.status)"
                >
                  {{ statusLabel(task.status) }}
                </span>
              </td>

              <!-- Due Date -->
              <td class="px-6 py-4">
                <span class="text-sm text-muted-foreground whitespace-nowrap">{{ formatDate(task.dueDate) }}</span>
              </td>

              <!-- Progress -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 min-w-[140px]">
                  <UiProgress
                    :model-value="task.progress"
                    :class="progressTrack(task.progress)"
                    :indicator-class="progressColor(task.progress)"
                    class="flex-1"
                  />
                  <span class="w-10 text-right text-xs font-medium text-muted-foreground">{{ task.progress }}%</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right">
                <UiDropdown>
                  <template #trigger>
                    <button class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                    </button>
                  </template>
                  <template #default="{ close }">
                    <UiDropdownItem @click="close()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      View Details
                    </UiDropdownItem>
                    <UiDropdownItem @click="close()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Edit Task
                    </UiDropdownItem>
                    <UiDropdownItem @click="close()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                      Move to Board
                    </UiDropdownItem>
                    <div class="my-1 border-t border-border" />
                    <UiDropdownItem class="text-destructive hover:!bg-destructive/10 hover:!text-destructive" @click="close()">
                      <svg xmlns="http://www.w3.org/2000/svg" class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      Delete Task
                    </UiDropdownItem>
                  </template>
                </UiDropdown>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredTasks.length === 0">
              <td colspan="7" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                  <p class="text-sm font-medium text-muted-foreground">No tasks found</p>
                  <p class="text-xs text-muted-foreground/70">Try adjusting your search or filters</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiCard>
  </LayoutPageContainer>
</template>
