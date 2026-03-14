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
  ChevronRight,
  Grid2x2,
} from 'lucide-vue-next'

const { sidebarCollapsed: collapsed, toggleCollapse } = useLayoutState()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { badgeLabel, fetchTaskCount } = useTaskCount()

const ready = ref(false)
const hoveredItem = ref<string | null>(null)

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
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', danger: false },
  { icon: HelpCircle, label: 'Help', href: '/dashboard/help', danger: false },
]

const isActive = (href: string) => {
  if (href === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(href)
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/auth/login')
}

const resetToggleStyle = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLButtonElement | null
  if (!button) return

  const computed = globalThis.getComputedStyle(button)
  button.style.color = computed.getPropertyValue('--sb-toggle-color')
  button.style.borderColor = computed.getPropertyValue('--sb-toggle-border')
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
  <aside
    :class="[
      'fixed left-0 top-0 z-40 hidden h-screen flex-col bg-white dark:bg-gray-900 lg:flex',
      ready ? 'transition-all duration-300 ease-in-out' : '',
      collapsed ? 'w-[70px]' : 'w-[230px]',
    ]"
    class="sidebar-root"
  >
    <!-- ── Logo ─────────────────────────────────────────────────── -->
    <div
      class="flex items-center gap-3 px-4 py-[18px] shrink-0 border-b border-gray-100 dark:border-gray-800"
    >
      <div
        class="shrink-0 flex items-center justify-center rounded-xl"
        style="width: 36px; height: 36px; background: linear-gradient(135deg, #478FC8 0%, #2d6da3 100%); box-shadow: 0 4px 12px rgba(71,143,200,0.35);"
      >
        <Grid2x2 style="width: 17px; height: 17px; color: #fff;" :stroke-width="2.5" />
      </div>

      <div v-if="!collapsed" class="overflow-hidden">
        <span
          class="block select-none"
          style="font-size: 19px; font-weight: 900; letter-spacing: -0.5px; background: linear-gradient(135deg, #2d6da3 0%, #478FC8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;"
        >
          kanzon
        </span>
        <span
          class="block text-gray-400 dark:text-gray-500"
          style="font-size: 10px; font-weight: 500; margin-top: -1px;"
        >
          Project Management
        </span>
      </div>
    </div>

    <!-- ── Navigation ──────────────────────────────────────────── -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2.5 flex flex-col gap-5">
      <!-- MENU -->
      <div>
        <p
          v-if="!collapsed"
          class="px-2 mb-2 uppercase tracking-widest"
          style="font-size: 9.5px; font-weight: 700; color: var(--sb-section-label);"
        >
          Menu
        </p>
        <div v-else class="flex justify-center mb-2">
          <div class="w-4 h-px bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>

        <ul class="flex flex-col gap-0.5">
          <li v-for="item in menuItems" :key="item.href" class="relative">
            <NuxtLink
              :to="item.href"
              :class="[
                'w-full flex items-center gap-2.5 rounded-xl transition-all duration-150 relative',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2.5',
              ]"
              :style="
                isActive(item.href)
                  ? 'background: var(--sb-active-bg); box-shadow: var(--sb-active-shadow);'
                  : hoveredItem === item.label
                    ? 'background: var(--sb-item-hover-bg);'
                    : ''
              "
              @mouseenter="hoveredItem = item.label"
              @mouseleave="hoveredItem = null"
            >
              <!-- Left accent bar -->
              <div
                v-if="isActive(item.href)"
                class="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                style="width: 3px; height: 55%; background: linear-gradient(180deg, #478FC8, #5BA3D9); box-shadow: 0 0 6px rgba(71,143,200,0.5);"
              />

              <!-- Icon box -->
              <div
                class="shrink-0 flex items-center justify-center rounded-lg transition-all duration-150"
                :style="{
                  width: '30px',
                  height: '30px',
                  background: isActive(item.href)
                    ? 'var(--sb-active-icon-bg)'
                    : hoveredItem === item.label
                      ? 'var(--sb-item-icon-hover-bg)'
                      : 'var(--sb-item-icon-bg)',
                  boxShadow: isActive(item.href) ? '0 4px 10px rgba(71,143,200,0.3)' : 'none',
                }"
              >
                <component
                  :is="item.icon"
                  :style="{
                    width: '14px',
                    height: '14px',
                    color: isActive(item.href) ? 'var(--sb-active-icon)' : hoveredItem === item.label ? 'var(--sb-item-icon-hover)' : 'var(--sb-item-icon)',
                    transition: 'color 0.15s',
                  }"
                />
              </div>

              <!-- Label -->
              <span
                v-if="!collapsed"
                class="flex-1 text-left transition-colors duration-150"
                :style="{
                  fontSize: '13.5px',
                  fontWeight: isActive(item.href) ? 700 : 500,
                  color: isActive(item.href) ? 'var(--sb-active-text)' : hoveredItem === item.label ? 'var(--sb-item-text-hover)' : 'var(--sb-item-text)',
                  letterSpacing: '-0.1px',
                }"
              >
                {{ item.label }}
              </span>

              <!-- Badge (expanded) -->
              <span
                v-if="!collapsed && item.badge"
                class="flex items-center justify-center rounded-full"
                :style="{
                  width: '19px',
                  height: '19px',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  background: isActive(item.href) ? 'var(--sb-active-badge-bg)' : 'var(--sb-badge-bg)',
                  color: 'var(--sb-badge-text)',
                }"
              >
                {{ item.badge }}
              </span>

              <!-- Badge dot (collapsed) -->
              <span
                v-if="collapsed && item.badge"
                class="absolute rounded-full"
                style="top: 5px; right: 9px; width: 7px; height: 7px; background: #478FC8; box-shadow: 0 0 5px rgba(71,143,200,0.6);"
              />

              <!-- Collapsed tooltip -->
              <div
                v-if="collapsed && hoveredItem === item.label"
                class="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap"
              >
                <div
                  class="px-2.5 py-1.5 rounded-lg shadow-xl"
                  style="font-size: 12px; font-weight: 600; background: #1e293b; color: #f1f5f9; backdrop-filter: blur(8px);"
                >
                  {{ item.label }}
                  <div
                    class="absolute right-full top-1/2 -translate-y-1/2"
                    style="border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 5px solid #1e293b;"
                  />
                </div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>

      <!-- GENERAL -->
      <div>
        <p
          v-if="!collapsed"
          class="px-2 mb-2 uppercase tracking-widest"
          style="font-size: 9.5px; font-weight: 700; color: var(--sb-section-label);"
        >
          General
        </p>
        <div v-else class="flex justify-center mb-2">
          <div class="w-4 h-px bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>

        <ul class="flex flex-col gap-0.5">
          <li v-for="item in generalItems" :key="item.href" class="relative">
            <NuxtLink
              :to="item.href"
              :class="[
                'w-full flex items-center gap-2.5 rounded-xl transition-all duration-150',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2.5',
              ]"
              :style="hoveredItem === item.label ? 'background: var(--sb-item-hover-bg);' : ''"
              @mouseenter="hoveredItem = item.label"
              @mouseleave="hoveredItem = null"
            >
              <div
                class="shrink-0 flex items-center justify-center rounded-lg transition-all duration-150"
                :style="{
                  width: '30px',
                  height: '30px',
                  background: hoveredItem === item.label ? 'var(--sb-item-icon-hover-bg)' : 'var(--sb-item-icon-bg)',
                }"
              >
                <component
                  :is="item.icon"
                  :style="{
                    width: '14px',
                    height: '14px',
                    color: hoveredItem === item.label ? 'var(--sb-item-icon-hover)' : 'var(--sb-item-icon)',
                    transition: 'color 0.15s',
                  }"
                />
              </div>
              <span
                v-if="!collapsed"
                class="flex-1 text-left transition-colors duration-150"
                :style="{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: hoveredItem === item.label ? 'var(--sb-item-text-hover)' : 'var(--sb-item-text)',
                }"
              >
                {{ item.label }}
              </span>

              <!-- Collapsed tooltip -->
              <div
                v-if="collapsed && hoveredItem === item.label"
                class="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap"
              >
                <div
                  class="px-2.5 py-1.5 rounded-lg shadow-xl"
                  style="font-size: 12px; font-weight: 600; background: #1e293b; color: #f1f5f9;"
                >
                  {{ item.label }}
                  <div
                    class="absolute right-full top-1/2 -translate-y-1/2"
                    style="border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 5px solid #1e293b;"
                  />
                </div>
              </div>
            </NuxtLink>
          </li>

          <!-- Logout -->
          <li class="relative">
            <button
              :class="[
                'w-full flex items-center gap-2.5 rounded-xl transition-all duration-150',
                collapsed ? 'justify-center px-0 py-2.5' : 'px-2.5 py-2.5',
              ]"
              :style="hoveredItem === 'Logout' ? 'background: var(--sb-logout-hover-bg);' : ''"
              @mouseenter="hoveredItem = 'Logout'"
              @mouseleave="hoveredItem = null"
              @click="handleLogout"
            >
              <div
                class="shrink-0 flex items-center justify-center rounded-lg transition-all duration-150"
                :style="{
                  width: '30px',
                  height: '30px',
                  background: hoveredItem === 'Logout' ? 'var(--sb-logout-icon-hover-bg)' : 'var(--sb-item-icon-bg)',
                }"
              >
                <LogOut
                  :style="{
                    width: '14px',
                    height: '14px',
                    color: hoveredItem === 'Logout' ? 'var(--sb-logout-text)' : 'var(--sb-item-icon)',
                    transition: 'color 0.15s',
                  }"
                />
              </div>
              <span
                v-if="!collapsed"
                class="flex-1 text-left transition-colors duration-150"
                :style="{
                  fontSize: '13.5px',
                  fontWeight: 500,
                  color: hoveredItem === 'Logout' ? 'var(--sb-logout-text)' : 'var(--sb-item-text)',
                }"
              >
                Logout
              </span>

              <!-- Collapsed tooltip -->
              <div
                v-if="collapsed && hoveredItem === 'Logout'"
                class="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none whitespace-nowrap"
              >
                <div
                  class="px-2.5 py-1.5 rounded-lg shadow-xl"
                  style="font-size: 12px; font-weight: 600; background: #1e293b; color: #f1f5f9;"
                >
                  Logout
                  <div
                    class="absolute right-full top-1/2 -translate-y-1/2"
                    style="border-top: 5px solid transparent; border-bottom: 5px solid transparent; border-right: 5px solid #1e293b;"
                  />
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <!-- ── User Profile ────────────────────────────────────────── -->
    <div class="shrink-0 p-3 border-t border-gray-100 dark:border-gray-800">
      <div
        :class="[
          'flex items-center gap-2.5 rounded-xl px-2 py-2 cursor-pointer transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-800',
          collapsed ? 'justify-center' : '',
        ]"
      >
        <!-- Avatar -->
        <div class="relative shrink-0">
          <div
            class="flex items-center justify-center rounded-xl text-white"
            style="width: 34px; height: 34px; font-size: 12px; font-weight: 800; background: linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%); box-shadow: 0 3px 8px rgba(71,143,200,0.3);"
          >
            {{ userInitials }}
          </div>
          <!-- Online dot -->
          <div
            class="absolute rounded-full"
            style="width: 9px; height: 9px; bottom: -1px; right: -1px; background: #22c55e; border: 2px solid #fff; box-shadow: 0 0 5px rgba(34,197,94,0.5);"
          />
        </div>

        <div v-if="!collapsed" class="flex-1 min-w-0">
          <p
            class="truncate"
            style="font-size: 12.5px; font-weight: 700; color: var(--sb-profile-name);"
          >
            {{ authStore.currentUser?.name || 'User' }}
          </p>
          <p class="truncate" style="font-size: 10.5px; color: var(--sb-profile-email);">
            {{ authStore.currentUser?.email || '' }}
          </p>
        </div>
      </div>
    </div>

    <!-- ── Collapse Toggle ─────────────────────────────────────── -->
    <button
      class="absolute -right-3 top-[72px] flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110 sidebar-toggle"
      style="width: 22px; height: 22px; background: var(--sb-toggle-bg); border: 1.5px solid var(--sb-toggle-border); box-shadow: 0 2px 8px rgba(0,0,0,0.08); color: var(--sb-toggle-color);"
      @click="toggleCollapse"
      @mouseenter="($event.currentTarget as HTMLButtonElement).style.color = '#478FC8'; ($event.currentTarget as HTMLButtonElement).style.borderColor = '#b3d4ea';"
      @mouseleave="resetToggleStyle"
    >
      <ChevronRight v-if="collapsed" style="width: 11px; height: 11px;" />
      <ChevronLeft v-else style="width: 11px; height: 11px;" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar-root {
  --sb-section-label: #cbd5e1;
  --sb-item-hover-bg: #f8fafc;
  --sb-item-icon-bg: #f8fafc;
  --sb-item-icon-hover-bg: #f1f5f9;
  --sb-item-icon: #94a3b8;
  --sb-item-icon-hover: #475569;
  --sb-item-text: #64748b;
  --sb-item-text-hover: #334155;
  --sb-active-bg: linear-gradient(135deg, #e8f4fd 0%, #edf4ff 100%);
  --sb-active-shadow: 0 0 0 1px rgba(71, 143, 200, 0.12) inset;
  --sb-active-icon-bg: linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%);
  --sb-active-icon: #ffffff;
  --sb-active-text: #2d6da3;
  --sb-active-badge-bg: #cce4f5;
  --sb-badge-bg: #edf4ff;
  --sb-badge-text: #478fc8;
  --sb-logout-hover-bg: #fff5f5;
  --sb-logout-icon-hover-bg: #fee2e2;
  --sb-logout-text: #ef4444;
  --sb-profile-name: #1e293b;
  --sb-profile-email: #94a3b8;
  --sb-toggle-bg: #ffffff;
  --sb-toggle-border: #e2e8f0;
  --sb-toggle-color: #94a3b8;
  border-right: 1px solid #f1f5f9;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.04);
}

