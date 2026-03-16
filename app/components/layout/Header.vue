<script setup lang="ts">
import {
  Search,
  Bell,
  Mail,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Home,
  Sun,
  Moon,
  Command,
  User,
  Settings,
  LogOut,
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,

  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CalendarDays,
  BarChart2,
  HelpCircle,
} from 'lucide-vue-next'
import type { Component } from 'vue'

// ── Composables ───────────────────────────────────────────────────────────────
const { toggleMobileDrawer } = useLayoutState()
const authStore = useAuthStore()
const projectStore = useProjectStore()
const workspaceStore = useWorkspaceStore()
const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')
const toggleTheme = () => { colorMode.preference = isDark.value ? 'light' : 'dark' }

// ── Page meta ─────────────────────────────────────────────────────────────────
interface PageMeta { label: string; icon: Component; desc: string }
const pageMeta: Record<string, PageMeta> = {
  '/dashboard':          { label: 'Dashboard',   icon: LayoutDashboard, desc: 'Welcome back' },
  '/project':            { label: 'Projects',    icon: FolderKanban,    desc: 'All your projects' },
  '/tasks':              { label: 'Tasks',       icon: CheckSquare,     desc: 'Manage your work' },
  '/calendar':           { label: 'Calendar',    icon: CalendarDays,    desc: 'Schedule & deadlines' },
  '/team':               { label: 'Team',        icon: Users,           desc: 'Members & roles' },
  '/analytics':          { label: 'Analytics',   icon: BarChart2,       desc: 'Reports & insights' },
  '/dashboard/settings': { label: 'Settings',    icon: Settings,        desc: 'App preferences' },
  '/dashboard/help':     { label: 'Help Center', icon: HelpCircle,      desc: 'FAQ & support' },
}

const defaultPage: PageMeta = { label: 'Dashboard', icon: LayoutDashboard, desc: 'Welcome back' }

const currentPage = computed((): PageMeta => {
  const path = route.path
  if (pageMeta[path]) return pageMeta[path]
  for (const [prefix, meta] of Object.entries(pageMeta)) {
    if (path.startsWith(prefix) && prefix !== '/dashboard') return meta
  }
  return defaultPage
})

// ── User ──────────────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  const name = authStore.currentUser?.name
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase()
  return name.slice(0, 2).toUpperCase()
})

// ── Search ────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const searchOpen = ref(false)
const mobileSearchOpen = ref(false)
const activeIdx = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)
const searchWrapperRef = ref<HTMLDivElement | null>(null)

function openMobileSearch() {
  mobileSearchOpen.value = true
  nextTick(() => searchInputRef.value?.focus())
}
function closeMobileSearch() {
  mobileSearchOpen.value = false
  searchQuery.value = ''
  searchOpen.value = false
}

interface SearchResult {
  id: string
  type: 'page' | 'project'
  title: string
  subtitle?: string
  icon?: Component
  href: string
  badge?: { label: string; color: string }
}

const quickAccessPages: SearchResult[] = [
  { id: 'qa-dashboard', type: 'page', title: 'Dashboard',  subtitle: 'Overview & stats',    icon: LayoutDashboard, href: '/dashboard' },
  { id: 'qa-projects',  type: 'page', title: 'Projects',   subtitle: 'All projects',         icon: FolderKanban,    href: '/project' },
  { id: 'qa-tasks',     type: 'page', title: 'Tasks',      subtitle: 'Task management',      icon: CheckSquare,     href: '/tasks' },
  { id: 'qa-team',      type: 'page', title: 'Team',       subtitle: 'Members & roles',      icon: Users,           href: '/team' },
  { id: 'qa-calendar',  type: 'page', title: 'Calendar',   subtitle: 'Schedule & deadlines', icon: CalendarDays,    href: '/calendar' },
]

const staticPages: SearchResult[] = [
  { id: 'pg-dashboard', type: 'page', title: 'Dashboard',   subtitle: 'Overview & stats',     icon: LayoutDashboard, href: '/dashboard' },
  { id: 'pg-projects',  type: 'page', title: 'Projects',    subtitle: 'All projects',          icon: FolderKanban,    href: '/project' },
  { id: 'pg-tasks',     type: 'page', title: 'Tasks',       subtitle: 'Task management',       icon: CheckSquare,     href: '/tasks' },
  { id: 'pg-calendar',  type: 'page', title: 'Calendar',    subtitle: 'Schedule & deadlines',  icon: CalendarDays,    href: '/calendar' },
  { id: 'pg-team',      type: 'page', title: 'Team',        subtitle: 'Members & roles',       icon: Users,           href: '/team' },
  { id: 'pg-analytics', type: 'page', title: 'Analytics',   subtitle: 'Reports & insights',    icon: BarChart2,       href: '/analytics' },
  { id: 'pg-settings',  type: 'page', title: 'Settings',    subtitle: 'App preferences',       icon: Settings,        href: '/dashboard/settings' },
  { id: 'pg-help',      type: 'page', title: 'Help Center', subtitle: 'FAQ, guides & support', icon: HelpCircle,      href: '/dashboard/help' },
]

