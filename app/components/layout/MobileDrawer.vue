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
} from 'lucide-vue-next'

const { mobileDrawerOpen, toggleMobileDrawer } = useLayoutState()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { badgeLabel, fetchTaskCount } = useTaskCount()

onMounted(async () => {
  const workspaceStore = useWorkspaceStore()
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
  await fetchTaskCount()
})

const menuItems = computed(() => [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderKanban, label: 'Projects', href: '/project' },
  { icon: CheckSquare, label: 'Tasks', href: '/tasks', badge: badgeLabel.value },
  { icon: Calendar, label: 'Calendar', href: '/calendar' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Users, label: 'Team', href: '/dashboard/team' },
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
        class="fixed left-0 top-0 z-50 h-screen w-[280px] flex flex-col bg-white dark:bg-gray-900 shadow-xl lg:hidden"
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

        <!-- Nav -->
        <nav class="flex-1 overflow-y-auto px-2.5 py-4 flex flex-col gap-5">
          <!-- Menu -->
          <div>
            <p
              class="px-2 mb-2 uppercase tracking-widest"
              style="font-size: 9.5px; font-weight: 700; color: #cbd5e1;"
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
                      ? 'background: linear-gradient(135deg, #e8f4fd 0%, #edf4ff 100%); box-shadow: 0 0 0 1px rgba(71,143,200,0.12) inset;'
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
                        : '#f8fafc',
                      boxShadow: isActive(item.href) ? '0 4px 10px rgba(71,143,200,0.3)' : 'none',
                    }"
                  >
                    <component
                      :is="item.icon"
                      :style="{
                        width: '14px',
                        height: '14px',
                        color: isActive(item.href) ? '#fff' : '#94a3b8',
                      }"
                    />
                  </div>

                  <span
                    class="flex-1 text-left"
                    :style="{
                      fontSize: '13.5px',
                      fontWeight: isActive(item.href) ? 700 : 500,
                      color: isActive(item.href) ? '#2d6da3' : '#64748b',
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
                      background: isActive(item.href) ? '#cce4f5' : '#edf4ff',
                      color: '#478FC8',
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
              style="font-size: 9.5px; font-weight: 700; color: #cbd5e1;"
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
                    style="width: 30px; height: 30px; background: #f8fafc;"
                  >
                    <component :is="item.icon" style="width: 14px; height: 14px; color: #94a3b8;" />
                  </div>
                  <span style="font-size: 13.5px; font-weight: 500; color: #64748b;">
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
                    style="width: 30px; height: 30px; background: #f8fafc;"
                  >
                    <LogOut class="transition-colors group-hover:!text-[#ef4444]" style="width: 14px; height: 14px; color: #94a3b8;" />
                  </div>
                  <span class="transition-colors group-hover:!text-[#ef4444]" style="font-size: 13.5px; font-weight: 500; color: #64748b;">
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
              <p class="truncate" style="font-size: 12.5px; font-weight: 700; color: #1e293b;">
                {{ authStore.currentUser?.name || 'User' }}
              </p>
              <p class="truncate" style="font-size: 10.5px; color: #94a3b8;">
                {{ authStore.currentUser?.email || '' }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
