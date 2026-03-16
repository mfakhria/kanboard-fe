<script setup lang="ts">
import {
  Users,
  UserPlus,
  Search,
  ArrowLeft,
  FolderKanban,
  Mail,
  Pencil,
  X,
  Camera,
  Check,
} from 'lucide-vue-next'

interface MemberItem {
  id: string
  name: string
  email: string
  role: string
  rawRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  avatar?: string
  joinedAt: string
  projects?: number
  tasks?: number
  online?: boolean
}

definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const teamId = computed(() => route.params.id as string)

const colorStorageKey = computed(() => `workspace:color:${teamId.value}`)
const photoStorageKey = computed(() => `workspace:photo:${teamId.value}`)
const teamColor = ref('linear-gradient(135deg,#478FC8,#3570A5)')
const teamPhoto = ref('')

function showWorkspaceAccessDenied() {
  if (!import.meta.client) return
  window.dispatchEvent(new CustomEvent('app:error-alert', {
    detail: { message: 'You have not been invited to this workspace.' },
  }))
}

function hasWorkspaceAccess(id: string) {
  return workspaceStore.allWorkspaces.some(workspace => workspace.id === id)
}

async function loadTeamWorkspace() {
  if (!teamId.value) return

  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }

  if (!hasWorkspaceAccess(teamId.value)) {
    showWorkspaceAccessDenied()
    await router.replace('/team')
    return
  }

  await workspaceStore.fetchWorkspaceById(teamId.value)

  if (workspaceStore.activeWorkspace?.id !== teamId.value) {
    showWorkspaceAccessDenied()
    await router.replace('/team')
    return
  }

  loadWorkspaceAppearance()
}

const workspace = computed(() => workspaceStore.activeWorkspace)
const projects = computed(() => (workspace.value as any)?.projects ?? [])
const currentUserId = computed(() => authStore.currentUser?.id ?? '')
const isWorkspaceOwner = computed(() => {
  const ws = workspace.value as any
  if (!ws || !currentUserId.value) return false

  if (typeof ws.ownerId === 'string' && ws.ownerId) {
    return ws.ownerId === currentUserId.value
  }

  return (ws.members ?? []).some((m: any) => m.user?.id === currentUserId.value && m.role === 'OWNER')
})

// Map workspace members into card format
const members = computed(() =>
  (workspace.value?.members ?? []).map((m) => ({
    id: m.id,
    name: m.user.name,
    email: m.user.email,
    role: formatRole(m.role),
    rawRole: m.role,
    avatar: m.user.avatar,
    joinedAt: m.joinedAt,
    projects: 0,
    tasks: 0,
    online: false,
  })),
)

// Edit Workspace Modal
const showEditWorkspace = ref(false)
const editForm = reactive({
  name: '',
  description: '',
  color: 'linear-gradient(135deg,#478FC8,#3570A5)',
})
const isSavingEdit = ref(false)
const editWorkspaceError = ref('')

const colorOptions = [
  'linear-gradient(135deg,#478FC8,#3570A5)',
  'linear-gradient(135deg,#3b82f6,#60a5fa)',
  'linear-gradient(135deg,#f97316,#fb923c)',
  'linear-gradient(135deg,#22c55e,#4ade80)',
  'linear-gradient(135deg,#ef4444,#f87171)',
  'linear-gradient(135deg,#8b5cf6,#a78bfa)',
  'linear-gradient(135deg,#ec4899,#f472b6)',
  'linear-gradient(135deg,#eab308,#facc15)',
]

function loadWorkspaceAppearance() {
  if (import.meta.server) return
  teamColor.value = localStorage.getItem(colorStorageKey.value) || 'linear-gradient(135deg,#478FC8,#3570A5)'
  teamPhoto.value = localStorage.getItem(photoStorageKey.value) || ''
}

function saveWorkspaceAppearance() {
  if (import.meta.server) return
  localStorage.setItem(colorStorageKey.value, editForm.color)
  if (teamPhoto.value.trim()) {
    localStorage.setItem(photoStorageKey.value, teamPhoto.value.trim())
  } else {
    localStorage.removeItem(photoStorageKey.value)
  }
}

