<script setup lang="ts">
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  FolderKanban,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Grid2x2,
  ChevronsUpDown,
  Check,
} from 'lucide-vue-next'

const { mobileDrawerOpen, toggleMobileDrawer } = useLayoutState()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { badgeLabel, fetchTaskCount } = useTaskCount()
const workspaceStore = useWorkspaceStore()
const showTeamSwitcher = ref(false)

const currentTeam = computed(() => workspaceStore.activeWorkspace)
const teams = computed(() => {
  const userId = authStore.currentUser?.id
  if (!userId) return []

  return workspaceStore.allWorkspaces.filter((workspace: any) => {
    if (workspace?.ownerId === userId) return true
    return (workspace?.members ?? []).some((member: any) => member?.user?.id === userId)
  })
})

const teamInitial = computed(() => {
  const name = currentTeam.value?.name
  if (!name) return 'T'
  return name.charAt(0).toUpperCase()
})

async function switchTeam(teamId: string) {
  const canAccessTeam = teams.value.some(team => team.id === teamId)
  if (!canAccessTeam) return

  showTeamSwitcher.value = false
  await workspaceStore.setCurrentWorkspace(teamId)
  await fetchTaskCount()
}

onMounted(async () => {
  const workspaceStore = useWorkspaceStore()
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
})

watch(
  () => workspaceStore.activeWorkspace?.id,
  async (workspaceId, prevWorkspaceId) => {
    if (workspaceId !== prevWorkspaceId) {
      await fetchTaskCount()
    }
  },
  { immediate: true },
)

const menuItems = computed(() => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/project' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks', badge: badgeLabel.value },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Users, label: 'Team', href: '/team' },
])

const generalItems = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  { icon: HelpCircle, label: 'Help', href: '/dashboard/help' },
]

