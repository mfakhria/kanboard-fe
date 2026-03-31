<script setup lang="ts">
import {
  Activity,
  CheckCircle2,
  MessageSquareText,
  MoveRight,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
type AuditFilter = 'all' | 'tasks' | 'projects' | 'members' | 'invitations'

const activeFilter = ref<AuditFilter>('all')
const filterOptions: Array<{ id: AuditFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'projects', label: 'Projects' },
  { id: 'members', label: 'Members' },
  { id: 'invitations', label: 'Invitations' },
]

const entries = computed(() => analyticsStore.auditLog)
const filteredEntries = computed(() => {
  if (activeFilter.value === 'all') return entries.value

  return entries.value.filter((entry) => {
    if (activeFilter.value === 'tasks') {
      return entry.entity === 'task' || entry.entity === 'comment'
    }

    if (activeFilter.value === 'projects') {
      return entry.entity === 'project'
    }

    if (activeFilter.value === 'members') {
      return entry.entity === 'project_member'
    }

    if (activeFilter.value === 'invitations') {
      return entry.entity === 'project_invitation'
    }

    return true
  })
})

function getIcon(action: string) {
  switch (action) {
    case 'CREATED':
      return UserPlus
    case 'UPDATED':
      return Pencil
    case 'DELETED':
      return Trash2
    case 'MOVED':
      return MoveRight
    case 'COMMENTED':
      return MessageSquareText
    case 'COMPLETED':
      return CheckCircle2
    default:
      return Activity
  }
}

function getIconClass(action: string) {
  switch (action) {
    case 'CREATED':
      return 'text-sky-600 bg-sky-50 dark:bg-sky-500/15 dark:text-sky-300'
    case 'UPDATED':
      return 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300'
    case 'DELETED':
      return 'text-red-600 bg-red-50 dark:bg-red-500/15 dark:text-red-300'
    case 'MOVED':
      return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15 dark:text-indigo-300'
    case 'COMMENTED':
      return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300'
    case 'COMPLETED':
      return 'text-teal-600 bg-teal-50 dark:bg-teal-500/15 dark:text-teal-300'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300'
  }
}

function formatTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getMetaBadges(entry: any) {
  const metadata = entry.metadata ?? {}
  const badges: string[] = []

  const changedFields = Array.isArray(metadata.changedFields) ? metadata.changedFields : []
  for (const field of changedFields) {
    badges.push(formatFieldLabel(field))
  }

  if (metadata.previousRole && metadata.role) {
    badges.push(`${metadata.previousRole} -> ${metadata.role}`)
  } else if (metadata.role && (entry.entity === 'project_member' || entry.entity === 'project_invitation')) {
    badges.push(`Role: ${metadata.role}`)
  }

  if (metadata.fromColumnName && metadata.toColumnName) {
    badges.push(`${metadata.fromColumnName} -> ${metadata.toColumnName}`)
  }

  if (metadata.status) {
    badges.push(`Status: ${metadata.status}`)
  }

  return badges
}

function formatFieldLabel(field: string) {
  switch (field) {
    case 'name':
      return 'Name'
    case 'description':
      return 'Description'
    case 'status':
      return 'Status'
    case 'visibility':
      return 'Visibility'
    case 'dueDate':
      return 'Deadline'
    case 'picId':
      return 'PIC'
    case 'color':
      return 'Color'
    case 'icon':
      return 'Icon'
    case 'title':
      return 'Title'
    case 'priority':
      return 'Priority'
    case 'completed':
      return 'Completion'
    case 'assigneeId':
      return 'Assignee'
    default:
      return field
  }
}
</script>

<template>
  <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-black/20">
    <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
      <div>
        <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">Audit Log</h3>
        <p class="mt-1 text-[12.5px] text-gray-500 dark:text-gray-400">Recent project and task activity across the active workspace.</p>
      </div>
      <div class="flex items-center gap-2 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1 text-[12px] font-semibold text-gray-500 dark:text-gray-300">
        <Activity class="h-3.5 w-3.5" />
        {{ filteredEntries.length }} entries
      </div>
    </div>

    <div class="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="option in filterOptions"
          :key="option.id"
          class="rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all"
          :class="activeFilter === option.id
            ? 'bg-[#478FC8] text-white shadow-sm'
            : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          @click="activeFilter = option.id"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="filteredEntries.length" class="divide-y divide-gray-100 dark:divide-gray-800">
      <div
        v-for="entry in filteredEntries.slice(0, 12)"
        :key="entry.id"
        class="flex items-start gap-4 px-5 py-4"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" :class="getIconClass(entry.action)">
          <component :is="getIcon(entry.action)" class="h-4 w-4" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">
              {{ entry.user.name }}
            </p>
            <span class="text-[12.5px] text-gray-600 dark:text-gray-300">
              {{ entry.description }}
            </span>
          </div>

          <div class="mt-1 flex items-center gap-2 flex-wrap text-[12px] text-gray-500 dark:text-gray-400">
            <span v-if="entry.project" class="inline-flex items-center gap-1 rounded-full bg-gray-50 dark:bg-gray-800 px-2 py-0.5">
              <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: entry.project.color || '#478FC8' }" />
              {{ entry.project.name }}
            </span>
            <span>{{ formatTime(entry.timestamp) }}</span>
            <span
              v-for="badge in getMetaBadges(entry)"
              :key="badge"
              class="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300"
            >
              {{ badge }}
            </span>
            <span v-if="entry.metadata?.commentPreview" class="truncate max-w-[420px]">
              "{{ entry.metadata.commentPreview }}"
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="px-5 py-10 text-center">
      <Activity class="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" />
      <p class="mt-3 text-[13px] font-semibold text-gray-500 dark:text-gray-300">No entries for this filter</p>
      <p class="mt-1 text-[12px] text-gray-400 dark:text-gray-500">Try another category or create more project activity to populate the audit trail.</p>
    </div>
  </div>
</template>