:root.dark .sidebar-root {
  --sb-section-label: #64748b;
  --sb-item-hover-bg: #0f172a;
  --sb-item-icon-bg: #111827;
  --sb-item-icon-hover-bg: #1f2937;
  --sb-item-icon: #9ca3af;
  --sb-item-icon-hover: #e2e8f0;
  --sb-item-text: #94a3b8;
  --sb-item-text-hover: #e2e8f0;
  --sb-active-bg: linear-gradient(135deg, rgba(71, 143, 200, 0.24) 0%, rgba(91, 163, 217, 0.16) 100%);
  --sb-active-shadow: 0 0 0 1px rgba(71, 143, 200, 0.28) inset;
  --sb-active-icon-bg: linear-gradient(135deg, #478FC8 0%, #5BA3D9 100%);
  --sb-active-icon: #ffffff;
  --sb-active-text: #d7ecff;
  --sb-active-badge-bg: rgba(71, 143, 200, 0.25);
  --sb-badge-bg: rgba(71, 143, 200, 0.16);
  --sb-badge-text: #9fd1fb;
  --sb-logout-hover-bg: rgba(239, 68, 68, 0.12);
  --sb-logout-icon-hover-bg: rgba(239, 68, 68, 0.2);
  --sb-logout-text: #fca5a5;
  --sb-profile-name: #e5e7eb;
  --sb-profile-email: #9ca3af;
  --sb-toggle-bg: #0b1220;
  --sb-toggle-border: #334155;
  --sb-toggle-color: #cbd5e1;
  border-right-color: #1f2937;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
}
</style>