const editInitial = computed(() => {
  const name = editForm.name.trim()
  if (!name) return 'T'
  return name.charAt(0).toUpperCase()
})

function openEditWorkspace() {
  if (!workspace.value || !isWorkspaceOwner.value) return
  editWorkspaceError.value = ''
  editForm.name = workspace.value.name
  editForm.description = workspace.value.description || ''
  editForm.color = teamColor.value
  showEditWorkspace.value = true
}

async function handleSaveEdit() {
  if (!editForm.name.trim()) return
  editWorkspaceError.value = ''
  isSavingEdit.value = true
  try {
    await workspaceStore.updateWorkspace(teamId.value, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
    })
    teamColor.value = editForm.color
    saveWorkspaceAppearance()
    showEditWorkspace.value = false
  } catch (error: any) {
    console.error('Failed to update workspace:', error)
    const status = error?.response?.status
    const message = error?.response?.data?.message
    if (status === 403) {
      editWorkspaceError.value = Array.isArray(message)
        ? String(message[0] || 'You cannot edit another user\'s workspace.')
        : String(message || 'You cannot edit another user\'s workspace.')
    } else {
      editWorkspaceError.value = 'Failed to save workspace changes. Please try again.'
    }
  } finally {
    isSavingEdit.value = false
  }
}

// Search + filter
const searchQuery = ref('')
const roleFilter = ref<'All' | 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'>('All')

const filteredMembers = computed(() => {
  return members.value.filter((m) => {
    const q = searchQuery.value.toLowerCase()
    const matchQuery =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    const matchRole = roleFilter.value === 'All' || m.rawRole === roleFilter.value
    return matchQuery && matchRole
  })
})

// Invite dialog
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
const isInviting = ref(false)

async function handleInvite() {
  if (!inviteEmail.value.trim()) return
  isInviting.value = true
  try {
    await workspaceStore.inviteMember(teamId.value, { email: inviteEmail.value, role: inviteRole.value as any })
    inviteEmail.value = ''
    inviteRole.value = 'MEMBER'
    showInvite.value = false
  } catch {
    // Error handled in store
  } finally {
    isInviting.value = false
  }
}

// Edit Role dialog
const showEditRole = ref(false)
const editRoleMember = ref<MemberItem | null>(null)
const editRoleValue = ref('')
const isUpdatingRole = ref(false)

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Viewer', value: 'VIEWER' },
]

function handleEditRole(member: MemberItem) {
  editRoleMember.value = member
  editRoleValue.value = member.rawRole
  showEditRole.value = true
}

async function submitEditRole() {
  if (!editRoleMember.value) return
  isUpdatingRole.value = true
  try {
    await workspaceStore.updateMemberRole(teamId.value, editRoleMember.value.id, editRoleValue.value)
    showEditRole.value = false
  } catch {
    // Error handled in store
  } finally {
    isUpdatingRole.value = false
  }
}

// Remove member dialog
const showRemove = ref(false)
const removeMember_ = ref<MemberItem | null>(null)
const isRemoving = ref(false)

function handleRemove(member: MemberItem) {
  removeMember_.value = member
  showRemove.value = true
}

async function submitRemove() {
  if (!removeMember_.value) return
  isRemoving.value = true
  try {
    await workspaceStore.removeMember(teamId.value, removeMember_.value.id)
    showRemove.value = false
  } catch {
    // Error handled in store
  } finally {
    isRemoving.value = false
  }
}

// Helpers
function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

