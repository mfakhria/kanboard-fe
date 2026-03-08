<script setup lang="ts">
import { ChevronLeft, ChevronRight, Plus, Filter, Briefcase, Users, GraduationCap, CalendarDays, MoreVertical } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })

// ─── Lazy-load vue-cal (client only) ───
const VueCal = defineAsyncComponent(() =>
  import('vue-cal').then((m) => m.VueCal),
)

// ─── State ───
const selectedDate = ref(new Date(2026, 5, 25)) // June 25, 2026
const activeTab = ref<'all' | 'project' | 'meeting' | 'education'>('all')
const viewMode = ref<'day' | 'week' | 'month'>('week')

// ─── Mini-calendar helpers ───
const DAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const

const currentMonth = computed(() => selectedDate.value.getMonth())
const currentYear = computed(() => selectedDate.value.getFullYear())
const monthLabel = computed(() => `${MONTHS[currentMonth.value]} ${currentYear.value}`)

function prevMonth() {
  const d = new Date(selectedDate.value)
  d.setMonth(d.getMonth() - 1)
  selectedDate.value = d
}

function nextMonth() {
  const d = new Date(selectedDate.value)
  d.setMonth(d.getMonth() + 1)
  selectedDate.value = d
}

const formattedDate = computed(() => {
  return `${MONTHS[currentMonth.value]} ${selectedDate.value.getDate()}, ${currentYear.value}`
})

// Mini calendar grid
const calendarWeeks = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()

  const cells: { day: number; current: boolean; date: Date }[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrev - i
    cells.push({ day: d, current: false, date: new Date(year, month - 1, d) })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) })
  }
  const remaining = 7 - (cells.length % 7)
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false, date: new Date(year, month + 1, d) })
    }
  }

  const weeks: (typeof cells)[] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
})

const simulatedToday = new Date(2026, 5, 25)

function isSelected(date: Date) {
  return date.toDateString() === selectedDate.value.toDateString()
}

function isToday(date: Date) {
  return date.toDateString() === simulatedToday.toDateString()
}

function selectDay(date: Date) {
  selectedDate.value = date
}

// ─── Events data ───
interface CalendarEvent {
  id: string
  title: string
  type: 'project' | 'meeting' | 'education'
  date: Date
  startHour: number
  startMinute: number
  endHour: number
  endMinute: number
  color: string
  bgColor: string
}

const events = ref<CalendarEvent[]>([
  {
    id: '1',
    title: 'Design Sprint Review',
    type: 'project',
    date: new Date(2026, 5, 25),
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 30,
    color: 'border-l-[#478FC8]',
    bgColor: 'bg-[#478FC8]/10 dark:bg-[#478FC8]/15',
  },
  {
    id: '2', title: 'Project Work', type: 'project',
    date: new Date(2026, 5, 24), startHour: 9, startMinute: 0, endHour: 10, endMinute: 30,
    color: 'border-l-orange-500', bgColor: 'bg-orange-500/10 dark:bg-orange-500/15',
  },
  {
    id: '3', title: 'Wireframe Review', type: 'meeting',
    date: new Date(2026, 5, 26), startHour: 9, startMinute: 0, endHour: 10, endMinute: 0,
    color: 'border-l-yellow-500', bgColor: 'bg-yellow-500/10 dark:bg-yellow-500/15',
  },
  {
    id: '4', title: 'Client Presentation', type: 'meeting',
    date: new Date(2026, 5, 23), startHour: 10, startMinute: 0, endHour: 11, endMinute: 30,
    color: 'border-l-red-500', bgColor: 'bg-red-500/10 dark:bg-red-500/15',
  },
  {
    id: '5',
    title: 'Group Discussion',
    type: 'meeting',
    date: new Date(2026, 5, 25),
    startHour: 10,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    color: 'border-l-[#478FC8]',
    bgColor: 'bg-[#478FC8]/10 dark:bg-[#478FC8]/15',
  },
  {
    id: '6', title: 'Weekly Meeting', type: 'meeting',
    date: new Date(2026, 5, 26), startHour: 10, startMinute: 30, endHour: 12, endMinute: 0,
    color: 'border-l-amber-500', bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
  },
  {
    id: '7', title: 'Online Workshop', type: 'education',
    date: new Date(2026, 5, 24), startHour: 11, startMinute: 0, endHour: 12, endMinute: 0,
    color: 'border-l-blue-500', bgColor: 'bg-blue-500/10 dark:bg-blue-500/15',
  },
  {
    id: '8', title: 'Code Review', type: 'project',
    date: new Date(2026, 5, 23), startHour: 8, startMinute: 0, endHour: 9, endMinute: 0,
    color: 'border-l-violet-500', bgColor: 'bg-violet-500/10 dark:bg-violet-500/15',
  },
])

