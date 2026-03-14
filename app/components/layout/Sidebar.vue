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
  ChevronLeft,
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
    'fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 lg:flex',
    ready ? 'transition-all duration-300' : '',
    collapsed ? 'w-[60px]' : 'w-[220px]',
  ]">
    <!-- Logo -->
    <div :class="[
      'flex items-center h-[60px] border-b border-gray-100 dark:border-gray-800',
      collapsed ? 'justify-center px-2' : 'justify-between px-4',
    ]">
      <div class="flex items-center gap-2 overflow-hidden">
        <div class="flex h-7 w-7 shrink-0 items-center justify-center">
          <svg viewBox="0 0 28 28" fill="none" class="h-full w-full">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="#478FC8" />
            <rect x="14" y="2" width="10" height="10" rx="2" fill="#478FC8" opacity="0.6" />
            <rect x="2" y="14" width="10" height="10" rx="2" fill="#478FC8" opacity="0.6" />
            <rect x="14" y="14" width="10" height="10" rx="2" fill="#478FC8" opacity="0.3" />
          </svg>
        </div>
        <span v-if="!collapsed" class="text-[15px] font-semibold tracking-tight text-gray-800 dark:text-gray-200">
          kanzon
        </span>
      </div>
      <button
        v-if="!collapsed"
        class="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        @click="toggleCollapse"
      >
        <ChevronLeft class="h-4 w-4" />
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
      <!-- Menu section label -->
      <p
        v-if="!collapsed"
        class="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500"
      >
        Menu
      </p>

      <ul class="space-y-0.5">
        <li v-for="item in menuItems" :key="item.href">
          <NuxtLink
            :to="item.href"
            :title="collapsed ? item.label : undefined"
            :class="[
              'flex w-full items-center rounded-lg text-[13px] transition-all',
              collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-2 py-2',
              isActive(item.href)
                ? 'bg-[#478FC8] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'shrink-0',
                collapsed ? 'h-5 w-5' : 'h-4 w-4',
              ]"
            />
            <template v-if="!collapsed">
              <span class="flex-1 text-left">{{ item.label }}</span>
              <span
                v-if="item.badge"
                :class="[
                  'ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium',
                  isActive(item.href)
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8]'
                ]"
              >
                {{ item.badge }}
              </span>
            </template>
          </NuxtLink>
        </li>
      </ul>

      <!-- General section -->
      <div class="mt-6">
        <p
          v-if="!collapsed"
          class="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-500"
        >
          General
        </p>
        <div v-else class="mb-2 border-t border-gray-100 dark:border-gray-800 pt-2" />

        <ul class="space-y-0.5">
          <li v-for="item in generalItems" :key="item.href">
            <NuxtLink
              :to="item.href"
              :title="collapsed ? item.label : undefined"
              :class="[
                'flex w-full items-center rounded-lg text-[13px] text-gray-500 dark:text-gray-400 transition-all',
                collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-2 py-2',
                'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
              ]"
            >
              <component
                :is="item.icon"
                :class="['shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4']"
              />
              <span v-if="!collapsed" class="text-[13px]">{{ item.label }}</span>
            </NuxtLink>
          </li>
          <li>
            <button
              :title="collapsed ? 'Logout' : undefined"
              :class="[
                'flex w-full items-center rounded-lg text-[13px] text-gray-500 dark:text-gray-400 transition-all',
                collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-2 py-2',
                'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
              ]"
              @click="handleLogout"
            >
              <LogOut :class="['shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4']" />
              <span v-if="!collapsed">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Expand button when collapsed -->
    <div v-if="collapsed" class="px-2 pb-4">
      <button
        class="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        title="Expand sidebar"
        @click="toggleCollapse"
      >
        <ChevronLeft class="h-4 w-4 rotate-180" />
      </button>
    </div>
  </aside>
</template>
