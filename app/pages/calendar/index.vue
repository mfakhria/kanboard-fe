<script setup lang="ts">
import {
  ChevronLeft, ChevronRight, Flag, Clock, CalendarDays,
} from 'lucide-vue-next'
import { kanbanApi } from '~/features/kanban/services/task.api'

definePageMeta({ layout: 'dashboard' })

// ─── Constants ───
const HOUR_HEIGHT = 56
const START_HOUR = 5
const END_HOUR = 21
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const

// ─── Stores ───
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()

// ─── State ───
const today = new Date()
const selectedDate = ref(new Date())
const weekStart = ref(getWeekStart(new Date()))
const calMonth = ref(today.getMonth())
const calYear = ref(today.getFullYear())
const activeFilter = ref<'all' | 'high' | 'medium' | 'low'>('all')
const scrollContainer = ref<HTMLDivElement | null>(null)

// ─── Week helpers ───
function getWeekStart(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.value)
    d.setDate(d.getDate() + i)
    return d
  }),
)

function isToday(d: Date) {
  return d.toDateString() === today.toDateString()
}

function prevWeek() {
  const ws = new Date(weekStart.value)
  ws.setDate(ws.getDate() - 7)
  weekStart.value = ws
  selectedDate.value = ws
}

function nextWeek() {
  const ws = new Date(weekStart.value)
  ws.setDate(ws.getDate() + 7)
  weekStart.value = ws
  selectedDate.value = ws
}

function formatWeekLabel(date: Date) {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

function formatHour(h: number) {
  const ampm = h < 12 ? 'am' : 'pm'
  const disp = h === 12 ? 12 : h % 12
  return `${disp}${ampm}`
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatHalfHour(h: number) {
  const whole = Math.floor(h)
  const mins = h % 1 === 0.5 ? '30' : '00'
  return `${pad2(whole)}:${mins}`
}

// ─── Mini calendar ───
const monthLabel = computed(() => `${MONTHS[calMonth.value]} ${calYear.value}`)

function prevMonth() {
  if (calMonth.value === 0) { calMonth.value = 11; calYear.value-- }
  else calMonth.value--
}

function nextMonth() {
  if (calMonth.value === 11) { calMonth.value = 0; calYear.value++ }
  else calMonth.value++
}

const calendarCells = computed(() => {
  const year = calYear.value
  const month = calMonth.value
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { day: number; curMonth: boolean; date: Date }[] = []
  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrev - i
    cells.push({ day: d, curMonth: false, date: new Date(year, month - 1, d) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, curMonth: true, date: new Date(year, month, d) })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - daysInMonth - startDow + 1, curMonth: false, date: new Date(year, month + 1, cells.length - daysInMonth - startDow + 1) })
  }
  return cells
})

function isInCurrentWeek(d: Date) {
  const weekEnd = new Date(weekStart.value)
  weekEnd.setDate(weekEnd.getDate() + 6)
  return d >= weekStart.value && d <= weekEnd
}

function selectDate(d: Date) {
  selectedDate.value = d
  weekStart.value = getWeekStart(d)
}

function isMiniSelected(cell: { day: number; curMonth: boolean; date: Date }) {
  return cell.curMonth && cell.date.toDateString() === selectedDate.value.toDateString()
}

function isMiniToday(cell: { day: number; curMonth: boolean; date: Date }) {
  return cell.curMonth && cell.date.toDateString() === today.toDateString()
}

// ─── Events ───
interface CalendarEvent {
  id: string
  title: string
  priority: string
  projectName: string
  projectColor: string
  date: Date
  startHour: number
  endHour: number
  dayOfWeek: number
  color: string
  borderColor: string
  textColor: string
  assigneeName?: string
}

const rawTasks = ref<any[]>([])
const events = ref<CalendarEvent[]>([])

const priorityEventColors: Record<string, { color: string; borderColor: string; textColor: string }> = {
  HIGH: { color: 'bg-red-100 dark:bg-red-900/30', borderColor: 'border-red-400', textColor: 'text-red-800 dark:text-red-300' },
  URGENT: { color: 'bg-violet-100 dark:bg-violet-900/30', borderColor: 'border-violet-400', textColor: 'text-violet-800 dark:text-violet-300' },
  MEDIUM: { color: 'bg-blue-100 dark:bg-blue-900/30', borderColor: 'border-[#478FC8]', textColor: 'text-blue-800 dark:text-blue-300' },
  LOW: { color: 'bg-amber-100 dark:bg-amber-900/30', borderColor: 'border-amber-400', textColor: 'text-amber-800 dark:text-amber-300' },
}