// ─── Vue-Cal events format ───
function pad(n: number) { return String(n).padStart(2, '0') as `${number}${number}` }

function toDateTimeStr(date: Date, h: number, m: number) {
  const y = date.getFullYear()
  const mo = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(h)
  const mm = pad(m)
  return `${y}-${mo}-${d} ${hh}:${mm}` as `${number}${number}${number}${number}-${number}${number}-${number}${number} ${number}${number}:${number}${number}`
}

const typeClassMap: Record<string, string> = {
  project: 'event-project',
  meeting: 'event-meeting',
  education: 'event-education',
}

const vueCalEvents = computed(() => {
  const filtered = activeTab.value === 'all'
    ? events.value
    : events.value.filter(e => e.type === activeTab.value)

  return filtered.map(e => ({
    start: toDateTimeStr(e.date, e.startHour, e.startMinute),
    end: toDateTimeStr(e.date, e.endHour, e.endMinute),
    title: e.title,
    class: typeClassMap[e.type] || '',
    content: '',
  }))
})

// ─── Vue-Cal view / date sync ───
const vueCalViewDate = computed(() => selectedDate.value)

function onVueCalViewChange(event: { view: string; startDate: Date; endDate: Date }) {
  if (event.view && event.view !== viewMode.value) {
    viewMode.value = event.view as 'day' | 'week' | 'month'
  }
}

function onCellClick(date: Date) {
  if (date instanceof Date) {
    selectedDate.value = date
  }
}

function prevPeriod() {
  const d = new Date(selectedDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() - 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() - 7)
  else d.setMonth(d.getMonth() - 1)
  selectedDate.value = d
}

function nextPeriod() {
  const d = new Date(selectedDate.value)
  if (viewMode.value === 'day') d.setDate(d.getDate() + 1)
  else if (viewMode.value === 'week') d.setDate(d.getDate() + 7)
  else d.setMonth(d.getMonth() + 1)
  selectedDate.value = d
}

// ─── Sidebar helpers ───
function formatEventTime(event: CalendarEvent): string {
  const fmtShort = (h: number, m: number) => `${pad(h)}:${pad(m)}`
  return `${fmtShort(event.startHour, event.startMinute)} - ${fmtShort(event.endHour, event.endMinute)}`
}

const upcomingEvents = computed(() => {
  return [...events.value]
    .filter(e => e.date.toDateString() === selectedDate.value.toDateString())
    .sort((a, b) => a.startHour - b.startHour || a.startMinute - b.startMinute)
})

const teams = [
  { name: 'All Team', color: 'bg-violet-500' },
  { name: 'Team Project', color: 'bg-blue-500' },
]

const timeBreakdown = [
  { label: 'Project', color: 'bg-red-500', width: 'w-3/4' },
  { label: 'Meeting', color: 'bg-amber-500', width: 'w-1/2' },
  { label: 'Education', color: 'bg-[#478FC8]', width: 'w-1/3' },
]

