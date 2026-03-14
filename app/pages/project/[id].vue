<script setup lang="ts">
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  CalendarDays,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreHorizontal,
  X,
  ClipboardList,
  Sparkles,
  Plus,
  ChevronDown,
  Palette,
  Crown,
} from 'lucide-vue-next'
import type { ProjectMember, ProjectInvitation } from '~/features/project/types'

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
  await Promise.all([
    kanbanStore.fetchBoard(projectId.value),
    projectStore.fetchMembers(projectId.value),
  ])
})

const project = computed(() => projectStore.currentProject)

// ─── Role-based access ───
const authStore = useAuthStore()
const myProjectRole = computed(() => {
  const raw = project.value as any
  if (!raw || !authStore.currentUser) return null
  const uid = authStore.currentUser.id
  // Check project membership
  const pm = raw.members?.find((m: any) => m.userId === uid || m.user?.id === uid)
  if (pm) return pm.role as string
  // Check workspace membership
  const wm = raw.workspace?.members?.find((m: any) => m.userId === uid || m.user?.id === uid)
  if (wm && ['OWNER', 'ADMIN'].includes(wm.role)) return wm.role as string
  return null
})
const canManage = computed(() => ['OWNER', 'ADMIN'].includes(myProjectRole.value || ''))
const isViewer = computed(() => myProjectRole.value === 'VIEWER')

// Provide readonly flag to kanban components
provide('projectReadonly', isViewer)

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
  ACTIVE: { label: 'Active', class: 'bg-[#EDF4FF] text-[#478FC8] dark:bg-[#478FC8]/15 dark:text-[#6db3e8]', icon: Loader2 },
  COMPLETED: { label: 'Completed', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400', icon: CheckCircle2 },
  ARCHIVED: { label: 'Archived', class: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: Clock },
}

// ─── Active tab ───
const activeTab = ref<'board' | 'overview' | 'members'>('board')

// ─── Edit Project Dialog ───
const showEditDialog = ref(false)
const editName = ref('')
const editDescription = ref('')
const editColor = ref('#6366f1')
const editDueDate = ref('')
const editPicId = ref('')
const editStatus = ref<'ACTIVE' | 'ARCHIVED' | 'COMPLETED'>('ACTIVE')
const editIcon = ref('FolderKanban')
const editVisibility = ref<'PUBLIC' | 'PRIVATE'>('PUBLIC')
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
  editIcon.value = p.icon || 'FolderKanban'
  editVisibility.value = p.visibility || 'PUBLIC'
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
      visibility: editVisibility.value,
      icon: editIcon.value || undefined,
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

// ─── Members Tab ───
const showInviteDialog = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
const isInviting = ref(false)
const inviteError = ref('')

async function loadMembers() {
  await projectStore.fetchMembers(projectId.value)
  await projectStore.fetchProjectInvitations(projectId.value)
}

watch(activeTab, (tab) => {
  if (tab === 'members') loadMembers()
})

async function handleInvite() {
  if (!inviteEmail.value.trim()) return
  isInviting.value = true
  inviteError.value = ''
  try {
    await projectStore.inviteMember(projectId.value, {
      email: inviteEmail.value.trim(),
      role: inviteRole.value,
    })
    inviteEmail.value = ''
    inviteRole.value = 'MEMBER'
    showInviteDialog.value = false
  } catch (err: any) {
    inviteError.value = err?.response?.data?.message || 'Failed to send invitation'
  } finally {
    isInviting.value = false
  }
}

async function handleRemoveMember(memberId: string) {
  try {
    await projectStore.removeMember(projectId.value, memberId)
  } catch (err) {
    console.error('Failed to remove member:', err)
  }
}

async function handleUpdateRole(memberId: string, role: string) {
  try {
    await projectStore.updateMemberRole(projectId.value, memberId, role)
  } catch (err) {
    console.error('Failed to update role:', err)
  }
}

async function handleCancelInvitation(invitationId: string) {
  try {
    await projectStore.cancelInvitation(projectId.value, invitationId)
  } catch (err) {
    console.error('Failed to cancel invitation:', err)
  }
}

const roleColors: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ADMIN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MEMBER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

const avatarColors = [
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-rose-400 to-red-500',
]