const isActive = (href: string) => {
  if (href === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(href)
}

const closeDrawer = () => {
  mobileDrawerOpen.value = false
}

const navigateTo = (href: string) => {
  router.push(href)
  closeDrawer()
}

const handleLogout = async () => {
  await authStore.logout()
  closeDrawer()
  router.push('/auth/login')
}

const userInitials = computed(() => {
  const name = authStore.currentUser?.name
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const first = parts[0]?.[0] ?? ''
    const second = parts[1]?.[0] ?? ''
    return `${first}${second}`.toUpperCase() || '?'
  }
  return name.slice(0, 2).toUpperCase()
})
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="mobileDrawerOpen" class="fixed inset-0 z-50 bg-black/50 lg:hidden" @click="closeDrawer" />
    </Transition>

    <!-- Drawer -->
    <Transition enter-active-class="transition-transform duration-300" enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300"
      leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
      <aside v-if="mobileDrawerOpen"
        class="mobile-drawer-root fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col bg-white dark:bg-gray-900 shadow-xl lg:hidden"
        style="border-right: 1px solid #f1f5f9;">

        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-[18px] border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div
              class="shrink-0 flex items-center justify-center rounded-xl"
              style="width: 36px; height: 36px; background: linear-gradient(135deg, #478FC8 0%, #2d6da3 100%); box-shadow: 0 4px 12px rgba(71,143,200,0.35);"
            >
              <Grid2x2 style="width: 17px; height: 17px; color: #fff;" :stroke-width="2.5" />
            </div>
            <div>
              <span
                class="block select-none"
                style="font-size: 19px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(135deg, #2d6da3 0%, #478FC8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
              >
                kanzon
              </span>
              <span class="block text-gray-400" style="font-size: 10px; font-weight: 500; margin-top: -1px;">
                Project Management
              </span>
            </div>
          </div>
          <button class="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="closeDrawer">
            <X class="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <!-- Team Switcher -->
        <div class="px-2.5 pt-3 pb-1">
          <button
            class="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-150"
            :class="showTeamSwitcher
              ? 'bg-[#edf4ff] dark:bg-[#478FC8]/15 ring-1 ring-[#478FC8]/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            "
            @click="showTeamSwitcher = !showTeamSwitcher"
          >
            <div
              class="shrink-0 flex items-center justify-center rounded-lg text-white"
              style="width: 30px; height: 30px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 2px 8px rgba(71,143,200,0.25);"
            >
              {{ teamInitial }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <p class="truncate" style="font-size: 12.5px; font-weight: 700; color: var(--md-team-name);">
                {{ currentTeam?.name ?? 'Select Team' }}
              </p>
              <p class="truncate" style="font-size: 10px; color: var(--md-team-sub);">
                {{ teams.length }} team{{ teams.length !== 1 ? 's' : '' }}
              </p>
            </div>
            <ChevronsUpDown style="width: 14px; height: 14px; color: var(--md-item-icon); flex-shrink: 0;" />
          </button>

          <!-- Team list -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="showTeamSwitcher"
              class="mt-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div class="max-h-[200px] overflow-y-auto py-1">
                <button
                  v-for="team in teams"
                  :key="team.id"
                  class="w-full flex items-center gap-2.5 px-3 py-2 transition-all duration-100"
                  :class="currentTeam?.id === team.id
                    ? 'bg-[#edf4ff] dark:bg-[#478FC8]/15'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  "
                  @click="switchTeam(team.id)"
                >
                  <div
                    class="shrink-0 flex items-center justify-center rounded-lg text-white"
                    style="width: 26px; height: 26px; font-size: 10.5px; font-weight: 800; background: linear-gradient(135deg, #478FC8, #3570A5);"
                  >
                    {{ team.name.charAt(0).toUpperCase() }}
                  </div>
                  <span
                    class="flex-1 text-left truncate"
                    :style="{
                      fontSize: '12.5px',
                      fontWeight: currentTeam?.id === team.id ? 700 : 500,
                      color: currentTeam?.id === team.id ? 'var(--md-team-active-text)' : 'var(--md-team-item-text)',
                    }"
                  >
                    {{ team.name }}
                  </span>
                  <Check
                    v-if="currentTeam?.id === team.id"
                    style="width: 14px; height: 14px; color: var(--md-team-active-text); flex-shrink: 0;"
                  />
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-2.5 py-4 flex flex-col gap-5">
          <!-- Menu -->
          <div>
            <p
              class="px-2 mb-2 uppercase tracking-widest"
              style="font-size: 9.5px; font-weight: 700; color: var(--md-section-label);"
            >
              Menu
            </p>
            <ul class="flex flex-col gap-0.5">
              <li v-for="item in menuItems" :key="item.href">
                <button
                  :class="[
                    'w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-150 relative',
                  ]"
                  :style="
                    isActive(item.href)
                      ? 'background: var(--md-active-bg); box-shadow: var(--md-active-shadow);'
                      : ''
                  "
                  @click="navigateTo(item.href)"
                >
                  <!-- Left accent -->
                  <div
                    v-if="isActive(item.href)"
                    class="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                    style="width: 3px; height: 55%; background: linear-gradient(180deg, #478FC8, #5BA3D9); box-shadow: 0 0 6px rgba(71,143,200,0.5);"
                  />

                  <!-- Icon box -->
                  <div
                    class="shrink-0 flex items-center justify-center rounded-lg"
                    :style="{
                      width: '30px',
                      height: '30px',
                      background: isActive(item.href)
                        ? 'linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%)'
                        : 'var(--md-item-icon-bg)',
                      boxShadow: isActive(item.href) ? '0 4px 10px rgba(71,143,200,0.3)' : 'none',
                    }"
                  >
                    <component
                      :is="item.icon"
                      :style="{
                        width: '14px',
                        height: '14px',
                        color: isActive(item.href) ? '#fff' : 'var(--md-item-icon)',
                      }"
                    />
                  </div>

                  <span
                    class="flex-1 text-left"
                    :style="{
                      fontSize: '13.5px',
                      fontWeight: isActive(item.href) ? 700 : 500,
                      color: isActive(item.href) ? 'var(--md-active-text)' : 'var(--md-item-text)',
                    }"
                  >
                    {{ item.label }}
                  </span>

                  <span
                    v-if="item.badge"
                    class="flex items-center justify-center rounded-full"
                    :style="{
                      width: '19px',
                      height: '19px',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      background: isActive(item.href) ? 'var(--md-active-badge-bg)' : 'var(--md-badge-bg)',
                      color: 'var(--md-badge-text)',
                    }"
                  >
                    {{ item.badge }}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <!-- General -->
          <div>
            <p
              class="px-2 mb-2 uppercase tracking-widest"
              style="font-size: 9.5px; font-weight: 700; color: var(--md-section-label);"
            >
              General
            </p>
            <ul class="flex flex-col gap-0.5">
              <li v-for="item in generalItems" :key="item.href">
                <button
                  class="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                  @click="navigateTo(item.href)"
                >
                  <div
                    class="shrink-0 flex items-center justify-center rounded-lg"
                    style="width: 30px; height: 30px; background: var(--md-item-icon-bg);"
                  >
                    <component :is="item.icon" style="width: 14px; height: 14px; color: var(--md-item-icon);" />
                  </div>
                  <span style="font-size: 13.5px; font-weight: 500; color: var(--md-item-text);">
                    {{ item.label }}
                  </span>
                </button>
              </li>
              <li>
                <button
                  class="w-full flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-all duration-150 group"
                  style="background: transparent;"
                  @click="handleLogout"
                >
                  <div
                    class="shrink-0 flex items-center justify-center rounded-lg transition-colors group-hover:!bg-[#fee2e2]"
                    style="width: 30px; height: 30px; background: var(--md-item-icon-bg);"
                  >
                    <LogOut class="transition-colors group-hover:!text-[#ef4444]" style="width: 14px; height: 14px; color: var(--md-item-icon);" />
                  </div>
                  <span class="transition-colors group-hover:!text-[#ef4444]" style="font-size: 13.5px; font-weight: 500; color: var(--md-item-text);">
                    Logout
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <!-- User Profile -->
        <div class="shrink-0 p-3 border-t border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-2.5 rounded-xl px-2 py-2">
            <div class="relative shrink-0">
              <div
                class="flex items-center justify-center rounded-xl text-white"
                style="width: 34px; height: 34px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%); box-shadow: 0 3px 8px rgba(71,143,200,0.3);"
              >
                {{ userInitials }}
              </div>
              <div
                class="absolute rounded-full"
                style="width: 9px; height: 9px; bottom: -1px; right: -1px; background: #22c55e; border: 2px solid #fff; box-shadow: 0 0 5px rgba(34,197,94,0.5);"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate" style="font-size: 12.5px; font-weight: 700; color: var(--md-profile-name);">
                {{ authStore.currentUser?.name || 'User' }}
              </p>
              <p class="truncate" style="font-size: 10.5px; color: var(--md-profile-email);">
                {{ authStore.currentUser?.email || '' }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-drawer-root {
  --md-section-label: #cbd5e1;
  --md-item-icon-bg: #f8fafc;
  --md-item-icon: #94a3b8;
  --md-item-text: #64748b;
  --md-active-bg: linear-gradient(135deg, #e8f4fd 0%, #edf4ff 100%);
  --md-active-shadow: 0 0 0 1px rgba(71, 143, 200, 0.12) inset;
  --md-active-text: #2d6da3;
  --md-active-badge-bg: #cce4f5;
  --md-badge-bg: #edf4ff;
  --md-badge-text: #478fc8;
  --md-team-name: #1e293b;
  --md-team-sub: #94a3b8;
  --md-team-item-text: #64748b;
  --md-team-active-text: #478fc8;
  --md-profile-name: #1e293b;
  --md-profile-email: #94a3b8;
}

.mobile-drawer-root :deep(.overflow-y-auto) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.mobile-drawer-root :deep(.overflow-y-auto::-webkit-scrollbar) {
  width: 0;
  height: 0;
}

:root.dark .mobile-drawer-root {
  --md-section-label: #64748b;
  --md-item-icon-bg: #0f172a;
  --md-item-icon: #d1d5db;
  --md-item-text: #a7b4c8;
  --md-active-bg: linear-gradient(135deg, rgba(71, 143, 200, 0.28) 0%, rgba(91, 163, 217, 0.2) 100%);
  --md-active-shadow: 0 0 0 1px rgba(71, 143, 200, 0.32) inset;
  --md-active-text: #e2f0ff;
  --md-active-badge-bg: rgba(71, 143, 200, 0.3);
  --md-badge-bg: rgba(71, 143, 200, 0.2);
  --md-badge-text: #b8ddff;
  --md-team-name: #e5e7eb;
  --md-team-sub: #9ca3af;
  --md-team-item-text: #cbd5e1;
  --md-team-active-text: #9fd1fb;
  --md-profile-name: #e5e7eb;
  --md-profile-email: #9ca3af;
}
</style>