const tabs = [
  { key: 'all' as const, label: 'All Event', icon: CalendarDays },
  { key: 'project' as const, label: 'Project', icon: Briefcase },
  { key: 'meeting' as const, label: 'Meeting', icon: Users },
  { key: 'education' as const, label: 'Education', icon: GraduationCap },
]
</script>

<template>
  <LayoutPageContainer>
    <!-- ═══ Page Header ═══ -->
    <LayoutPageHeader title="Calendar" subtitle="Plan, track, and organize your schedule.">
      <template #actions>
        <div
          class="flex items-center gap-1 rounded-lg border border-[#EDF4FF] dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
          <button v-for="mode in (['day', 'week', 'month'] as const)" :key="mode" :class="[
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            viewMode === mode
              ? 'bg-[#478FC8] text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-[#EDF4FF]'
          ]" @click="viewMode = mode">
            {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
          </button>
        </div>
      </template>
    </LayoutPageHeader>

    <!-- ═══ Main layout: sidebar + schedule ═══ -->
    <div class="flex flex-col gap-6 xl:flex-row">
      <!-- Left Sidebar Panel -->
      <div class="w-full shrink-0 xl:w-[280px] space-y-6">
        <UiCard class="p-5">
          <!-- Mini Calendar -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">{{ monthLabel }}</h3>
              <div class="flex items-center gap-1">
                <button
                  class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
                  @click="prevMonth">
                  <ChevronLeft class="h-4 w-4" />
                </button>
                <button
                  class="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition"
                  @click="nextMonth">
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Day labels row -->
            <table class="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  <th v-for="d in DAYS_SHORT" :key="d"
                    class="py-1 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
                    {{ d }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(week, wi) in calendarWeeks" :key="wi">
                  <td v-for="(cell, ci) in week" :key="ci" class="p-0 text-center">
                    <button :class="[
                      'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors',
                      !cell.current && 'text-gray-300 dark:text-gray-600',
                      cell.current && !isSelected(cell.date) && !isToday(cell.date) &&
                      'text-gray-700 dark:text-gray-300 hover:bg-[#EDF4FF]',
                      isToday(cell.date) && !isSelected(cell.date) &&
                      'bg-[#478FC8]/20 text-[#478FC8] font-bold',
                      isSelected(cell.date) &&
                      'bg-[#478FC8] text-white font-bold shadow-sm'
                    ]" @click="selectDay(cell.date)">
                      {{ cell.day }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <UiSeparator class="my-4" />

          <!-- Team -->
          <div class="mb-5">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Team</h3>
              <button class="rounded-md p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                <Plus class="h-4 w-4" />
              </button>
            </div>
            <ul class="space-y-2">
              <li v-for="team in teams" :key="team.name" class="flex items-center gap-2">
                <span :class="['h-2 w-2 rounded-full', team.color]" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ team.name }}</span>
              </li>
            </ul>
          </div>

          <UiSeparator class="my-4" />

          <!-- Time Breakdown -->
          <div class="mb-5">
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Time Breakdown</h3>
            <ul class="space-y-2.5">
              <li v-for="item in timeBreakdown" :key="item.label" class="flex items-center gap-3">
                <span :class="['h-2 w-2 shrink-0 rounded-full', item.color]" />
                <span class="w-20 text-sm text-gray-600 dark:text-gray-400">{{ item.label }}</span>
                <div class="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div :class="['h-full rounded-full', item.color, item.width]" />
                </div>
              </li>
            </ul>
          </div>

          <UiSeparator class="my-4" />

          <!-- Upcoming Schedule -->
          <div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Upcoming Schedule</h3>
            <ul class="space-y-2">
              <li v-for="event in upcomingEvents" :key="event.id"
                :class="['flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 border-l-[3px]', event.color]">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ event.title }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatEventTime(event) }}</p>
                </div>
                <button class="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical class="h-4 w-4" />
                </button>
              </li>
              <li v-if="upcomingEvents.length === 0" class="text-center py-4">
                <p class="text-xs text-gray-400 dark:text-gray-500">No events for this day</p>
              </li>
            </ul>
          </div>
        </UiCard>
      </div>

      <!-- ═══ Main Schedule Area ═══ -->
      <div class="flex-1 min-w-0">
        <UiCard class="p-5 lg:p-6">
          <!-- Tabs & Date nav -->
          <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <!-- Event type tabs -->
            <div class="flex items-center gap-1 overflow-x-auto">
              <button v-for="tab in tabs" :key="tab.key" :class="[
                'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-[#478FC8]/15 text-[#478FC8]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-[#EDF4FF]'
              ]" @click="activeTab = tab.key">
                <component :is="tab.icon" class="h-4 w-4" />
                {{ tab.label }}
              </button>
            </div>

            <!-- Date navigation -->
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5">
                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  @click="prevPeriod">
                  <ChevronLeft class="h-4 w-4" />
                </button>
                <span class="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap px-2">{{ formattedDate
                }}</span>
                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                  @click="nextPeriod">
                  <ChevronRight class="h-4 w-4" />
                </button>
              </div>
              <UiButton variant="outline" size="sm" class="gap-1.5">
                <Filter class="h-3.5 w-3.5" />
                Filter
              </UiButton>
            </div>
          </div>

          <!-- Vue-Cal Schedule -->
          <ClientOnly>
            <div class="vuecal-wrapper">
              <VueCal :key="viewMode" :view="viewMode" :events="vueCalEvents" :view-date="vueCalViewDate"
                :time-from="7 * 60" :time-to="19 * 60" :time-step="30" :title-bar="false" :views-bar="false"
                :twelve-hour="true" :today-button="false" hide-weekdays-short-label @view-change="onVueCalViewChange"
                @cell-click="onCellClick" />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-[600px]">
                <div class="text-center">
                  <div
                    class="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-lime-500" />
                  <p class="text-sm text-gray-400 dark:text-gray-500">Loading calendar...</p>
                </div>
              </div>
            </template>
          </ClientOnly>
        </UiCard>
      </div>
    </div>
  </LayoutPageContainer>
