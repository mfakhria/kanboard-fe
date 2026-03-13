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
  ChevronsLeft,
} from 'lucide-vue-next'

const { sidebarCollapsed: collapsed, toggleCollapse } = useLayoutState()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { badgeLabel, fetchTaskCount } = useTaskCount()

const ready = ref(false)

onMounted(async () => {
  nextTick(() => { ready.value = true })
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

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <aside :class="[
    'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 lg:flex',
    ready ? 'transition-all duration-300' : '',
    collapsed ? 'w-[68px]' : 'w-[240px]',
  ]">
    <!-- Logo -->
    <div class="flex items-center justify-between py-5" :class="collapsed ? 'px-3' : 'px-6'">
      <div class="flex items-center overflow-hidden">
        <img src="/kanzon.png" alt="Kanzon" :class="[collapsed ? 'h-10 w-10' : 'h-14 w-auto max-w-[160px]', ready ? 'transition-all duration-300' : '']" class="shrink-0 object-contain" />
      </div>
      <button v-if="!collapsed"
        class="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
        @click="toggleCollapse">
        <ChevronsLeft class="h-4 w-4" />
      </button>
    </div>

    <!-- Menu Section -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden" :class="collapsed ? 'px-2' : 'px-3'">
      <p v-if="!collapsed"
        class="mb-3 px-3 py-4 pb-0 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu
      </p>
      <div v-else class="py-2" />
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.href">
          <NuxtLink :to="item.href" :title="collapsed ? item.label : undefined" :class="[
            'flex items-center rounded-lg text-sm font-medium transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            isActive(item.href)
              ? 'bg-[#478FC8] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-[#EDF4FF] hover:text-[#478FC8]'
          ]">
            <component :is="item.icon"
              :class="['h-5 w-5 shrink-0', isActive(item.href) ? 'text-white' : 'text-gray-400 dark:text-gray-500']" />
            <span v-if="!collapsed">{{ item.label }}</span>
            <span v-if="item.badge && !collapsed" :class="[
              'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
              isActive(item.href)
                ? 'bg-white/20 text-white'
                : 'bg-[#EDF4FF] text-[#478FC8]'
            ]">
              {{ item.badge }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- General Section -->
      <p v-if="!collapsed"
        class="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">General
      </p>
      <div v-else class="my-4 border-t border-gray-200 dark:border-gray-700" />
      <ul class="space-y-1">
        <li v-for="item in generalItems" :key="item.href">
          <NuxtLink :to="item.href" :title="collapsed ? item.label : undefined" :class="[
            'flex items-center rounded-lg text-sm font-medium transition-all',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
            isActive(item.href)
              ? 'bg-[#478FC8] text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-[#EDF4FF] hover:text-[#478FC8]'
          ]">
            <component :is="item.icon" class="h-5 w-5 shrink-0 text-[#478FC8]" />
            <span v-if="!collapsed">{{ item.label }}</span>
          </NuxtLink>
        </li>
        <li>
          <button :title="collapsed ? 'Logout' : undefined" :class="[
            'flex w-full items-center rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5',
          ]" @click="handleLogout">
            <LogOut class="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
            <span v-if="!collapsed">Logout</span>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Expand button when collapsed -->
    <div v-if="collapsed" class="border-t border-gray-200 dark:border-gray-700 p-2">
      <button
        class="flex w-full items-center justify-center rounded-lg py-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
        title="Expand sidebar" @click="toggleCollapse">
        <ChevronsLeft class="h-4 w-4 rotate-180" />
      </button>
    </div>
  </aside>
</template>
