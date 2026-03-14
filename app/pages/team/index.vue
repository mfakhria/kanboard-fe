<script setup lang="ts">
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Mail,
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

const workspaceStore = useWorkspaceStore()

onMounted(async () => {
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
})

// Map real workspace members into the card format
const members = computed(() =>
  workspaceStore.members.map((m) => ({
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

// Stats
const totalMembers = computed(() => members.value.length)
const totalAdmins = computed(() => members.value.filter((m) => m.rawRole === 'ADMIN' || m.rawRole === 'OWNER').length)
const onlineCount = computed(() => members.value.filter((m) => m.online).length)

// Invite dialog
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'ADMIN' | 'MEMBER' | 'VIEWER'>('MEMBER')
const isInviting = ref(false)

async function handleInvite() {
  if (!inviteEmail.value.trim()) return
  const ws = workspaceStore.activeWorkspace
  if (!ws) return
  isInviting.value = true
  try {
    await workspaceStore.inviteMember(ws.id, { email: inviteEmail.value, role: inviteRole.value as any })
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
  const ws = workspaceStore.activeWorkspace
  if (!ws || !editRoleMember.value) return
  isUpdatingRole.value = true
  try {
    await workspaceStore.updateMemberRole(ws.id, editRoleMember.value.id, editRoleValue.value)
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
  const ws = workspaceStore.activeWorkspace
  if (!ws || !removeMember_.value) return
  isRemoving.value = true
  try {
    await workspaceStore.removeMember(ws.id, removeMember_.value.id)
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
</script>

<template>
  <LayoutPageContainer>
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <div
              class="w-1 h-8 rounded-full"
              style="background: linear-gradient(to bottom, #478FC8, #3570A5)"
            />
            <h1
              style="font-size: clamp(20px, 2.5vw, 28px); font-weight: 900; letter-spacing: -0.8px; color: #0f172a; line-height: 1.15"
            >
              Team
            </h1>
          </div>
          <p class="text-gray-500 pl-4" style="font-size: 13.5px; line-height: 1.6">
            Manage workspace
            <span
              style="font-weight: 600; background: linear-gradient(90deg, #478FC8, #5BA3D9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text"
            >members</span>
            and roles.
          </p>
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.30)"
          @click="showInvite = true"
        >
          <UserPlus :size="15" />
          Invite member
        </button>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Total Members -->
        <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: linear-gradient(135deg, #dbeafe, #eff6ff)"
          >
            <Users :size="20" class="text-[#478FC8]" />
          </div>
          <div>
            <p class="text-gray-400" style="font-size: 12.5px; font-weight: 500">Total Members</p>
            <p class="text-gray-900" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ totalMembers }}
            </p>
          </div>
        </div>

        <!-- Admins & Owners -->
        <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style="background: linear-gradient(135deg, #ede9fe, #f5f3ff)"
          >
            <Shield :size="20" class="text-purple-600" />
          </div>
          <div>
            <p class="text-gray-400" style="font-size: 12.5px; font-weight: 500">Admins & Owners</p>
            <p class="text-gray-900" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ totalAdmins }}
            </p>
          </div>
        </div>

        <!-- Online Now -->
        <div class="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style="background: linear-gradient(135deg, #d1fae5, #ecfdf5)"
          >
            <div class="w-3 h-3 rounded-full bg-green-400 absolute -top-0.5 -right-0.5 border border-white" />
            <Users :size="20" class="text-emerald-600" />
          </div>
          <div>
            <p class="text-gray-400" style="font-size: 12.5px; font-weight: 500">Online Now</p>
            <p class="text-gray-900" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ onlineCount }}
            </p>
          </div>
        </div>
      </div>

      <!-- Search + Filter bar -->
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Search -->
        <div class="flex-1 min-w-[200px] relative flex items-center">
          <Search class="absolute left-3.5 z-10 text-gray-400 pointer-events-none" :size="14" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search members by name, role, or email…"
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#478FC8] focus:ring-4 focus:ring-[#478FC8]/10 transition-all shadow-sm"
            style="font-size: 13.5px"
          />
        </div>

        <!-- Role filter pills -->
        <div class="flex items-center gap-1.5 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
          <button
            v-for="r in filterRoles"
            :key="r"
            :class="[
              'px-3 py-1.5 rounded-lg transition-all',
              roleFilter === r
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
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
          class="bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 py-12 px-6 text-gray-400 hover:border-[#478FC8]/50 hover:text-[#478FC8] hover:bg-[#478FC8]/5 transition-all group"
          @click="showInvite = true"
        >
          <div class="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-[#478FC8]/50 flex items-center justify-center transition-all">
            <UserPlus :size="20" />
          </div>
          <span style="font-size: 13.5px; font-weight: 600">Invite member</span>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-20 text-gray-400 gap-3"
      >
        <Users :size="36" style="opacity: 0.4" />
        <p style="font-size: 15px; font-weight: 600">No members found</p>
        <p style="font-size: 13px">Try adjusting your search or filter.</p>
      </div>
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
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" @click="showInvite = false" />

          <div
            class="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full mx-4 flex flex-col gap-6 p-7"
            style="max-width: 420px"
          >
            <!-- Header -->
            <div class="flex flex-col gap-1">
              <h2 class="text-gray-900" style="font-size: 18px; font-weight: 800; letter-spacing: -0.4px">
                Invite member
              </h2>
              <p class="text-gray-400" style="font-size: 13.5px">
                Send an invitation link to join your workspace.
              </p>
            </div>

            <!-- Email input -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-600" style="font-size: 13px; font-weight: 600">Email address</label>
              <div class="relative flex items-center">
                <Mail class="absolute left-3.5 z-10 text-gray-400 pointer-events-none" :size="14" />
                <input
                  v-model="inviteEmail"
                  type="email"
                  placeholder="colleague@example.com"
                  class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#478FC8] focus:bg-white focus:ring-4 focus:ring-[#478FC8]/10 transition-all"
                  style="font-size: 13.5px"
                />
              </div>
            </div>

            <!-- Role select -->
            <div class="flex flex-col gap-2">
              <label class="text-gray-600" style="font-size: 13px; font-weight: 600">Role</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="r in (['MEMBER', 'ADMIN'] as const)"
                  :key="r"
                  :class="[
                    'flex-1 py-2.5 rounded-xl border transition-all',
                    inviteRole === r
                      ? 'border-[#478FC8] bg-[#EDF4FF] text-[#478FC8]'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
                  ]"
                  :style="{ fontSize: '13px', fontWeight: inviteRole === r ? 700 : 500 }"
                  @click="inviteRole = r"
                >
                  {{ formatRole(r) }}
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
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
                {{ isInviting ? 'Sending...' : 'Send invite' }}
              </button>
            </div>
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
            This member will lose access to the workspace and all its projects. This action cannot be undone.
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