const projectResults = computed<SearchResult[]>(() =>
  projectStore.allProjects.map(p => ({
    id: `prj-${p.id}`,
    type: 'project' as const,
    title: p.name,
    subtitle: `${p.status} · ${p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'No deadline'}`,
    icon: FolderKanban,
    href: `/project/${p.id}`,
    badge: {
      label: p.status === 'ACTIVE' ? 'Active' : p.status === 'COMPLETED' ? 'Completed' : 'Archived',
      color: p.status === 'ACTIVE' ? '#478FC8' : p.status === 'COMPLETED' ? '#16a34a' : '#64748b',
    },
  })),
)

const allSearchData = computed<SearchResult[]>(() => [...staticPages, ...projectResults.value])

const typeOrder = ['page', 'project'] as const
const typeLabels: Record<string, string> = { page: 'Pages', project: 'Projects' }
const typeIcons: Record<string, Component> = { page: LayoutDashboard, project: FolderKanban }

const searchResults = computed<SearchResult[]>(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return allSearchData.value.filter(r =>
    r.title.toLowerCase().includes(q) || (r.subtitle ?? '').toLowerCase().includes(q),
  )
})

const groupedResults = computed(() =>
  typeOrder
    .map(type => ({ type, items: searchResults.value.filter(r => r.type === type) }))
    .filter(g => g.items.length > 0),
)

watch(searchQuery, () => { activeIdx.value = 0 })

function handleSelect(result: SearchResult) {
  router.push(result.href)
  searchQuery.value = ''
  searchOpen.value = false
  mobileSearchOpen.value = false
  searchInputRef.value?.blur()
}

function handleSearchKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { searchQuery.value = ''; searchOpen.value = false; mobileSearchOpen.value = false; searchInputRef.value?.blur(); return }
  if (!searchOpen.value || searchResults.value.length === 0) return
  if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx.value = Math.min(activeIdx.value + 1, searchResults.value.length - 1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx.value = Math.max(activeIdx.value - 1, 0) }
  else if (e.key === 'Enter') { e.preventDefault(); const s = searchResults.value[activeIdx.value]; if (s) handleSelect(s) }
}

function highlightText(text: string, query: string): string | { before: string; match: string; after: string } {
  if (!query.trim()) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return { before: text.slice(0, idx), match: text.slice(idx, idx + query.length), after: text.slice(idx + query.length) }
}

onMounted(() => {
  workspaceStore.fetchPendingInvitations().catch(() => {
    // Handled by global API alert
  })

  const onKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchInputRef.value?.focus(); searchOpen.value = true }
  }
  const onClickOutside = (e: MouseEvent) => {
    if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target as Node)) searchOpen.value = false
  }
  window.addEventListener('keydown', onKey)
  document.addEventListener('mousedown', onClickOutside)
  onUnmounted(() => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOutside) })
})

const qaColorsLight = [
  { bg: '#edf4ff', accent: '#478FC8' },
  { bg: '#f0fdf4', accent: '#22c55e' },
  { bg: '#fdf4ff', accent: '#a855f7' },
  { bg: '#fff7ed', accent: '#f97316' },
  { bg: '#fef2f2', accent: '#ef4444' },
]
const qaColorsDark = [
  { bg: '#1e3a5f', accent: '#478FC8' },
  { bg: '#14532d', accent: '#22c55e' },
  { bg: '#3b0764', accent: '#a855f7' },
  { bg: '#431407', accent: '#f97316' },
  { bg: '#450a0a', accent: '#ef4444' },
]

function getQaColor(i: number): { bg: string; accent: string } {
  const colors = isDark.value ? qaColorsDark : qaColorsLight
  return i < colors.length ? colors[i]! : colors[0]!
}

// ── Notifications ─────────────────────────────────────────────────────────────
const notifOpen = ref(false)
const respondingInvitationId = ref<string | null>(null)

interface NotificationItem {
  id: string | number
  type: string
  title: string
  desc: string
  time: string
  read: boolean
  invitationId?: string
}

const baseNotifList = ref<NotificationItem[]>([
  { id: 1, type: 'success', title: 'Task completed',            desc: '"Design Homepage" marked as done',    time: '2m ago',    read: false },
  { id: 2, type: 'alert',   title: 'Overdue task',              desc: '"API Integration" is 2 days overdue', time: '1h ago',    read: false },
  { id: 3, type: 'info',    title: 'New member joined',         desc: 'Rina joined the team',           time: '3h ago',    read: true },
  { id: 4, type: 'success', title: 'Project milestone reached', desc: 'Phase 1 of "Kanban App" completed',   time: 'Yesterday', read: true },
])

const invitationNotifList = computed<NotificationItem[]>(() =>
  workspaceStore.invitations.map((inv) => ({
    id: `workspace-invite-${inv.id}`,
    invitationId: inv.id,
    type: 'workspace_invite',
    title: `Team invitation: ${inv.workspace.name}`,
    desc: `${inv.inviter.name} invited you as ${inv.role}.`,
    time: new Date(inv.createdAt).toLocaleString(),
    read: false,
  })),
)

const notifList = computed(() => [...invitationNotifList.value, ...baseNotifList.value])
const unreadCount = computed(() => notifList.value.filter(n => !n.read).length)
const markAllRead = () => {
  baseNotifList.value = baseNotifList.value.map(n => ({ ...n, read: true }))
}

