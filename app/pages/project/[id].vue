<script setup lang="ts">
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Trash2,
  User,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const kanbanStore = useKanbanStore()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()

const projectId = computed(() => route.params.id as string)

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
  await projectStore.fetchProjectById(projectId.value)
  await kanbanStore.fetchBoard(projectId.value)
})

const project = computed(() => projectStore.currentProject)

// ─── Task Stats ───
const taskStats = computed(() => {
  const cols = kanbanStore.columns
  const allTasks = cols.flatMap(c => c.tasks)
  const doneTasks = cols
    .filter(c => c.title.toLowerCase() === 'done' || c.title.toLowerCase() === 'completed')
    .flatMap(c => c.tasks)
  return {
    total: allTasks.length,
    completed: doneTasks.length,
    progress: allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0,
  }
})

// ─── Status helpers ───
const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  ACTIVE: { label: 'Active', class: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400', icon: Loader2 },
  COMPLETED: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2 },
  ARCHIVED: { label: 'Archived', class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
}

// ─── Active tab ───
const activeTab = ref<'board' | 'overview'>('board')

// ─── Edit Project Dialog ───
const showEditDialog = ref(false)
const editName = ref('')
const editDescription = ref('')
const editColor = ref('#6366f1')
const editDueDate = ref('')
const editPicId = ref('')
const editStatus = ref<'ACTIVE' | 'ARCHIVED' | 'COMPLETED'>('ACTIVE')
const isSaving = ref(false)

const wsMembers = computed(() => {
  const raw = project.value as any
  return raw?.workspace?.members ?? workspaceStore.members
})

function openEditDialog() {
  if (!project.value) return
  const p = project.value as any
  editName.value = p.name
  editDescription.value = p.description || ''
  editColor.value = p.color || '#6366f1'
  editDueDate.value = p.dueDate ? new Date(p.dueDate).toISOString().split('T')[0] ?? '' : ''
  editPicId.value = p.picId || ''
  editStatus.value = p.status || 'ACTIVE'
  showEditDialog.value = true
}

async function handleSaveEdit() {
  if (!editName.value.trim()) return
  isSaving.value = true
  try {
    await projectStore.updateProject(projectId.value, {
      name: editName.value.trim(),
      description: editDescription.value.trim() || undefined,
      color: editColor.value || undefined,
      dueDate: editDueDate.value || undefined,
      picId: editPicId.value || undefined,
      status: editStatus.value,
    })
    // Refresh to get updated data
    await projectStore.fetchProjectById(projectId.value)
    showEditDialog.value = false
  } catch (error) {
    console.error('Failed to update project:', error)
  } finally {
    isSaving.value = false
  }
}

// ─── Delete Project ───
const showDeleteConfirm = ref(false)
const isDeleting = ref(false)

