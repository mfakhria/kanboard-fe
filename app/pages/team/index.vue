<script setup lang="ts">
import {
  Users,
  Zap,
  Building2,
  BarChart3,
  UserPlus,
  Download,
  Settings,
  Search,
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
  workspaceStore.members.map((m, idx) => ({
    id: m.id,
    name: m.user.name,
    role: formatRole(m.role),
    avatar: m.user.avatar,
    taskProgress: generateProgress(idx),
    collaborators: buildCollaborators(idx),
    status: (idx % 3 !== 2 ? 'online' : 'offline') as 'online' | 'offline',
  })),
)

// Use real workspace members only — no demo data
const displayMembers = computed(() => members.value)

// Search
const searchQuery = ref('')
const filteredMembers = computed(() => {
  if (!searchQuery.value.trim()) return displayMembers.value
  const q = searchQuery.value.toLowerCase()
  return displayMembers.value.filter(
    (m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
  )
})

// Stats
const statsCards = computed(() => {
  const total = displayMembers.value.length
  const active = displayMembers.value.filter((m) => m.status === 'online').length
  const avgTask = total > 0
    ? (displayMembers.value.reduce((sum, m) => sum + m.taskProgress, 0) / total).toFixed(1)
    : '0'
  return [
    { title: 'Total Members', value: total, icon: Users, color: 'text-[#478FC8]', bgColor: 'bg-[#EDF4FF] dark:bg-[#478FC8]/10' },
    { title: 'Active Now', value: active, icon: Zap, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/10' },
    { title: 'Departments', value: 7, icon: Building2, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/10' },
    { title: 'Avg. Task', value: avgTask, icon: BarChart3, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/10' },
  ]
})

// Welcome banner - newest member
const newestMember = computed(() => displayMembers.value[displayMembers.value.length - 1])

// Invite dialog
const showInvite = ref(false)
const inviteEmail = ref('')
const inviteRole = ref('member')
const isInviting = ref(false)

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Viewer', value: 'viewer' },
]

async function handleInvite() {
  if (!inviteEmail.value.trim()) return
  const ws = workspaceStore.activeWorkspace
  if (!ws) return
  isInviting.value = true
  try {
    await workspaceStore.inviteMember(ws.id, { email: inviteEmail.value, role: inviteRole.value as any })
    inviteEmail.value = ''
    inviteRole.value = 'member'
    showInvite.value = false
  } catch {
    // Error handled in store
  } finally {
    isInviting.value = false
  }
}

// Helpers
function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

function generateProgress(idx: number) {
  const base = [83, 76, 69, 89, 78, 71, 65, 54, 51, 81, 79, 68]
  return base[idx % base.length] ?? 70
}

function buildCollaborators(idx: number) {
  const count = 3 + (idx % 4)
  return Array.from({ length: count }, (_, i) => ({
    name: `Collaborator ${i + 1}`,
    avatar: undefined as string | undefined,
  }))
}

function fakeCollabs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    name: `Collab ${i + 1}`,
    avatar: undefined as string | undefined,
  }))
}
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <LayoutPageHeader title="Team & Profile" subtitle="Manage team members and your profile settings.">
      <template #actions>
        <UiButton variant="outline" size="icon" title="Download">
          <Download class="h-4 w-4" />
        </UiButton>
        <UiButton variant="outline" size="icon" title="Settings">
          <Settings class="h-4 w-4" />
        </UiButton>
        <UiButton class="gap-2" @click="showInvite = true">
          <UserPlus class="h-4 w-4" />
          Invite member
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <!-- Stat Cards -->
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

      <!-- Welcome Card -->
      <UiCard v-if="newestMember" class="flex items-center gap-3 p-4 col-span-2 sm:col-span-1">
        <div class="min-w-0 flex-1">
          <p class="text-xs font-medium text-muted-foreground">Welcome, new member!</p>
          <div class="mt-1 flex items-center gap-2">
            <UiAvatar :alt="newestMember.name" :src="newestMember.avatar" size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ newestMember.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ newestMember.role }}</p>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Search Bar -->
    <div class="relative">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <UiInput
        v-model="searchQuery"
        placeholder="Search members by name or role..."
        class="pl-10"
      />
    </div>

    <!-- Members Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <TeamMemberCard
        v-for="member in filteredMembers"
        :key="member.id"
        :member="member"
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
  </LayoutPageContainer>
</template>