watch(notifOpen, (open) => {
  if (!open) return
  workspaceStore.fetchPendingInvitations().catch(() => {
    // Handled by global API alert
  })
})

async function respondWorkspaceInvitation(invitationId: string, action: 'accept' | 'decline') {
  if (respondingInvitationId.value) return
  respondingInvitationId.value = invitationId
  try {
    await workspaceStore.respondInvitation(invitationId, action)
    await workspaceStore.fetchPendingInvitations()
  } finally {
    respondingInvitationId.value = null
  }
}

function getInvitationId(item: NotificationItem): string {
  return item.invitationId || ''
}

const notifIconMapLight: Record<string, { bg: string; color: string; icon: Component }> = {
  success: { bg: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#059669', icon: CheckCircle2 },
  alert:   { bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', color: '#dc2626', icon: AlertCircle },
  info:    { bg: 'linear-gradient(135deg,#edf4ff,#dbeafe)', color: '#478FC8', icon: Zap },
  workspace_invite: { bg: 'linear-gradient(135deg,#edf4ff,#dbeafe)', color: '#478FC8', icon: Users },
}
const notifIconMapDark: Record<string, { bg: string; color: string; icon: Component }> = {
  success: { bg: 'linear-gradient(135deg,#064e3b,#065f46)', color: '#34d399', icon: CheckCircle2 },
  alert:   { bg: 'linear-gradient(135deg,#450a0a,#7f1d1d)', color: '#fca5a5', icon: AlertCircle },
  info:    { bg: 'linear-gradient(135deg,#1e3a5f,#1e3a5f)', color: '#93c5fd', icon: Zap },
  workspace_invite: { bg: 'linear-gradient(135deg,#1e3a5f,#1e3a5f)', color: '#93c5fd', icon: Users },
}
const defaultNotifIconLight = notifIconMapLight['info']!
const defaultNotifIconDark = notifIconMapDark['info']!

function getNotifStyle(type: string): { bg: string; color: string; icon: Component } {
  const map = isDark.value ? notifIconMapDark : notifIconMapLight
  const fallback = isDark.value ? defaultNotifIconDark : defaultNotifIconLight
  return map[type] ?? fallback
}

// ── Profile ───────────────────────────────────────────────────────────────────
const profileOpen = ref(false)

function closeAll() { notifOpen.value = false; profileOpen.value = false }

function handleLogout() {
  closeAll()
  authStore.logout()
  router.push('/auth/login')
}
</script>

<template>
  <!-- Overlay for dropdowns -->
  <div v-if="notifOpen || profileOpen" class="fixed inset-0 z-20" @click="closeAll" />

  <!-- ── Mobile fullscreen search overlay ──────────────────────────────── -->
  <div v-if="mobileSearchOpen" class="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 sm:hidden">
    <div class="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-200 dark:border-gray-800">
      <button class="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="closeMobileSearch">
        <X style="width: 18px; height: 18px;" />
      </button>
      <div ref="searchWrapperRef" class="relative flex-1">
        <div
          class="flex items-center gap-2.5 rounded-2xl px-3.5 transition-all duration-200"
          :style="{
            height: '40px',
            background: isDark ? '#111827' : '#f6f8fa',
            border: '1.5px solid #478FC8',
            boxShadow: '0 0 0 4px rgba(71,143,200,0.08)',
          }"
        >
          <Search :style="{ width: '15px', height: '15px', color: '#478FC8', flexShrink: 0 }" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search anything..."
            class="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0 text-[14px] text-gray-900 dark:text-gray-200"
            @focus="searchOpen = true"
            @keydown="handleSearchKeydown"
          />
          <button
            v-if="searchQuery"
            class="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="searchQuery = ''; searchInputRef?.focus()"
          >
            <X style="width: 12px; height: 12px;" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile search results -->
    <div class="flex-1 overflow-y-auto">
      <!-- Quick Access (no query) -->
      <div v-if="searchQuery.trim().length === 0">
        <div class="px-4 pt-4 pb-2">
          <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Quick Access</p>
        </div>
        <div
          v-for="(item, i) in quickAccessPages"
          :key="item.id"
          class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
          @click="handleSelect(item)"
        >
          <div class="shrink-0 flex items-center justify-center rounded-xl" :style="{ width: '38px', height: '38px', background: getQaColor(i).bg, color: getQaColor(i).accent }">
            <component :is="item.icon!" style="width: 16px; height: 16px;" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-semibold text-gray-900 dark:text-white">{{ item.title }}</p>
            <p class="text-[12px] text-gray-400">{{ item.subtitle }}</p>
          </div>
          <ArrowRight style="width: 14px; height: 14px; color: #e2e8f0;" class="shrink-0" />
        </div>
      </div>
      <!-- Search results -->
      <div v-else-if="searchResults.length === 0" class="flex flex-col items-center justify-center gap-3 pt-20">
        <div class="w-14 h-14 rounded-2xl flex items-center justify-center" :style="{ background: isDark ? '#1f2937' : '#f1f5f9' }">
          <Search style="width: 22px; height: 22px; color: #cbd5e1;" />
        </div>
        <p class="text-[14px] font-semibold text-gray-500 dark:text-gray-400">No results found</p>
        <p class="text-[12px] text-gray-400 dark:text-gray-500">Try different keywords</p>
      </div>
      <div v-else>
        <div v-for="(group, gi) in groupedResults" :key="group.type">
          <div class="flex items-center gap-1.5 px-4 pt-4 pb-2" :style="{ borderTop: gi > 0 ? (isDark ? '1px solid #1f2937' : '1px solid #f1f5f9') : 'none' }">
            <component :is="typeIcons[group.type]" style="width: 11px; height: 11px; color: #94a3b8;" />
            <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{{ typeLabels[group.type] }}</span>
          </div>
          <div
            v-for="item in group.items"
            :key="item.id"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
            @click="handleSelect(item)"
          >
            <div
              class="shrink-0 flex items-center justify-center rounded-xl"
              :style="{ width: '38px', height: '38px', background: isDark ? '#1f2937' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }"
            >
              <component :is="item.icon ?? FolderKanban" style="width: 16px; height: 16px;" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-[14px] font-semibold" :style="{ color: isDark ? '#e2e8f0' : '#1e293b' }">
                <template v-if="typeof highlightText(item.title, searchQuery) === 'string'">{{ item.title }}</template>
                <template v-else>
                  {{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).before }}<mark :style="{ background: isDark ? '#1e3a5f' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', borderRadius: '2px', padding: '0 1px' }">{{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).match }}</mark>{{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).after }}
                </template>
              </p>
              <p v-if="item.subtitle" class="truncate text-[12px] text-gray-400 mt-[1px]">{{ item.subtitle }}</p>
            </div>
            <span v-if="item.badge" class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold" :style="{ background: item.badge.color + '15', color: item.badge.color, border: `1px solid ${item.badge.color}25` }">
              {{ item.badge.label }}
            </span>
            <ArrowRight style="width: 14px; height: 14px; color: #cbd5e1;" class="shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <header
    class="sticky top-0 z-30 flex items-center shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
    style="height: 56px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); padding: 0 12px;"
  >
    <!-- ── LEFT: Mobile menu + Page title / Breadcrumb ──────────────────── -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0 mr-2 sm:mr-0" style="max-width: 50%;">
      <button class="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0" @click="toggleMobileDrawer">
        <Menu class="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <!-- Mobile: page title -->
      <p class="lg:hidden text-[14px] font-bold text-gray-900 dark:text-white truncate">
        {{ currentPage.label }}
      </p>

      <!-- Desktop: breadcrumb -->
      <div class="hidden lg:flex items-center gap-2">
        <div
          class="flex items-center justify-center rounded-xl shrink-0"
          :style="{ width: '32px', height: '32px', background: isDark ? 'linear-gradient(135deg, #1e3a5f, #1e3a5f)' : 'linear-gradient(135deg, #edf4ff, #dbeafe)', color: '#478FC8' }"
        >
          <component :is="currentPage.icon" style="width: 15px; height: 15px;" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="flex items-center gap-[3px] text-[10.5px] font-medium text-gray-400 dark:text-gray-500">
              <Home style="width: 9px; height: 9px;" /> Team
            </span>
            <ChevronRight style="width: 10px; height: 10px; color: #cbd5e1;" />
            <span class="text-[10.5px] font-semibold text-[#478FC8]">{{ currentPage.label }}</span>
          </div>
          <p class="text-[13px] font-bold text-gray-900 dark:text-white leading-tight mt-[1px]">{{ currentPage.label }}</p>
        </div>
      </div>
    </div>

    <!-- ── CENTER: Search (desktop only) ───────────────────────────────── -->
    <div class="hidden sm:flex flex-1 justify-center px-4 lg:px-6">
      <div ref="searchWrapperRef" class="relative w-full" style="max-width: 420px;">
        <div
          class="flex items-center gap-2.5 rounded-2xl px-3.5 transition-all duration-200"
          :style="{
            height: '38px',
            background: searchOpen ? (isDark ? '#111827' : '#fff') : (isDark ? '#111827' : '#f6f8fa'),
            border: searchOpen ? '1.5px solid #478FC8' : (isDark ? '1.5px solid #374151' : '1.5px solid #e8edf3'),
            boxShadow: searchOpen ? '0 0 0 4px rgba(71,143,200,0.08), 0 2px 8px rgba(0,0,0,0.04)' : '0 1px 2px rgba(0,0,0,0.03)',
          }"
        >
          <Search :style="{ width: '14px', height: '14px', color: searchOpen ? '#478FC8' : '#b0b9c6', flexShrink: 0, transition: 'color 0.15s' }" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search anything..."
            class="flex-1 bg-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 min-w-0 text-[13px] text-gray-900 dark:text-gray-200"
            @focus="searchOpen = true"
            @keydown="handleSearchKeydown"
          />
          <button
            v-if="searchQuery"
            class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            @click="searchQuery = ''; searchInputRef?.focus()"
          >
            <X style="width: 10px; height: 10px;" />
          </button>
          <div v-else class="hidden md:flex items-center gap-0.5 shrink-0 rounded-lg px-1.5 py-0.5" :style="{ background: isDark ? '#374151' : '#eef0f3', border: isDark ? '1px solid #4b5563' : '1px solid #e2e6ea' }">
            <Command :style="{ width: '9px', height: '9px', color: '#9ca3af' }" />
            <span class="text-[10px] font-bold text-gray-400">K</span>
          </div>
        </div>

        <!-- Search Results (desktop) -->
        <div
          v-if="searchOpen && searchQuery.trim().length > 0"
          class="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex flex-col overflow-hidden"
          :style="{ width: 'min(440px, 95vw)', background: isDark ? '#111827' : '#fff', borderRadius: '16px', border: isDark ? '1px solid #1f2937' : '1px solid #e8edf3', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)', maxHeight: '440px', overflowY: 'auto' }"
        >
          <div v-if="searchResults.length === 0" class="flex flex-col items-center justify-center gap-2 py-10">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center" :style="{ background: isDark ? '#1f2937' : '#f1f5f9' }">
              <Search style="width: 20px; height: 20px; color: #cbd5e1;" />
            </div>
            <p class="text-[13.5px] font-semibold text-gray-500 dark:text-gray-400">No results found</p>
            <p class="text-[12px] text-gray-400 dark:text-gray-500">Try searching with different keywords</p>
          </div>
          <template v-else>
            <div v-for="(group, gi) in groupedResults" :key="group.type">
              <div class="flex items-center gap-1.5 px-4 pt-3.5 pb-1.5" :style="{ borderTop: gi > 0 ? (isDark ? '1px solid #1f2937' : '1px solid #f1f5f9') : 'none' }">
                <component :is="typeIcons[group.type]" style="width: 10px; height: 10px; color: #94a3b8;" />
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ typeLabels[group.type] }}</span>
              </div>
              <div
                v-for="item in group.items"
                :key="item.id"
                class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                :style="{ background: searchResults.indexOf(item) === activeIdx ? (isDark ? '#1e3a5f' : '#edf4ff') : 'transparent' }"
                @click="handleSelect(item)"
                @mouseenter="activeIdx = searchResults.indexOf(item)"
              >
                <div
                  class="shrink-0 flex items-center justify-center rounded-xl transition-all"
                  :style="{ width: '34px', height: '34px', background: searchResults.indexOf(item) === activeIdx ? (isDark ? '#1e3a5f' : '#dbeafe') : (isDark ? '#1f2937' : '#f1f5f9'), color: searchResults.indexOf(item) === activeIdx ? '#478FC8' : (isDark ? '#94a3b8' : '#64748b') }"
                >
                  <component :is="item.icon ?? FolderKanban" style="width: 14px; height: 14px;" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate text-[13px] font-semibold" :style="{ color: searchResults.indexOf(item) === activeIdx ? (isDark ? '#93c5fd' : '#2d6da3') : (isDark ? '#e2e8f0' : '#1e293b') }">
                    <template v-if="typeof highlightText(item.title, searchQuery) === 'string'">{{ item.title }}</template>
                    <template v-else>
                      {{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).before }}<mark :style="{ background: isDark ? '#1e3a5f' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', borderRadius: '2px', padding: '0 1px' }">{{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).match }}</mark>{{ (highlightText(item.title, searchQuery) as { before: string; match: string; after: string }).after }}
                    </template>
                  </p>
                  <p v-if="item.subtitle" class="truncate text-[11.5px] text-gray-400 mt-[1px]">{{ item.subtitle }}</p>
                </div>
                <span v-if="item.badge" class="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold" :style="{ background: item.badge.color + '15', color: item.badge.color, border: `1px solid ${item.badge.color}25` }">
                  {{ item.badge.label }}
                </span>
                <ArrowRight v-if="searchResults.indexOf(item) === activeIdx" style="width: 12px; height: 12px; color: #478FC8;" class="shrink-0" />
              </div>
            </div>
            <div class="flex items-center justify-between px-4 py-2.5" :style="{ borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#0d1117' : '#fafbfc' }">
              <div class="flex items-center gap-3">
                <div v-for="k in [{ key: '↑↓', label: 'navigate' }, { key: '↵', label: 'select' }, { key: 'Esc', label: 'close' }]" :key="k.key" class="flex items-center gap-1">
                  <kbd class="flex items-center justify-center rounded text-[10px] font-semibold" :style="{ minWidth: '20px', height: '18px', padding: '0 4px', background: isDark ? '#374151' : '#e8edf3', color: isDark ? '#d1d5db' : '#64748b' }">{{ k.key }}</kbd>
                  <span class="text-[10.5px] text-gray-400 dark:text-gray-500">{{ k.label }}</span>
                </div>
              </div>
              <span class="text-[10px] text-gray-300 font-medium">{{ searchResults.length }} result{{ searchResults.length !== 1 ? 's' : '' }}</span>
            </div>
          </template>
        </div>

        <!-- Quick Access Panel (desktop) -->
        <div
          v-if="searchOpen && searchQuery.trim().length === 0"
          class="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex flex-col overflow-hidden"
          :style="{ width: 'min(440px, 95vw)', background: isDark ? '#111827' : '#fff', borderRadius: '16px', border: isDark ? '1px solid #1f2937' : '1px solid #e8edf3', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }"
        >
          <div class="px-4 pt-3.5 pb-1.5">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Access</p>
          </div>
          <div
            v-for="(item, i) in quickAccessPages"
            :key="item.id"
            class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            @click="handleSelect(item)"
          >
            <div class="shrink-0 flex items-center justify-center rounded-xl" :style="{ width: '34px', height: '34px', background: getQaColor(i).bg, color: getQaColor(i).accent }">
              <component :is="item.icon!" style="width: 14px; height: 14px;" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-semibold text-gray-900 dark:text-white">{{ item.title }}</p>
              <p class="text-[11.5px] text-gray-400">{{ item.subtitle }}</p>
            </div>
            <Clock style="width: 12px; height: 12px; color: #e2e8f0;" />
          </div>
          <div class="flex items-center gap-2 px-4 py-2.5" :style="{ borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#0d1117' : '#fafbfc' }">
            <Command style="width: 10px; height: 10px; color: #cbd5e1;" />
            <span class="text-[11px] text-gray-400">Type to search projects, tasks & team members</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── RIGHT: Actions ──────────────────────────────────────────────── -->
    <div class="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
      <!-- Mobile: search icon -->
      <button
        class="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Search"
        @click="openMobileSearch"
      >
        <Search style="width: 18px; height: 18px;" />
      </button>

      <!-- Mobile: compact action buttons (bell + theme) -->
      <div class="flex sm:hidden items-center gap-0.5">
        <button
          class="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" style="width: 17px; height: 17px;" />
          <Moon v-else style="width: 17px; height: 17px;" />
        </button>
        <div class="relative">
          <button
            class="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150"
            :class="notifOpen ? 'text-[#478FC8] bg-[#dbeafe] dark:bg-[#1e3a5f]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
            title="Notifications"
            @click="notifOpen = !notifOpen; profileOpen = false"
          >
            <Bell style="width: 17px; height: 17px;" />
            <span v-if="unreadCount > 0" class="absolute rounded-full" :style="{ top: '7px', right: '7px', width: '8px', height: '8px', background: 'linear-gradient(135deg, #f97316, #ef4444)', border: isDark ? '1.5px solid #111827' : '1.5px solid #fff' }" />
          </button>

          <!-- Notification Panel (mobile: anchored right, responsive width) -->
          <div
            v-if="notifOpen"
            class="fixed sm:absolute right-2 sm:right-0 top-[60px] sm:top-full sm:mt-2.5 z-50 flex flex-col overflow-hidden"
            :style="{ width: 'min(360px, calc(100vw - 16px))', background: isDark ? '#111827' : '#fff', borderRadius: '18px', border: isDark ? '1px solid #1f2937' : '1px solid #e8edf3', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }"
          >
            <div class="flex items-center justify-between px-4 sm:px-5 py-3.5" :style="{ borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' }">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center" :style="{ background: isDark ? 'linear-gradient(135deg, #1e3a5f, #1e3a5f)' : 'linear-gradient(135deg, #edf4ff, #dbeafe)' }">
                  <Bell style="width: 13px; height: 13px; color: #478FC8;" />
                </div>
                <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Notifications</span>
                <span v-if="unreadCount > 0" class="flex items-center justify-center rounded-full text-[10px] font-bold text-white" style="min-width: 20px; height: 20px; padding: 0 6px; background: linear-gradient(135deg, #ef4444, #f97316);">
                  {{ unreadCount }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button v-if="unreadCount > 0" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#edf4ff] dark:hover:bg-[#1e3a5f] text-[#478FC8] transition-colors text-[11px] font-semibold" @click="markAllRead">
                  <Check style="width: 10px; height: 10px;" /> Mark all read
                </button>
                <button class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="notifOpen = false">
                  <X style="width: 12px; height: 12px;" />
                </button>
              </div>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
              <div
                v-for="(n, i) in notifList"
                :key="n.id"
                class="flex items-start gap-3 px-4 sm:px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                :style="{ opacity: n.read ? 0.5 : 1, borderBottom: i < notifList.length - 1 ? (isDark ? '1px solid #1f2937' : '1px solid #f8fafc') : 'none' }"
              >
                <div class="shrink-0 flex items-center justify-center rounded-xl mt-0.5" :style="{ width: '30px', height: '30px', background: getNotifStyle(n.type).bg }">
                  <component :is="getNotifStyle(n.type).icon" :style="{ width: '13px', height: '13px', color: getNotifStyle(n.type).color }" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2">
                    <p class="truncate text-[12.5px] text-gray-900 dark:text-gray-100" :style="{ fontWeight: n.read ? 500 : 650 }">{{ n.title }}</p>
                    <span class="shrink-0 text-[10.5px] text-gray-400">{{ n.time }}</span>
                  </div>
                  <p class="text-[11.5px] text-gray-500 leading-snug mt-[2px]">{{ n.desc }}</p>
                  <div v-if="n.type === 'workspace_invite'" class="mt-2 flex items-center gap-2">
                    <button
                      class="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#478FC8] hover:bg-[#3a7bb3] disabled:opacity-60"
                      :disabled="respondingInvitationId === getInvitationId(n)"
                      @click.stop="respondWorkspaceInvitation(getInvitationId(n), 'accept')"
                    >
                      Accept
                    </button>
                    <button
                      class="px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                      :disabled="respondingInvitationId === getInvitationId(n)"
                      @click.stop="respondWorkspaceInvitation(getInvitationId(n), 'decline')"
                    >
                      Decline
                    </button>
                  </div>
                </div>
                <div v-if="!n.read" class="shrink-0 rounded-full mt-2" style="width: 6px; height: 6px; background: #478FC8;" />
              </div>
            </div>
            <div class="px-4 sm:px-5 py-3" :style="{ borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#0d1117' : '#fafbfc' }">
              <button class="w-full py-2 rounded-xl text-[#478FC8] hover:bg-[#edf4ff] dark:hover:bg-[#1e3a5f] transition-colors text-[12.5px] font-semibold">
                View all notifications →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop: Icon pill group -->
      <div class="hidden sm:flex items-center gap-0.5 rounded-2xl px-1 py-1" :style="{ background: isDark ? '#1f2937' : '#f6f8fa', border: isDark ? '1.5px solid #374151' : '1.5px solid #edf0f4' }">
        <button
          class="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          :title="isDark ? 'Light mode' : 'Dark mode'"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" style="width: 15px; height: 15px;" />
          <Moon v-else style="width: 15px; height: 15px;" />
        </button>
        <button class="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" title="Messages">
          <Mail style="width: 15px; height: 15px;" />
        </button>
        <div class="relative">
          <button
            class="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
            :class="notifOpen ? 'text-[#478FC8] bg-[#dbeafe] dark:bg-[#1e3a5f]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
            title="Notifications"
            @click="notifOpen = !notifOpen; profileOpen = false"
          >
            <Bell style="width: 15px; height: 15px;" />
            <span v-if="unreadCount > 0" class="absolute rounded-full" :style="{ top: '6px', right: '6px', width: '8px', height: '8px', background: 'linear-gradient(135deg, #f97316, #ef4444)', border: isDark ? '1.5px solid #1f2937' : '1.5px solid #f6f8fa' }" />
          </button>

          <!-- Notification Panel (desktop) -->
          <div
            v-if="notifOpen"
            class="absolute right-0 top-full mt-2.5 z-50 flex flex-col overflow-hidden"
            :style="{ width: '360px', background: isDark ? '#111827' : '#fff', borderRadius: '18px', border: isDark ? '1px solid #1f2937' : '1px solid #e8edf3', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }"
          >
            <div class="flex items-center justify-between px-5 py-3.5" :style="{ borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9' }">
              <div class="flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-xl flex items-center justify-center" :style="{ background: isDark ? 'linear-gradient(135deg, #1e3a5f, #1e3a5f)' : 'linear-gradient(135deg, #edf4ff, #dbeafe)' }">
                  <Bell style="width: 13px; height: 13px; color: #478FC8;" />
                </div>
                <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Notifications</span>
                <span v-if="unreadCount > 0" class="flex items-center justify-center rounded-full text-[10px] font-bold text-white" style="min-width: 20px; height: 20px; padding: 0 6px; background: linear-gradient(135deg, #ef4444, #f97316);">
                  {{ unreadCount }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button v-if="unreadCount > 0" class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#edf4ff] dark:hover:bg-[#1e3a5f] text-[#478FC8] transition-colors text-[11px] font-semibold" @click="markAllRead">
                  <Check style="width: 10px; height: 10px;" /> Mark all read
                </button>
                <button class="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" @click="notifOpen = false">
                  <X style="width: 12px; height: 12px;" />
                </button>
              </div>
            </div>
            <div style="max-height: 300px; overflow-y: auto;">
              <div
                v-for="(n, i) in notifList"
                :key="n.id"
                class="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                :style="{ opacity: n.read ? 0.5 : 1, borderBottom: i < notifList.length - 1 ? (isDark ? '1px solid #1f2937' : '1px solid #f8fafc') : 'none' }"
              >
                <div class="shrink-0 flex items-center justify-center rounded-xl mt-0.5" :style="{ width: '30px', height: '30px', background: getNotifStyle(n.type).bg }">
                  <component :is="getNotifStyle(n.type).icon" :style="{ width: '13px', height: '13px', color: getNotifStyle(n.type).color }" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2">
                    <p class="truncate text-[12.5px] text-gray-900 dark:text-gray-100" :style="{ fontWeight: n.read ? 500 : 650 }">{{ n.title }}</p>
                    <span class="shrink-0 text-[10.5px] text-gray-400">{{ n.time }}</span>
                  </div>
                  <p class="text-[11.5px] text-gray-500 leading-snug mt-[2px]">{{ n.desc }}</p>
                  <div v-if="n.type === 'workspace_invite'" class="mt-2 flex items-center gap-2">
                    <button
                      class="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white bg-[#478FC8] hover:bg-[#3a7bb3] disabled:opacity-60"
                      :disabled="respondingInvitationId === getInvitationId(n)"
                      @click.stop="respondWorkspaceInvitation(getInvitationId(n), 'accept')"
                    >
                      Accept
                    </button>
                    <button
                      class="px-2.5 py-1 rounded-md text-[11px] font-semibold border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
                      :disabled="respondingInvitationId === getInvitationId(n)"
                      @click.stop="respondWorkspaceInvitation(getInvitationId(n), 'decline')"
                    >
                      Decline
                    </button>
                  </div>
                </div>
                <div v-if="!n.read" class="shrink-0 rounded-full mt-2" style="width: 6px; height: 6px; background: #478FC8;" />
              </div>
            </div>
            <div class="px-5 py-3" :style="{ borderTop: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9', background: isDark ? '#0d1117' : '#fafbfc' }">
              <button class="w-full py-2 rounded-xl text-[#478FC8] hover:bg-[#edf4ff] dark:hover:bg-[#1e3a5f] transition-colors text-[12.5px] font-semibold">
                View all notifications →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="hidden md:block" :style="{ width: '1px', height: '24px', background: isDark ? '#374151' : '#edf0f4' }" />

      <!-- Profile -->
      <div class="relative">
        <button
          class="flex items-center gap-1.5 sm:gap-2.5 rounded-2xl px-1.5 sm:px-2.5 py-1.5 transition-all duration-150"
          :class="profileOpen ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
          @click="profileOpen = !profileOpen; notifOpen = false"
        >
          <div class="relative shrink-0">
            <div
              class="flex items-center justify-center rounded-full text-white shrink-0"
              style="width: 32px; height: 32px; font-size: 11px; font-weight: 700; background: linear-gradient(135deg, #478FC8, #5BA3D9); box-shadow: 0 2px 8px rgba(71,143,200,0.35);"
            >
              {{ userInitials }}
            </div>
            <div class="absolute rounded-full" :style="{ width: '9px', height: '9px', bottom: '-1px', right: '-1px', background: '#22c55e', border: isDark ? '2px solid #111827' : '2px solid #fff' }" />
          </div>
          <div class="hidden md:block text-left">
            <p class="text-[12.5px] font-bold text-gray-900 dark:text-white whitespace-nowrap" style="letter-spacing: -0.1px;">
              {{ authStore.currentUser?.name || 'User' }}
            </p>
            <p class="text-[10.5px] text-gray-400 whitespace-nowrap">{{ authStore.currentUser?.email || '' }}</p>
          </div>
          <ChevronDown
            class="hidden md:block shrink-0 transition-transform duration-200"
            :style="{ width: '13px', height: '13px', color: '#b0b9c6', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
          />
        </button>

        <!-- Profile Dropdown -->
        <div
          v-if="profileOpen"
          class="fixed sm:absolute right-2 sm:right-0 top-[60px] sm:top-full sm:mt-2.5 z-50 overflow-hidden"
          :style="{ width: 'min(220px, calc(100vw - 16px))', background: isDark ? '#111827' : '#fff', borderRadius: '18px', border: isDark ? '1px solid #1f2937' : '1px solid #e8edf3', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)' : '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)' }"
        >
          <div style="background: linear-gradient(135deg, #478FC8 0%, #3570A5 100%); height: 52px;" />
          <div style="position: relative; margin-top: -20px; padding-left: 16px;">
            <div
              class="flex items-center justify-center rounded-full text-white"
              style="width: 40px; height: 40px; font-size: 13px; font-weight: 700; background: linear-gradient(135deg, #478FC8, #5BA3D9);"
              :style="{ boxShadow: isDark ? '0 0 0 3px #111827, 0 4px 12px rgba(71,143,200,0.4)' : '0 0 0 3px #fff, 0 4px 12px rgba(71,143,200,0.4)' }"
            >
              {{ userInitials }}
            </div>
          </div>
          <div class="px-4 pb-3 pt-1">
            <p class="text-[13px] font-bold text-gray-900 dark:text-white">{{ authStore.currentUser?.name || 'User' }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-[1px]">{{ authStore.currentUser?.email || '' }}</p>
            <span
              v-if="authStore.currentUser?.role"
              class="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
              :style="{ background: isDark ? '#422006' : '#fffbeb', color: '#d97706', border: isDark ? '1px solid #92400e' : '1px solid #fde68a' }"
            >
              <Sparkles style="width: 9px; height: 9px;" /> {{ authStore.currentUser.role }}
            </span>
          </div>
          <div class="mx-3 h-px" :style="{ background: isDark ? '#1f2937' : '#f1f5f9' }" />
          <div class="p-2">
            <button class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px] font-medium" @click="closeAll(); router.push('/dashboard/settings')">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" :style="{ background: isDark ? '#1f2937' : '#f1f5f9' }"><User style="width: 12px; height: 12px; color: #64748b;" /></div>
              My Profile
            </button>
            <button class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[13px] font-medium" @click="closeAll(); router.push('/dashboard/settings')">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" :style="{ background: isDark ? '#1f2937' : '#f1f5f9' }"><Settings style="width: 12px; height: 12px; color: #64748b;" /></div>
              Settings
            </button>
            <div class="my-1 mx-1 h-px bg-gray-100 dark:bg-gray-800" />
            <button class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-[13px] font-medium" @click="handleLogout">
              <div class="w-6 h-6 rounded-lg flex items-center justify-center" :style="{ background: isDark ? '#450a0a' : '#fff1f2' }"><LogOut style="width: 12px; height: 12px; color: #ef4444;" /></div>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