function getEventTime(_dayTasks: any[], index: number) {
  const baseHour = 8
  const hour = baseHour + (index * 2) % 10
  return { startHour: hour, endHour: hour + 1 }
}

async function loadCalendarEvents() {
  const wsId = workspaceStore.activeWorkspace?.id
  if (!wsId) return
  try {
    const { data } = await kanbanApi.listTasks(wsId)
    const tasks = data as any[]
    rawTasks.value = tasks

    const byDate = new Map<string, any[]>()
    const tasksWithDue = tasks.filter((t: any) => t.dueDate)
    for (const t of tasksWithDue) {
      const key = new Date(t.dueDate).toDateString()
      if (!byDate.has(key)) byDate.set(key, [])
      byDate.get(key)!.push(t)
    }

    events.value = tasksWithDue.map((t: any) => {
      const due = new Date(t.dueDate)
      const key = due.toDateString()
      const dayGroup = byDate.get(key) || []
      const idx = dayGroup.indexOf(t)
      const time = getEventTime(dayGroup, idx)
      const priority = (t.priority || 'MEDIUM').toUpperCase()
      const colors = priorityEventColors[priority] ?? priorityEventColors.MEDIUM!
      const ws = getWeekStart(due)
      const dayOfWeek = Math.round((due.getTime() - ws.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: t.id,
        title: t.title,
        priority,
        projectName: t.column?.board?.project?.name || 'Project',
        projectColor: t.column?.board?.project?.color || '#478FC8',
        date: due,
        ...time,
        dayOfWeek,
        ...colors,
        assigneeName: t.assignee?.name,
      }
    })
  } catch (error) {
    console.error('Failed to load calendar events:', error)
  }
}

onMounted(async () => {
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
  await projectStore.fetchProjects()
  await loadCalendarEvents()

  // Auto-scroll to 7am
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = (7 - START_HOUR) * HOUR_HEIGHT
    }
  })
})

// ─── Filtered events for the current week ───
const filteredWeekEvents = computed(() => {
  let filtered = events.value
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(e => e.priority === activeFilter.value.toUpperCase())
  }
  return filtered.filter(e => {
    const weekEnd = new Date(weekStart.value)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return e.date >= weekStart.value && e.date <= weekEnd
  })
})

function getEventsForDay(dayIndex: number) {
  return filteredWeekEvents.value.filter(e => e.dayOfWeek === dayIndex)
}

// ─── Sidebar data ───
const projectColors = ['bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-orange-500', 'bg-rose-500']
const activeProjects = computed(() => projectStore.runningProjects)

const taskBreakdown = computed(() => {
  const total = rawTasks.value.length || 1
  const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 }
  for (const t of rawTasks.value) {
    const p = (t.priority || 'MEDIUM').toUpperCase()
    if (p === 'HIGH' || p === 'URGENT') counts.HIGH++
    else if (p === 'MEDIUM') counts.MEDIUM++
    else counts.LOW++
  }
  return [
    { label: 'High', color: 'bg-red-500', count: counts.HIGH, pct: Math.round((counts.HIGH / total) * 100) },
    { label: 'Medium', color: 'bg-amber-400', count: counts.MEDIUM, pct: Math.round((counts.MEDIUM / total) * 100) },
    { label: 'Low', color: 'bg-gray-400', count: counts.LOW, pct: Math.round((counts.LOW / total) * 100) },
  ]
})

const selectedDayEvents = computed(() => {
  return [...events.value]
    .filter(e => e.date.toDateString() === selectedDate.value.toDateString())
    .sort((a, b) => a.startHour - b.startHour)
})

const upcomingEvents = computed(() => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const next7 = new Date(todayStart)
  next7.setDate(next7.getDate() + 7)
  return [...events.value]
    .filter(e => {
      const d = new Date(e.date)
      d.setHours(0, 0, 0, 0)
      return d >= todayStart && d <= next7
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)
})