</template>

<style>
/* ═══ Vue-Cal Theme Overrides ═══ */
.vuecal-wrapper {
  min-height: 600px;
}

/* Base container */
.vuecal-wrapper .vuecal {
  border: none;
  border-radius: 0.5rem;
  overflow: hidden;
  background: transparent;
  box-shadow: none;
}

/* Header cells */
.vuecal-wrapper .vuecal .vuecal__heading .vuecal__heading-cell {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgb(107 114 128);
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid rgb(229 231 235);
  height: auto;
}

.dark .vuecal-wrapper .vuecal .vuecal__heading .vuecal__heading-cell {
  color: rgb(156 163 175);
  border-bottom-color: rgb(55 65 81);
}

/* Today's header highlight */
.vuecal-wrapper .vuecal .vuecal__heading .vuecal__heading-cell--today {
  color: rgb(101 163 13);
  font-weight: 700;
}

.dark .vuecal-wrapper .vuecal .vuecal__heading .vuecal__heading-cell--today {
  color: rgb(163 230 53);
}

/* Time column */
.vuecal-wrapper .vuecal .vuecal__time-column {
  width: 60px;
}

.vuecal-wrapper .vuecal .vuecal__time-column .vuecal__time-cell {
  font-size: 0.7rem;
  color: rgb(156 163 175);
  text-align: right;
  padding-right: 0.5rem;
}

.dark .vuecal-wrapper .vuecal .vuecal__time-column .vuecal__time-cell {
  color: rgb(107 114 128);
}

/* Grid cells */
.vuecal-wrapper .vuecal .vuecal__cell {
  border: 1px solid rgb(243 244 246);
  background: transparent;
}

.dark .vuecal-wrapper .vuecal .vuecal__cell {
  border-color: rgb(31 41 55);
}

/* Today cell */
.vuecal-wrapper .vuecal .vuecal__cell--today {
  background: rgba(163, 230, 53, 0.04);
}