// ─── Overview fields (dynamic) ───
const overviewFields = computed(() => {
  const p = project.value as any
  return [
    { label: 'Project Name', value: p?.name || '-' },
    { label: 'Status', value: statusConfig[p?.status || 'ACTIVE']?.label || '-' },
    { label: 'PIC', value: p?.pic?.name || '-' },
    { label: 'Deadline', value: p?.dueDate ? new Date(p.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' },
    { label: 'Tasks', value: `${taskStats.value.completed} / ${taskStats.value.total}` },
    { label: 'Created', value: p?.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' },
  ]
})

// ─── Member task count from kanban data ───
function getMemberTaskCount(userId: string): number {
  const cols = kanbanStore.columns
  return cols.flatMap(c => c.tasks).filter(t => t.assignees?.some(a => a.id === userId)).length
}

// ─── Column dot colors for task breakdown ───
const columnDotColors = [
  'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-indigo-500',
]
const columnBarColors = [
  'from-blue-400 to-blue-500', 'from-amber-400 to-amber-500', 'from-emerald-400 to-emerald-500', 'from-purple-400 to-purple-500',
  'from-rose-400 to-rose-500', 'from-cyan-400 to-cyan-500', 'from-orange-400 to-orange-500', 'from-indigo-400 to-indigo-500',
]
</script>

<template>
  <LayoutPageContainer>
    <!-- ── Back + Actions ── -->
    <div class="flex items-center justify-between">
      <NuxtLink
        to="/project"
        class="group flex items-center gap-2 text-[13.5px] font-semibold text-gray-500 dark:text-gray-400 hover:text-[#478FC8] transition-colors"
      >
        <ArrowLeft class="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Projects
      </NuxtLink>

      <div v-if="canManage" class="flex items-center gap-2">
        <button
          class="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          @click="openEditDialog"
        >
          <Pencil class="h-3.5 w-3.5 text-[#478FC8]" />
          Edit
        </button>
        <button
          class="flex items-center gap-1.5 rounded-xl border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-[13px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          @click="showDeleteConfirm = true"
        >
          <Trash2 class="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>

    <!-- ── Project Identity Row ── -->
    <div class="flex items-start gap-4">
      <!-- Icon -->
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl border border-white dark:border-gray-700 shadow-md shrink-0"
        :style="{ backgroundColor: ((project as any)?.color || '#478FC8') + '20' }"
      >
        <UiLucideIcon :name="(project as any)?.icon || 'FolderKanban'" :size="26" :style="{ color: (project as any)?.color || '#478FC8' }" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">{{ project?.name }}</h1>
          <span
            v-if="project?.status"
            :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusConfig[project.status]?.class]"
          >
            {{ statusConfig[project.status]?.label }}
          </span>
        </div>
        <p v-if="project?.description" class="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">
          {{ project.description }}
        </p>

        <!-- Meta chips -->
        <div class="flex items-center gap-4 mt-3 flex-wrap">
          <div v-if="(project as any)?.pic" class="flex items-center gap-2">
            <User class="h-3.5 w-3.5 text-gray-400" />
            <span class="text-[12.5px] text-gray-500 dark:text-gray-400">PIC:</span>
            <div class="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white shrink-0">
              {{ (project as any).pic.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
            </div>
            <span class="text-[12.5px] font-semibold text-gray-800 dark:text-gray-200">{{ (project as any).pic.name }}</span>
          </div>
          <div v-if="(project as any)?.pic && (project as any)?.dueDate" class="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div v-if="(project as any)?.dueDate" class="flex items-center gap-1.5">
            <CalendarDays class="h-3.5 w-3.5 text-gray-400" />
            <span class="text-[12.5px] text-gray-500 dark:text-gray-400">Deadline:</span>
            <span class="text-[12.5px] font-semibold text-gray-800 dark:text-gray-200">{{ new Date((project as any).dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
          </div>
          <div class="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <div class="flex items-center gap-1.5">
            <CheckCircle2 class="h-3.5 w-3.5 text-emerald-500" />
            <span class="text-[12.5px] font-semibold text-gray-800 dark:text-gray-200">
              {{ taskStats.completed }}/{{ taskStats.total }} tasks ({{ taskStats.progress }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Overall Progress ── -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">Overall Progress</span>
        <span
          class="text-[13px] font-bold"
          :class="taskStats.progress >= 100 ? 'text-emerald-600' : taskStats.progress > 0 ? 'text-[#478FC8]' : 'text-gray-400'"
        >
          {{ taskStats.progress }}%
        </span>
      </div>
      <div class="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r transition-all duration-700"
          :class="
            taskStats.progress >= 100
              ? 'from-green-400 to-emerald-500'
              : taskStats.progress > 50
                ? 'from-[#6db3e8] to-[#478FC8]'
                : taskStats.progress > 0
                  ? 'from-amber-400 to-orange-500'
                  : 'from-gray-200 to-gray-300'
          "
          :style="{ width: `${Math.max(taskStats.progress, taskStats.progress === 0 ? 0 : 2)}%` }"
        />
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="flex items-center gap-0 border-b border-gray-100 dark:border-gray-800 -mb-px">
      <button
        :class="[
          'relative flex items-center gap-2 px-4 py-3 text-[13.5px] transition-all',
          activeTab === 'board' ? 'text-[#478FC8] font-bold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300'
        ]"
        @click="activeTab = 'board'"
      >
        <ClipboardList class="h-3.5 w-3.5" />
        Kanban Board
        <span v-if="activeTab === 'board'" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#478FC8]" />
      </button>
      <button
        :class="[
          'relative flex items-center gap-2 px-4 py-3 text-[13.5px] transition-all',
          activeTab === 'overview' ? 'text-[#478FC8] font-bold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300'
        ]"
        @click="activeTab = 'overview'"
      >
        <Sparkles class="h-3.5 w-3.5" />
        Overview
        <span v-if="activeTab === 'overview'" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#478FC8]" />
      </button>
      <button
        :class="[
          'relative flex items-center gap-2 px-4 py-3 text-[13.5px] transition-all',
          activeTab === 'members' ? 'text-[#478FC8] font-bold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300'
        ]"
        @click="activeTab = 'members'"
      >
        <Users class="h-3.5 w-3.5" />
        Members
        <span class="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-400">
          {{ projectStore.currentMembers.length || 0 }}
        </span>
        <span v-if="activeTab === 'members'" class="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#478FC8]" />
      </button>
    </div>

    <!-- Tab Content: Board -->
    <div v-show="activeTab === 'board'" class="mt-4">
      <KanbanBoard />
    </div>

    <!-- Tab Content: Overview -->
    <div v-show="activeTab === 'overview'" class="mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Project Details Card -->
        <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Project Details</h3>
          </div>
          <div class="divide-y divide-gray-50 dark:divide-gray-800/60">
            <!-- Status -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Status</span>
              <span
                v-if="project?.status"
                :class="['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusConfig[project.status]?.class]"
              >
                {{ statusConfig[project.status]?.label }}
              </span>
              <span v-else class="text-sm text-gray-400">-</span>
            </div>
            <!-- Color -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Color</span>
              <div class="flex items-center gap-2">
                <div class="h-5 w-5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm" :style="{ backgroundColor: (project as any)?.color || '#478FC8' }" />
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ (project as any)?.color || '#478FC8' }}</span>
              </div>
            </div>
            <!-- PIC -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">PIC</span>
              <div v-if="(project as any)?.pic" class="flex items-center gap-2">
                <div
                  class="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[9px] font-bold text-white shrink-0"
                >
                  {{ (project as any).pic.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
                </div>
                <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ (project as any).pic.name }}</span>
              </div>
              <span v-else class="text-sm text-gray-400">Not assigned</span>
            </div>
            <!-- Deadline -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Deadline</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {{ (project as any)?.dueDate ? new Date((project as any).dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline' }}
              </span>
            </div>
            <!-- Created -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Created</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {{ (project as any)?.createdAt ? new Date((project as any).createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-' }}
              </span>
            </div>
            <!-- Visibility -->
            <div class="flex items-center justify-between px-6 py-4">
              <span class="text-[13px] text-gray-500 dark:text-gray-400 font-medium">Visibility</span>
              <span class="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">{{ ((project as any)?.visibility || 'PUBLIC').toLowerCase() }}</span>
            </div>
          </div>
        </div>

        <!-- Task Breakdown by Column Card -->
        <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Task Breakdown by Column</h3>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div v-for="(col, idx) in kanbanStore.columns" :key="col.id" class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-2.5 w-2.5 rounded-full" :class="columnDotColors[idx % columnDotColors.length]" />
                  <span class="text-[13px] font-medium text-gray-700 dark:text-gray-300">{{ col.title }}</span>
                </div>
                <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ col.tasks.length }} tasks</span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                  :class="columnBarColors[idx % columnBarColors.length]"
                  :style="{
                    width: taskStats.total > 0 ? `${(col.tasks.length / taskStats.total) * 100}%` : '0%',
                  }"
                />
              </div>
            </div>
            <p v-if="kanbanStore.columns.length === 0" class="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No columns yet.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Content: Members -->
    <div v-show="activeTab === 'members'" class="mt-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Project Members</h3>
          <p class="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">Manage team members and their roles in this project</p>
        </div>
        <button
          v-if="canManage"
          class="flex items-center gap-2 rounded-xl bg-[#478FC8] hover:bg-[#3a7bb3] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all"
          @click="showInviteDialog = true"
        >
          <UserPlus class="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <!-- Members Grid -->
      <div class="space-y-3">
        <div
          v-for="(member, idx) in projectStore.currentMembers"
          :key="member.id"
          class="flex items-center gap-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4 hover:border-[#478FC8]/20 hover:shadow-sm transition-all"
        >
          <!-- Avatar -->
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white shrink-0 shadow-sm"
            :class="avatarColors[idx % avatarColors.length]"
          >
            {{ member.user.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>

          <!-- Name + Email -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-800 dark:text-white truncate">{{ member.user.name }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ member.user.email }}</p>
          </div>

          <!-- Task count -->
          <div class="hidden sm:flex items-center gap-1.5 text-gray-400 dark:text-gray-500 shrink-0">
            <ClipboardList class="h-3.5 w-3.5" />
            <span class="text-[12px] font-medium">{{ getMemberTaskCount(member.userId) }} tasks</span>
          </div>

          <!-- Role Badge & Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- OWNER gets gradient badge -->
            <template v-if="member.role === 'OWNER'">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Crown class="h-3 w-3" />
                OWNER
              </span>
            </template>

            <!-- Non-OWNER: green badge + actions -->
            <template v-else>
              <span class="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {{ member.role }}
              </span>

              <template v-if="canManage">
                <!-- Role dropdown -->
                <div class="relative">
                  <select
                    :value="member.role"
                    class="appearance-none text-xs border border-gray-200 dark:border-gray-700 rounded-lg pl-2.5 pr-7 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#478FC8] focus:border-[#478FC8]"
                    @change="handleUpdateRole(member.id, ($event.target as HTMLSelectElement).value)"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <ChevronDown class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                </div>

                <!-- Remove button -->
                <button
                  class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 dark:text-gray-600 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                  title="Remove member"
                  @click="handleRemoveMember(member.id)"
                >
                  <X class="h-4 w-4" />
                </button>
              </template>
            </template>
          </div>
        </div>
      </div>

      <div v-if="projectStore.currentMembers.length === 0" class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
        <Users class="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No members yet</p>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Invite team members to start collaborating</p>
      </div>

      <!-- Pending Invitations -->
      <div v-if="projectStore.currentInvitations.length > 0" class="mt-8">
        <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Pending Invitations</h4>
        <div class="space-y-2">
          <div
            v-for="inv in projectStore.currentInvitations"
            :key="inv.id"
            class="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-4"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                <Mail class="h-4 w-4" />
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ inv.email }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">Invited as {{ inv.role }} &middot; Expires {{ new Date(inv.expiresAt).toLocaleDateString() }}</p>
              </div>
            </div>
            <button
              class="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
              @click="handleCancelInvitation(inv.id)"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </LayoutPageContainer>

  <!-- ═══ Edit Project Dialog ═══ -->
  <UiDialog v-model:open="showEditDialog" title="Edit Project" description="Update project details.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="handleSaveEdit">
        <div>
          <UiLabel>Icon</UiLabel>
          <div class="mt-1.5">
            <UiIconPicker v-model="editIcon" />
          </div>
        </div>
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
        <div>
          <UiLabel for="edit-visibility">Visibility</UiLabel>
          <select
            id="edit-visibility"
            v-model="editVisibility"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="PUBLIC">Public — Visible to all workspace members</option>
            <option value="PRIVATE">Private — Only invited members</option>
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

  <!-- ═══ Invite Member Dialog ═══ -->
  <UiDialog v-model:open="showInviteDialog" title="Invite Member" description="Send an invitation to join this project.">
    <template #default="{ close }">
      <form class="space-y-4" @submit.prevent="handleInvite">
        <div>
          <UiLabel for="invite-email">Email Address</UiLabel>
          <UiInput
            id="invite-email"
            v-model="inviteEmail"
            type="email"
            placeholder="colleague@example.com"
            class="mt-1.5"
          />
        </div>
        <div>
          <UiLabel for="invite-role">Role</UiLabel>
          <select
            id="invite-role"
            v-model="inviteRole"
            class="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ADMIN">Admin - Can manage project & invite others</option>
            <option value="MEMBER">Member - Can create & edit tasks</option>
            <option value="VIEWER">Viewer - Read-only access</option>
          </select>
        </div>
        <div v-if="inviteError" class="rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {{ inviteError }}
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <UiButton variant="outline" type="button" @click="close()">Cancel</UiButton>
          <UiButton type="submit" :disabled="isInviting || !inviteEmail.trim()" class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white gap-1.5">
            <UserPlus class="h-4 w-4" />
            {{ isInviting ? 'Sending...' : 'Send Invitation' }}
          </UiButton>
        </div>
      </form>
    </template>
  </UiDialog>
</template>