function formatRelativeDate(date: Date): string {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const diff = Math.round((d.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatEventTime(e: CalendarEvent) {
  return `${pad2(e.startHour)}:00 - ${pad2(e.endHour)}:00`
}

// ─── Event count for mini calendar dots ───
const eventCountByDate = computed(() => {
  const map = new Map<string, number>()
  for (const e of events.value) {
    const key = e.date.toDateString()
    map.set(key, (map.get(key) || 0) + 1)
  }
  return map
})

function getEventCount(date: Date) {
  return eventCountByDate.value.get(date.toDateString()) || 0
}

// ─── Priority filter tabs ───
const filterTabs = [
  { key: 'all' as const, label: 'All Tasks', icon: CalendarDays, activeClass: 'bg-[#478FC8] text-white' },
  { key: 'high' as const, label: 'High', icon: Flag, activeClass: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' },
  { key: 'medium' as const, label: 'Medium', icon: Clock, activeClass: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
  { key: 'low' as const, label: 'Low', icon: Flag, activeClass: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400' },
]
</script>

<template>
  <LayoutPageContainer>
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3570A5]" />
          <h1 class="text-[clamp(20px,2.5vw,28px)] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
            Calendar
          </h1>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 pl-4 leading-relaxed">
          View and manage your
          <span class="font-semibold bg-gradient-to-r from-[#478FC8] to-[#6db3e8] bg-clip-text text-transparent">schedule</span>
          across all projects.
        </p>
      </div>
    </div>

    <!-- Body: Left panel + main grid -->
    <div class="flex flex-col gap-4 xl:flex-row">
      <!-- ═══ Left Sidebar ═══ -->
      <aside class="w-full shrink-0 xl:w-[220px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-y-auto">
        <div class="flex flex-col gap-5 px-4 py-5">
          <!-- Mini Calendar -->
          <div class="flex flex-col gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center justify-between mb-1">
              <span class="text-gray-900 dark:text-white" style="font-size: 14px; font-weight: 800; letter-spacing: -0.3px;">
                {{ monthLabel }}
              </span>
              <div class="flex items-center gap-1">
                <button
                  class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                  @click="prevMonth"
                >
                  <ChevronLeft class="h-[13px] w-[13px]" />
                </button>
                <button
                  class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
                  @click="nextMonth"
                >
                  <ChevronRight class="h-[13px] w-[13px]" />
                </button>
              </div>
            </div>

            <!-- Day headers -->
            <div class="grid grid-cols-7 mb-1">
              <div v-for="d in DAYS_SHORT" :key="d" class="text-center text-gray-400 dark:text-gray-500" style="font-size: 11px; font-weight: 600;">
                {{ d }}
              </div>
            </div>

            <!-- Cells -->
            <div class="grid grid-cols-7 gap-y-0.5">
              <button
                v-for="(cell, i) in calendarCells"
                :key="i"
                :class="[
                  'w-full aspect-square flex items-center justify-center rounded-full text-center transition-all relative',
                  isMiniSelected(cell)
                    ? 'bg-[#478FC8] text-white shadow-sm'
                    : isMiniToday(cell)
                    ? 'bg-[#478FC8]/20 text-[#478FC8]'
                    : isInCurrentWeek(cell.date) && cell.curMonth
                    ? 'bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8]'
                    : cell.curMonth
                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'text-gray-300 dark:text-gray-600',
                ]"
                :style="{ fontSize: '12px', fontWeight: isMiniSelected(cell) || isMiniToday(cell) ? 700 : 400 }"
                @click="cell.curMonth && selectDate(cell.date)"
              >
                {{ cell.day }}
                <span
                  v-if="getEventCount(cell.date) > 0"
                  :class="[
                    'absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full',
                    isMiniSelected(cell) ? 'bg-white' : 'bg-[#478FC8]'
                  ]"
                />
              </button>
            </div>
          </div>

          <!-- Projects -->
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-800 dark:text-white" style="font-size: 12.5px; font-weight: 700;">Projects</span>
              <span class="text-gray-400 dark:text-gray-500" style="font-size: 12px; font-weight: 600;">{{ activeProjects.length }}</span>
            </div>
            <div v-if="activeProjects.length" class="flex flex-col gap-2">
              <div v-for="(project, idx) in activeProjects.slice(0, 5)" :key="project.id" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span :class="['w-2 h-2 rounded-full shrink-0', projectColors[idx % projectColors.length]]" />
                  <span class="text-gray-700 dark:text-gray-300" style="font-size: 12.5px; font-weight: 500;">{{ project.name }}</span>
                </div>
                <span class="text-gray-400 dark:text-gray-500" style="font-size: 11.5px;">{{ project.totalTasks ?? 0 }} tasks</span>
              </div>
            </div>
            <p v-else class="text-gray-400 dark:text-gray-500" style="font-size: 12px;">No active projects</p>
          </div>

          <!-- Task Breakdown -->
          <div class="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <span class="text-gray-800 dark:text-white" style="font-size: 12.5px; font-weight: 700;">Task Breakdown</span>
            <div class="flex flex-col gap-2.5">
              <div v-for="pb in taskBreakdown" :key="pb.label" class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span :class="['w-2 h-2 rounded-full shrink-0', pb.color]" />
                    <span class="text-gray-600 dark:text-gray-400" style="font-size: 12px; font-weight: 500;">{{ pb.label }}</span>
                  </div>
                  <span class="text-gray-500 dark:text-gray-400" style="font-size: 12px; font-weight: 600;">{{ pb.count }}</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    :class="['h-full rounded-full transition-all duration-700', pb.color]"
                    :style="{ width: `${pb.pct}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Today's Tasks -->
          <div class="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
            <span class="text-gray-800 dark:text-white" style="font-size: 12.5px; font-weight: 700;">Today's Tasks</span>
            <div v-if="selectedDayEvents.length === 0">
              <p class="text-gray-400 dark:text-gray-500" style="font-size: 12px;">No tasks for today</p>
            </div>
            <div v-else class="flex flex-col gap-2">
              <div
                v-for="t in selectedDayEvents"
                :key="t.id"
                class="border-l-2 pl-3 py-1"
                :class="t.borderColor"
              >
                <p class="text-gray-800 dark:text-gray-200" style="font-size: 12.5px; font-weight: 600; line-height: 1.4;">{{ t.title }}</p>
                <p class="text-gray-400 dark:text-gray-500" style="font-size: 11px;">{{ formatEventTime(t) }}</p>
                <p v-if="t.assigneeName" class="text-[#478FC8]" style="font-size: 11px; font-weight: 500;">{{ t.assigneeName }}</p>
              </div>
            </div>
          </div>

          <!-- Upcoming -->
          <div class="flex flex-col gap-3 border-t border-gray-100 dark:border-gray-800 pt-4 pb-4">
            <span class="text-gray-800 dark:text-white" style="font-size: 12.5px; font-weight: 700;">Upcoming</span>
            <div v-if="upcomingEvents.length === 0">
              <p class="text-gray-400 dark:text-gray-500" style="font-size: 12px;">No upcoming tasks</p>
            </div>
            <div v-else class="flex flex-col gap-2">
              <div v-for="t in upcomingEvents" :key="t.id" class="flex items-start justify-between gap-2">
                <div class="flex items-start gap-2 min-w-0">
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full shrink-0 mt-1.5',
                      t.priority === 'HIGH' || t.priority === 'URGENT' ? 'bg-red-500'
                        : t.priority === 'MEDIUM' ? 'bg-[#478FC8]'
                        : 'bg-gray-400',
                    ]"
                  />
                  <span class="text-gray-700 dark:text-gray-300 truncate" style="font-size: 12px; font-weight: 500;">{{ t.title }}</span>
                </div>
                <span class="text-gray-400 dark:text-gray-500 shrink-0" style="font-size: 11px;">{{ formatRelativeDate(t.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ═══ Main: toolbar + week grid ═══ -->
      <div class="flex flex-col flex-1 min-w-0 gap-3 overflow-hidden">
        <!-- Toolbar -->
        <div class="flex items-center justify-between gap-3 flex-wrap shrink-0">
          <!-- Priority filter tabs -->
          <div class="flex items-center gap-2 p-1 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeFilter === tab.key
                  ? tab.activeClass + ' shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800',
              ]"
              :style="{ fontSize: '12.5px', fontWeight: activeFilter === tab.key ? 700 : 500 }"
              @click="activeFilter = tab.key"
            >
              <component :is="tab.icon" class="h-[13px] w-[13px]" />
              {{ tab.label }}
            </button>
          </div>

          <!-- Week navigation -->
          <div class="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl px-3 py-2 shadow-sm">
            <button
              class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
              @click="prevWeek"
            >
              <ChevronLeft class="h-[13px] w-[13px]" />
            </button>
            <span class="text-gray-800 dark:text-white text-center" style="font-size: 13px; font-weight: 700; min-width: 110px;">
              {{ formatWeekLabel(selectedDate) }}
            </span>
            <button
              class="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
              @click="nextWeek"
            >
              <ChevronRight class="h-[13px] w-[13px]" />
            </button>
          </div>
        </div>

        <!-- Week Grid -->
        <div class="flex flex-col flex-1 min-w-0 overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <!-- Day headers -->
          <div class="flex border-b border-gray-100 dark:border-gray-800 shrink-0">
            <!-- Time gutter -->
            <div class="w-16 shrink-0 border-r border-gray-100 dark:border-gray-800" />
            <div
              v-for="(d, i) in weekDays"
              :key="i"
              :class="[
                'flex-1 min-w-0 flex flex-col items-center justify-center py-3 border-r border-gray-100 dark:border-gray-800 last:border-r-0 transition-colors',
                isToday(d) ? 'bg-[#EDF4FF] dark:bg-[#478FC8]/5' : '',
              ]"
            >
              <span
                :class="['uppercase', isToday(d) ? 'text-[#478FC8]' : 'text-gray-400 dark:text-gray-500']"
                style="font-size: 10px; font-weight: 600; letter-spacing: 0.06em;"
              >
                {{ (DAY_NAMES[i] ?? '').slice(0, 3) }}
              </span>
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center mt-0.5',
                  isToday(d) ? 'bg-[#478FC8] shadow-sm shadow-[#478FC8]/30' : '',
                ]"
              >
                <span
                  :class="[isToday(d) ? 'text-white' : 'text-gray-800 dark:text-gray-200']"
                  :style="{ fontSize: '15px', fontWeight: isToday(d) ? 800 : 600 }"
                >
                  {{ d.getDate() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Scrollable time grid -->
          <div ref="scrollContainer" class="flex-1 overflow-y-auto overflow-x-hidden relative" style="max-height: 600px;">
            <div class="flex" :style="{ height: `${HOUR_HEIGHT * (END_HOUR - START_HOUR)}px` }">
              <!-- Time labels gutter -->
              <div class="w-16 shrink-0 relative border-r border-gray-100 dark:border-gray-800">
                <div
                  v-for="(h, i) in HOURS"
                  :key="h"
                  class="absolute left-0 right-0 flex items-start justify-end pr-2"
                  :style="{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }"
                >
                  <span
                    class="text-gray-400 dark:text-gray-500"
                    style="font-size: 10.5px; font-weight: 500; transform: translateY(-50%); margin-top: 1px;"
                  >
                    {{ formatHour(h) }}
                  </span>
                </div>
              </div>

              <!-- Day columns -->
              <div
                v-for="(d, di) in weekDays"
                :key="di"
                :class="[
                  'flex-1 min-w-0 relative border-r border-gray-100 dark:border-gray-800 last:border-r-0',
                  isToday(d) ? 'bg-[#EDF4FF]/40 dark:bg-[#478FC8]/[0.03]' : '',
                ]"
              >
                <!-- Hour lines -->
                <div
                  v-for="(_, hi) in HOURS"
                  :key="hi"
                  class="absolute left-0 right-0 border-t border-gray-50 dark:border-gray-800/60"
                  :style="{ top: `${hi * HOUR_HEIGHT}px` }"
                />
                <!-- Half-hour lines -->
                <div
                  v-for="(_, hi) in HOURS"
                  :key="'half-' + hi"
                  class="absolute left-0 right-0 border-t border-dashed border-gray-100 dark:border-gray-800/40"
                  :style="{ top: `${hi * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }"
                />

                <!-- Events -->
                <div
                  v-for="ev in getEventsForDay(di)"
                  :key="ev.id"
                  :class="[
                    'absolute left-1 right-1 rounded-lg border-l-4 px-2 py-1.5 cursor-pointer hover:shadow-md hover:brightness-95 transition-all overflow-hidden',
                    ev.color, ev.borderColor,
                  ]"
                  :style="{
                    top: `${(ev.startHour - START_HOUR) * HOUR_HEIGHT + 2}px`,
                    height: `${Math.max((ev.endHour - ev.startHour) * HOUR_HEIGHT - 4, 24)}px`,
                  }"
                >
                  <p
                    :class="['leading-tight truncate', ev.textColor]"
                    style="font-size: 11px; font-weight: 700;"
                  >
                    {{ ev.title }}
                  </p>
                  <p
                    :class="['truncate opacity-80', ev.textColor]"
                    style="font-size: 10px;"
                  >
                    {{ formatHalfHour(ev.startHour) }} – {{ formatHalfHour(ev.endHour) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutPageContainer>
</template>
