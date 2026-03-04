<script setup lang="ts">
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: CheckSquare, label: 'Tasks', href: '/dashboard/tasks', badge: '12+' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: Users, label: 'Team', href: '/dashboard/team' },
]

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
  <aside class="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r bg-white dark:bg-gray-900 lg:flex">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-6 py-5">
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-lime-500">
        <svg viewBox="0 0 24 24" class="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      <span class="text-xl font-bold text-gray-900 dark:text-white">Kanboard</span>
    </div>

    <!-- Menu Section -->
    <nav class="flex-1 px-3 py-4">
      <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Menu</p>
      <ul class="space-y-1">
        <li v-for="item in menuItems" :key="item.href">
          <NuxtLink
            :to="item.href"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive(item.href)
                ? 'bg-lime-400 text-gray-900 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            ]"
          >
            <component
              :is="item.icon"
              :class="['h-5 w-5', isActive(item.href) ? 'text-gray-900' : 'text-gray-400 dark:text-gray-500']"
            />
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge"
              :class="[
                'ml-auto rounded-full px-2 py-0.5 text-xs font-semibold',
                isActive(item.href)
                  ? 'bg-gray-900/10 text-gray-900'
                  : 'bg-lime-100 dark:bg-lime-900/30 text-lime-800 dark:text-lime-400',
              ]"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- General Section -->
      <p class="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">General</p>
      <ul class="space-y-1">
        <li v-for="item in generalItems" :key="item.href">
          <NuxtLink
            :to="item.href"
            :class="[
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
              isActive(item.href)
                ? 'bg-lime-400 text-gray-900'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </li>
        <li>
          <button
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            @click="handleLogout"
          >
            <LogOut class="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <span>Logout</span>
          </button>
        </li>
      </ul>
    </nav>
  </aside>
</template>