const filterRoles = ['All', 'OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const
function filterLabel(r: string) {
  if (r === 'All') return 'All'
  return r.charAt(0) + r.slice(1).toLowerCase()
}

watch(
  () => teamId.value,
  async () => {
    await loadTeamWorkspace()
  },
  { immediate: true },
)
</script>

<template>
  <LayoutPageContainer>
    <div class="flex flex-col gap-6">
      <!-- Back + Header -->
      <div>
        <NuxtLink
          to="/team"
          class="inline-flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-[#478FC8] transition-colors mb-3"
          style="font-size: 13px; font-weight: 500"
        >
          <ArrowLeft :size="14" />
          Back to Teams
        </NuxtLink>

        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-4">
            <div class="relative">
              <img
                v-if="teamPhoto"
                :src="teamPhoto"
                :alt="workspace?.name || 'Team'"
                class="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
              >
              <div
                v-else
                class="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold"
                :style="{ background: teamColor, fontSize: '18px' }"
              >
                {{ (workspace?.name || 'T').charAt(0).toUpperCase() }}
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div
                class="w-1 h-8 rounded-full"
                style="background: linear-gradient(to bottom, #478FC8, #3570A5)"
              />
              <h1
                class="text-gray-900 dark:text-white"
                style="font-size: clamp(20px, 2.5vw, 28px); font-weight: 900; letter-spacing: -0.8px; line-height: 1.15"
              >
                {{ workspace?.name ?? 'Team' }}
              </h1>
            </div>
            <!-- Edit button -->
            <button
              v-if="isWorkspaceOwner"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-[#478FC8]/40 hover:text-[#478FC8] hover:bg-[#478FC8]/5 dark:hover:bg-[#478FC8]/10 transition-all"
              style="font-size: 12.5px; font-weight: 600"
              @click="openEditWorkspace"
            >
              <Pencil :size="12" />
              Edit
            </button>
          </div>

          <button
            v-if="isWorkspaceOwner"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.30)"
            @click="showInvite = true"
          >
            <UserPlus :size="15" />
            Invite Member
          </button>
        </div>
      </div>

      <!-- Projects Section -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <FolderKanban :size="16" class="text-[#478FC8]" />
          <h2 class="text-gray-900 dark:text-white" style="font-size: 16px; font-weight: 700; letter-spacing: -0.3px">
            Projects ({{ projects.length }})
          </h2>
        </div>

        <div
          v-if="projects.length > 0"
          class="grid gap-4"
          style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))"
        >
          <NuxtLink
            v-for="project in projects"
            :key="project.id"
            :to="`/project/${project.id}`"
            class="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#478FC8]/30 transition-all"
          >
            <div class="flex items-center gap-3 mb-2">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                :style="{ background: project.color || '#478FC8' }"
              >
                {{ project.name?.charAt(0)?.toUpperCase() ?? 'P' }}
              </div>
              <h3
                class="text-gray-900 dark:text-white group-hover:text-[#478FC8] transition-colors truncate"
                style="font-size: 14px; font-weight: 600"
              >
                {{ project.name }}
              </h3>
            </div>
            <p
              v-if="project.description"
              class="text-gray-400 dark:text-gray-500 line-clamp-2"
              style="font-size: 12px"
            >
              {{ project.description }}
            </p>
            <div class="flex items-center gap-2 mt-3">
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-white',
                  project.status === 'ACTIVE' ? 'bg-emerald-500'
                    : project.status === 'COMPLETED' ? 'bg-blue-500'
                    : 'bg-gray-400',
                ]"
                style="font-size: 10.5px; font-weight: 600"
              >
                {{ project.status }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded-full',
                  project.visibility === 'PRIVATE'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                ]"
                style="font-size: 10.5px; font-weight: 600"
              >
                {{ project.visibility }}
              </span>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="text-gray-400 dark:text-gray-500 py-8 text-center" style="font-size: 13px">
          No projects in this team yet.
        </div>
      </section>

      <!-- Members Section -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <Users :size="16" class="text-[#478FC8]" />
          <h2 class="text-gray-900 dark:text-white" style="font-size: 16px; font-weight: 700; letter-spacing: -0.3px">
            Members ({{ members.length }})
          </h2>
        </div>

        <!-- Search + Filter bar -->
        <div class="flex items-center gap-3 flex-wrap mb-4">
          <div class="flex-1 min-w-[200px] relative flex items-center">
            <Search class="absolute left-3.5 z-10 text-gray-400 dark:text-gray-500 pointer-events-none" :size="14" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search members by name, role, or email..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:ring-4 focus:ring-[#478FC8]/10 transition-all shadow-sm"
              style="font-size: 13.5px"
            />
          </div>

          <div class="flex items-center gap-1.5 p-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm">
            <button
              v-for="r in filterRoles"
              :key="r"
              :class="[
                'px-3 py-1.5 rounded-lg transition-all',
                roleFilter === r
                  ? 'bg-[#478FC8] text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/80',
              ]"
              :style="{ fontSize: '12.5px', fontWeight: roleFilter === r ? 700 : 500 }"
              @click="roleFilter = r"
            >
              {{ filterLabel(r) }}
            </button>
          </div>
        </div>

        <!-- Member grid -->
        <div
          v-if="filteredMembers.length > 0"
          class="grid gap-4"
          style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))"
        >
          <TeamMemberCard
            v-for="member in filteredMembers"
            :key="member.id"
            :member="member"
            @edit-role="handleEditRole"
            @remove="handleRemove"
          />

          <!-- Invite placeholder card -->
          <button
            v-if="isWorkspaceOwner"
            class="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-3 py-12 px-6 text-gray-400 dark:text-gray-500 hover:border-[#478FC8]/50 hover:text-[#478FC8] hover:bg-[#478FC8]/5 dark:hover:bg-[#478FC8]/10 transition-all group"
            @click="showInvite = true"
          >
            <div class="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-[#478FC8]/50 flex items-center justify-center transition-all">
              <UserPlus :size="20" />
            </div>
            <span style="font-size: 13.5px; font-weight: 600">Invite member</span>
          </button>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500 gap-2"
        >
          <Users :size="28" style="opacity: 0.4" />
          <p style="font-size: 14px; font-weight: 600">No members found</p>
          <p style="font-size: 12.5px">Try adjusting your search or filter.</p>
        </div>
      </section>
    </div>

    <!-- Invite Member Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showInvite" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="showInvite = false" />

          <div
            class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full mx-4 flex flex-col gap-6 p-7"
            style="max-width: 420px"
          >
            <div class="flex flex-col gap-1">
              <h2 class="text-gray-900 dark:text-gray-100" style="font-size: 18px; font-weight: 800; letter-spacing: -0.4px">
                Invite Member
              </h2>
              <p class="text-gray-400 dark:text-gray-500" style="font-size: 13.5px">
                Send an invitation first. Member can accept or decline from their dashboard notification.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Email address</label>
              <div class="relative flex items-center">
                <Mail class="absolute left-3.5 z-10 text-gray-400 dark:text-gray-500 pointer-events-none" :size="14" />
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-[#478FC8]/10 transition-all"
                  style="font-size: 13.5px"
                />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Role</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="r in (['MEMBER', 'ADMIN'] as const)"
                  :key="r"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border transition-all',
                    inviteRole === r
                      ? 'border-[#478FC8] bg-[#EDF4FF] dark:bg-[#478FC8]/15 text-[#478FC8]'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  :style="{ fontSize: '13px', fontWeight: inviteRole === r ? 700 : 500 }"
                  @click="inviteRole = r"
                >
                  {{ formatRole(r) }}
                </button>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                style="font-size: 14px; font-weight: 600"
                @click="showInvite = false"
              >
                Cancel
              </button>
              <button
                :disabled="isInviting || !inviteEmail.trim()"
                :class="[
                  'flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]',
                  isInviting || !inviteEmail.trim() ? 'opacity-70 cursor-not-allowed' : '',
                ]"
                style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.35)"
                @click="handleInvite"
              >
                {{ isInviting ? 'Sending...' : 'Send Invitation' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Workspace Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showEditWorkspace" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="showEditWorkspace = false" />

          <div
            class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full mx-4 flex flex-col gap-6 p-7"
            style="max-width: 500px"
          >
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-gray-900 dark:text-gray-100" style="font-size: 18px; font-weight: 800; letter-spacing: -0.4px">
                  Edit Workspace
                </h2>
                <p class="text-gray-400 dark:text-gray-500 mt-0.5" style="font-size: 13.5px">
                  Customize your workspace details and appearance.
                </p>
              </div>
              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                @click="showEditWorkspace = false"
              >
                <X :size="16" />
              </button>
            </div>

            <div class="flex flex-col items-center gap-3">
              <div class="relative group">
                <img
                  v-if="teamPhoto"
                  :src="teamPhoto"
                  alt="Workspace photo"
                  class="w-20 h-20 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
                >
                <div
                  v-else
                  class="w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg"
                  :style="{ background: editForm.color, fontSize: '28px', fontWeight: 900 }"
                >
                  {{ editInitial }}
                </div>
                <label class="absolute inset-0 rounded-2xl bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera :size="20" class="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="(e) => {
                      const f = (e.target as HTMLInputElement).files?.[0]
                      if (!f) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        teamPhoto = String(reader.result || '')
                      }
                      reader.readAsDataURL(f)
                    }"
                  >
                </label>
              </div>
              <button
                v-if="teamPhoto"
                class="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                @click="teamPhoto = ''"
              >
                Remove photo
              </button>
              <p class="text-gray-400 dark:text-gray-500" style="font-size: 12px">Click avatar to change photo</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Accent Color</label>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="c in colorOptions"
                  :key="c"
                  class="relative w-8 h-8 rounded-lg transition-all hover:scale-105"
                  :style="{ background: c }"
                  @click="editForm.color = c"
                >
                  <span
                    v-if="editForm.color === c"
                    class="absolute inset-0 rounded-lg ring-2 ring-[#478FC8] ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
                  />
                  <Check
                    v-if="editForm.color === c"
                    class="absolute inset-0 m-auto text-white drop-shadow"
                    :size="14"
                  />
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Workspace Name</label>
              <input
                v-model="editForm.name"
                type="text"
                placeholder="Workspace name"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-[#478FC8]/10 transition-all"
                style="font-size: 13.5px"
              >
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Description</label>
              <textarea
                v-model="editForm.description"
                rows="3"
                placeholder="Brief description of this workspace..."
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-[#478FC8]/10 transition-all resize-none"
                style="font-size: 13.5px"
              />
            </div>

            <div class="flex items-center gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                style="font-size: 14px; font-weight: 600"
                @click="showEditWorkspace = false"
              >
                Cancel
              </button>
              <button
                :disabled="isSavingEdit || !editForm.name.trim()"
                :class="[
                  'flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]',
                  isSavingEdit || !editForm.name.trim() ? 'opacity-70 cursor-not-allowed' : '',
                ]"
                style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.35)"
                @click="handleSaveEdit"
              >
                {{ isSavingEdit ? 'Saving...' : 'Save changes' }}
              </button>
            </div>

            <p v-if="editWorkspaceError" class="text-sm text-red-500 dark:text-red-400">
              {{ editWorkspaceError }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Role Dialog -->
    <UiDialog v-model:open="showEditRole" title="Edit Member Role" description="Change the role for this member.">
      <template #default="{ close }">
        <form v-if="editRoleMember" class="space-y-4" @submit.prevent="submitEditRole">
          <div class="flex items-center gap-3 rounded-lg border p-3">
            <UiAvatar :src="editRoleMember.avatar" :alt="editRoleMember.name" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ editRoleMember.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ editRoleMember.email }}</p>
            </div>
          </div>
          <div>
            <UiLabel for="edit-role">New Role</UiLabel>
            <UiSelect
              v-model="editRoleValue"
              :options="roleOptions"
              class="mt-1.5"
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UiButton variant="outline" type="button" @click="close">Cancel</UiButton>
            <UiButton type="submit" :disabled="isUpdatingRole || editRoleValue === editRoleMember.rawRole">
              {{ isUpdatingRole ? 'Updating...' : 'Update Role' }}
            </UiButton>
          </div>
        </form>
      </template>
    </UiDialog>

    <!-- Remove Member Confirmation Dialog -->
    <UiDialog v-model:open="showRemove" title="Remove Member" description="Are you sure you want to remove this member?">
      <template #default="{ close }">
        <div v-if="removeMember_" class="space-y-4">
          <div class="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <UiAvatar :src="removeMember_.avatar" :alt="removeMember_.name" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">{{ removeMember_.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ removeMember_.email }}</p>
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            This member will lose access to the team and all its projects. This action cannot be undone.
          </p>
          <div class="flex justify-end gap-3 pt-2">
            <UiButton variant="outline" @click="close">Cancel</UiButton>
            <UiButton variant="destructive" :disabled="isRemoving" @click="submitRemove">
              {{ isRemoving ? 'Removing...' : 'Remove Member' }}
            </UiButton>
          </div>
        </div>
      </template>
    </UiDialog>
  </LayoutPageContainer>
</template>
