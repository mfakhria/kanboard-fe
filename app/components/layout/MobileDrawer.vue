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
        class="fixed left-0 top-0 z-50 h-screen w-[280px] bg-white dark:bg-gray-900 shadow-xl lg:hidden">
        <div class="flex items-center justify-between px-6 py-5">
          <div class="flex items-center">
            <img src="/kanzon.png" alt="Kanzon" class="h-12 w-auto max-w-[160px] object-contain" />
          </div>
          <button class="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800" @click="closeDrawer">
            <X class="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <nav class="flex-1 px-3 py-4">
          <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>
          <ul class="space-y-1">
            <li v-for="item in menuItems" :key="item.href">
              <button :class="[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive(item.href)
                  ? 'bg-[#478FC8] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-[#EDF4FF] hover:text-[#478FC8]'
              ]" @click="navigateTo(item.href)">
                <component :is="item.icon" class="h-5 w-5 text-[#478FC8]" />

                <span>{{ item.label }}</span>

                <span v-if="item.badge"
                  class="ml-auto rounded-full bg-[#EDF4FF] px-2 py-0.5 text-xs font-semibold text-[#478FC8]">
                  {{ item.badge }}
                </span>
              </button>
            </li>
          </ul>

          <p class="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            General</p>
          <ul class="space-y-1">
            <li v-for="item in generalItems" :key="item.href">
              <button
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="navigateTo(item.href)">
                <component :is="item.icon" class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span>{{ item.label }}</span>
              </button>
            </li>
            <li>
              <button
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                @click="handleLogout">
                <LogOut class="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </Transition>
  </Teleport>
</template>