.dark .vuecal-wrapper .vuecal .vuecal__cell--today {
  background: rgba(163, 230, 53, 0.06);
}

/* Current time line */
.vuecal-wrapper .vuecal .vuecal__now-line { 
  border-color: rgb(132 204 22);
  z-index: 10;
}

/* ── Event styles ── */
.vuecal-wrapper .vuecal .vuecal__event {
  border-radius: 0.375rem;
  border: none;
  border-left: 3px solid;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  overflow: hidden;
  line-height: 1.3;
}

.vuecal-wrapper .vuecal .vuecal__event:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

/* Event type: Project */
.vuecal-wrapper .vuecal .vuecal__event.event-project {
  border-left-color: rgb(132 204 22);
  background: rgba(132, 204, 22, 0.1);
  color: rgb(17 24 39);
}

.dark .vuecal-wrapper .vuecal .vuecal__event.event-project {
  background: rgba(132, 204, 22, 0.15);
  color: rgb(255 255 255);
}

/* Event type: Meeting */
.vuecal-wrapper .vuecal .vuecal__event.event-meeting {
  border-left-color: rgb(245 158 11);
  background: rgba(245, 158, 11, 0.1);
  color: rgb(17 24 39);
}

.dark .vuecal-wrapper .vuecal .vuecal__event.event-meeting {
  background: rgba(245, 158, 11, 0.15);
  color: rgb(255 255 255);
}

/* Event type: Education */
.vuecal-wrapper .vuecal .vuecal__event.event-education {
  border-left-color: rgb(59 130 246);
  background: rgba(59, 130, 246, 0.1);
  color: rgb(17 24 39);
}

.dark .vuecal-wrapper .vuecal .vuecal__event.event-education {
  background: rgba(59, 130, 246, 0.15);
  color: rgb(255 255 255);
}

/* Event title */
.vuecal-wrapper .vuecal .vuecal__event .vuecal__event-title {
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Event time */
.vuecal-wrapper .vuecal .vuecal__event .vuecal__event-time {
  font-size: 0.65rem;
  font-weight: 500;
  opacity: 0.7;
  margin-top: 0.125rem;
}

/* Hide default vue-cal title bar & views bar since we have our own */
.vuecal-wrapper .vuecal .vuecal__title-bar,
.vuecal-wrapper .vuecal .vuecal__views-bar {
  display: none !important;
}

/* All-day bar */
.vuecal-wrapper .vuecal .vuecal__all-day {
  background: transparent;
  border-bottom: 1px solid rgb(229 231 235);
}

.dark .vuecal-wrapper .vuecal .vuecal__all-day {
  border-bottom-color: rgb(55 65 81);
}

/* Weekdays header row */
.vuecal-wrapper .vuecal .vuecal__heading {
  background: transparent;
  border: none;
}

/* Body scrollable area */
.vuecal-wrapper .vuecal .vuecal__body {
  background: transparent;
}

/* Month view cells */
.vuecal-wrapper .vuecal .vuecal__cell .vuecal__cell-date {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgb(75 85 99);
  padding: 0.25rem 0.5rem;
}

.dark .vuecal-wrapper .vuecal .vuecal__cell .vuecal__cell-date {
  color: rgb(209 213 219);
}

/* Remove outer borders */
.vuecal-wrapper .vuecal .vuecal__body,
.vuecal-wrapper .vuecal .vuecal__bg {
  border: none;
}

/* Selected cell highlight */
.vuecal-wrapper .vuecal .vuecal__cell--selected {
  background: rgba(163, 230, 53, 0.06);
}

.dark .vuecal-wrapper .vuecal .vuecal__cell--selected {
  background: rgba(163, 230, 53, 0.08);
}

/* Scrollable body height */
.vuecal-wrapper .vuecal--view-with-time .vuecal__body {
  max-height: 600px;
  overflow-y: auto;
}
</style>
