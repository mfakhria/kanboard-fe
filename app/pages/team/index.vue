<script setup lang="ts">
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Crown,
  Eye,
  UserCog,
} from 'lucide-vue-next'

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
  })),
)

// Search
const searchQuery = ref('')
const filteredMembers = computed(() => {
  if (!searchQuery.value.trim()) return members.value
  const q = searchQuery.value.toLowerCase()
  return members.value.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q),
  )
})

// Stats
const statsCards = computed(() => {
  const total = members.value.length
  const admins = members.value.filter((m) => m.rawRole === 'ADMIN' || m.rawRole === 'OWNER').length
  return [
    { title: 'Total Members', value: total, icon: Users, color: 'text-[#478FC8]', bgColor: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10' },
    { title: 'Admins', value: admins, icon: Shield, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/10' },
  ]
})

// Invite dialog
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('MEMBER')
const isInviting = ref(false)

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Viewer', value: 'VIEWER' },
]

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

// View Profile dialog
const showProfile = ref(false)
const profileMember = ref<typeof members.value[0] | null>(null)

function handleViewProfile(member: typeof members.value[0]) {
  profileMember.value = member
  showProfile.value = true
}

// Edit Role dialog
const showEditRole = ref(false)
const editRoleMember = ref<typeof members.value[0] | null>(null)
const editRoleValue = ref('')
const isUpdatingRole = ref(false)

function handleEditRole(member: typeof members.value[0]) {
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
const removeMember_ = ref<typeof members.value[0] | null>(null)
const isRemoving = ref(false)

function handleRemove(member: typeof members.value[0]) {
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'OWNER': return Crown
    case 'ADMIN': return Shield
    case 'VIEWER': return Eye
    default: return UserCog
  }
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <LayoutPageHeader title="Team" subtitle="Manage workspace members and roles.">
      <template #actions>
        <UiButton class="gap-2" @click="showInvite = true">
          <UserPlus class="h-4 w-4" />
          Invite member
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      <UiCard
        v-for="(stat, idx) in statsCards"
        :key="idx"
        class="flex items-center gap-3 p-4"
      >
        <div :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', stat.bgColor]">
          <component :is="stat.icon" :class="['h-5 w-5', stat.color]" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-medium text-muted-foreground truncate">{{ stat.title }}</p>
          <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
        </div>
      </UiCard>
    </div>

    <!-- Search Bar -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <UiInput
        v-model="searchQuery"
        placeholder="Search members by name, role, or email..."
        class="pl-10"
      />
    </div>

    <!-- Members Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <TeamMemberCard
        v-for="member in filteredMembers"
        :key="member.id"
        :member="member"
        @view-profile="handleViewProfile"
        @edit-role="handleEditRole"
        @remove="handleRemove"
      />
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredMembers.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <Users class="h-12 w-12 text-muted-foreground/50" />
      <p class="mt-4 text-sm font-medium text-muted-foreground">No members found</p>
      <p class="mt-1 text-xs text-muted-foreground/70">Try adjusting your search or invite new members.</p>
    </div>

    <!-- Invite Member Dialog -->
    <UiDialog v-model:open="showInvite" title="Invite Member" description="Send an invitation to join this workspace.">
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
            <UiSelect
              v-model="inviteRole"
              :options="roleOptions"
              class="mt-1.5"
            />
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <UiButton variant="outline" type="button" @click="close">Cancel</UiButton>
            <UiButton type="submit" :disabled="isInviting || !inviteEmail.trim()">
              {{ isInviting ? 'Sending...' : 'Send Invite' }}
            </UiButton>
          </div>
        </form>
      </template>
    </UiDialog>

    <!-- View Profile Dialog -->
    <UiDialog v-model:open="showProfile" title="Member Profile">
      <template #default="{ close }">
        <div v-if="profileMember" class="space-y-4">
          <div class="flex flex-col items-center">
            <UiAvatar :src="profileMember.avatar" :alt="profileMember.name" size="xl" />
            <h3 class="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{{ profileMember.name }}</h3>
            <p class="text-sm text-muted-foreground">{{ profileMember.email }}</p>
          </div>
          <div class="space-y-3 rounded-lg border p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Role</span>
              <div class="flex items-center gap-1.5">
                <component :is="getRoleIcon(profileMember.rawRole)" class="h-3.5 w-3.5 text-muted-foreground" />
                <span class="text-sm font-medium">{{ profileMember.role }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Joined</span>
              <span class="text-sm font-medium">{{ formatDate(profileMember.joinedAt) }}</span>
            </div>
          </div>
          <div class="flex justify-end pt-2">
            <UiButton variant="outline" @click="close">Close</UiButton>
          </div>
        </div>
      </template>
    </UiDialog>

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