async function handleDeleteProject() {
  isDeleting.value = true
  try {
    await projectStore.deleteProject(projectId.value)
    router.push('/project')
  } catch (error) {
    console.error('Failed to delete project:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Breadcrumb + Back -->
    <div class="flex items-center gap-2 mb-2">
      <NuxtLink to="/project" class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft class="h-4 w-4" />
        Projects
      </NuxtLink>
      <span class="text-gray-300 dark:text-gray-600">/</span>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project?.name || 'Project' }}</span>
    </div>

    <!-- Project Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-4">
        <!-- Color indicator -->
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl text-xl shrink-0"
          :style="{ backgroundColor: ((project as any)?.color || '#6366f1') + '20' }"
        >
          <FolderKanban class="h-6 w-6" :style="{ color: (project as any)?.color || '#6366f1' }" />
        </div>
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ project?.name }}</h1>
            <span
              v-if="project?.status"
              :class="['inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', statusConfig[project.status]?.class]"
            >
              {{ statusConfig[project.status]?.label }}
            </span>
          </div>
          <p v-if="project?.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-xl">
            {{ project.description }}
          </p>
          <!-- Meta row -->
          <div class="flex flex-wrap items-center gap-4 mt-3">
            <div v-if="(project as any)?.pic" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User class="h-4 w-4" />
              <span>PIC: <strong class="text-gray-800 dark:text-gray-200">{{ (project as any).pic.name }}</strong></span>
            </div>
            <div v-if="(project as any)?.dueDate" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar class="h-4 w-4" />
              <span>Deadline: <strong class="text-gray-800 dark:text-gray-200">{{ new Date((project as any).dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</strong></span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle2 class="h-4 w-4" />
              <span>{{ taskStats.completed }}/{{ taskStats.total }} tasks ({{ taskStats.progress }}%)</span>
            </div>
          </div>
        </div>
      </div>
      <!-- Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <UiButton variant="outline" size="sm" class="gap-1.5" @click="openEditDialog">
          <Edit3 class="h-4 w-4" />
          Edit
        </UiButton>
        <UiButton variant="outline" size="sm" class="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20" @click="showDeleteConfirm = true">
          <Trash2 class="h-4 w-4" />
          Delete
        </UiButton>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-4">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">Overall Progress</span>
        <span class="text-xs font-bold" :class="taskStats.progress >= 100 ? 'text-emerald-600' : taskStats.progress >= 50 ? 'text-[#478FC8]' : 'text-gray-500'">{{ taskStats.progress }}%</span>
      </div>
      <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
        <div
          class="h-full rounded-full transition-all"
          :class="taskStats.progress >= 100 ? 'bg-emerald-500' : taskStats.progress >= 50 ? 'bg-[#478FC8]' : 'bg-amber-500'"
          :style="{ width: `${taskStats.progress}%` }"
        />
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 mt-6 -mb-px">
      <button
        :class="['px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', activeTab === 'board' ? 'border-[#478FC8] text-[#478FC8]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']"
        @click="activeTab = 'board'"
      >
        Kanban Board
      </button>
      <button
        :class="['px-4 py-2.5 text-sm font-medium border-b-2 transition-colors', activeTab === 'overview' ? 'border-[#478FC8] text-[#478FC8]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200']"
        @click="activeTab = 'overview'"
      >
        Overview
      </button>
    </div>

    <!-- Tab Content: Board -->
    <div v-show="activeTab === 'board'" class="mt-4">
      <KanbanKanbanBoard />
    </div>

    <!-- Tab Content: Overview -->
    <div v-show="activeTab === 'overview'" class="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Info Card -->
      <UiCard class="p-5 lg:col-span-1">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Project Details</h3>
        <dl class="space-y-3">
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">Status</dt>
            <dd class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{{ statusConfig[project?.status || 'ACTIVE']?.label }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">Color</dt>
            <dd class="mt-0.5 flex items-center gap-2">
              <span class="h-4 w-4 rounded-full border" :style="{ backgroundColor: (project as any)?.color || '#6366f1' }" />
              <span class="text-sm text-gray-700 dark:text-gray-300">{{ (project as any)?.color || '#6366f1' }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">PIC</dt>
            <dd class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{{ (project as any)?.pic?.name || '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">Deadline</dt>
            <dd class="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{{ (project as any)?.dueDate ? new Date((project as any).dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-' }}</dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">Created</dt>
            <dd class="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{{ project?.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-' }}</dd>
          </div>
        </dl>
      </UiCard>

      <!-- Column breakdown -->
      <UiCard class="p-5 lg:col-span-2">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Task Breakdown by Column</h3>
        <div class="space-y-3">
          <div v-for="col in kanbanStore.columns" :key="col.id" class="flex items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ col.title }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ col.tasks.length }} tasks</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{
                    width: taskStats.total > 0 ? `${(col.tasks.length / taskStats.total) * 100}%` : '0%',
                    backgroundColor: col.color || '#6366f1',
                  }"
                />
              </div>
            </div>
          </div>
          <p v-if="kanbanStore.columns.length === 0" class="text-sm text-gray-400 dark:text-gray-500">No columns yet.</p>
        </div>
      </UiCard>
    </div>
  </LayoutPageContainer>

  <!-- ═══ Edit Project Dialog ═══ -->
  <UiDialog v-model:open="showEditDialog" title="Edit Project" description="Update project details.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="handleSaveEdit">
        <div>
          <UiLabel for="edit-name">Project Name</UiLabel>
          <UiInput id="edit-name" v-model="editName" placeholder="Project name" class="mt-1.5" />
        </div>
        <div>
          <UiLabel for="edit-desc">Description</UiLabel>
          <UiTextarea id="edit-desc" v-model="editDescription" placeholder="Project description..." class="mt-1.5" rows="3" />
        </div>
        <div>
          <UiLabel for="edit-status">Status</UiLabel>
          <select
            id="edit-status"
            v-model="editStatus"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <UiLabel for="edit-color">Color</UiLabel>
            <UiInput id="edit-color" v-model="editColor" type="color" class="mt-1.5 h-10" />
          </div>
          <div>
            <UiLabel for="edit-due">Deadline</UiLabel>
            <UiInput id="edit-due" v-model="editDueDate" type="date" class="mt-1.5" />
          </div>
        </div>
        <div>
          <UiLabel for="edit-pic">PIC (Person In Charge)</UiLabel>
          <select
            id="edit-pic"
            v-model="editPicId"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">-- No PIC --</option>
            <option v-for="m in wsMembers" :key="m.userId" :value="m.userId">{{ m.user?.name || m.userId }}</option>
          </select>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" type="button" @click="close()">Cancel</UiButton>
          <UiButton type="submit" :disabled="isSaving || !editName.trim()" class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white">
            {{ isSaving ? 'Saving...' : 'Save Changes' }}
          </UiButton>
        </div>
      </form>
    </template>
  </UiDialog>

  <!-- ═══ Delete Confirmation Dialog ═══ -->
  <UiDialog v-model:open="showDeleteConfirm" title="Delete Project" description="This action cannot be undone.">
    <template #default="{ close }">
      <div class="space-y-4">
        <div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
          <div class="flex items-start gap-3">
            <AlertTriangle class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p class="text-sm font-medium text-red-800 dark:text-red-300">Are you sure you want to delete "{{ project?.name }}"?</p>
              <p class="mt-1 text-sm text-red-600 dark:text-red-400">All boards, columns, tasks, and comments in this project will be permanently deleted.</p>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3">
          <UiButton variant="outline" @click="close()">Cancel</UiButton>
          <UiButton
            :disabled="isDeleting"
            class="bg-red-600 hover:bg-red-700 text-white"
            @click="handleDeleteProject"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Project' }}
          </UiButton>
        </div>
      </div>
    </template>
  </UiDialog>
</template>
