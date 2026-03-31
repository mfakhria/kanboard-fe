<script setup lang="ts">
import {
  Calendar,
  Tag,
  Users,
  Flag,
  MessageSquare,
  Columns3,
  Trash2,
  Save,
  UserPlus,
  X,
  Check,
  Palette,
  Plus,
  Paperclip,
  Upload,
  Download,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Clock3,
  Send,
  RotateCcw,
  GitPullRequest,
} from 'lucide-vue-next'
import type { Task, TaskLabel, TaskAttachment } from '~/features/kanban/types'
import { kanbanApi } from '~/features/kanban/services/task.api'

const props = defineProps<{
  task: Task
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const kanbanStore = useKanbanStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

// ─── Editable form fields ───
const editForm = reactive({
  title: props.task.title,
  description: props.task.description || '',
  priority: props.task.priority,
  dueDate: props.task.dueDate ? new Date(props.task.dueDate).toISOString().slice(0, 16) : '',
})

const labelPalette = [
  '#478FC8',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#ef4444',
  '#64748b',
]

const editableLabels = ref<TaskLabel[]>(
  props.task.labels.map(label => ({
    id: label.id,
    name: label.name,
    color: label.color,
  })),
)
const newLabelName = ref('')
const newLabelColor = ref(labelPalette[0] ?? '#478FC8')
const attachments = ref<TaskAttachment[]>(props.task.attachments ?? [])
const isLoadingAttachments = ref(false)
const isUploadingAttachment = ref(false)
const attachmentInputRef = ref<HTMLInputElement | null>(null)
const reviewComment = ref('')
const reviewDecisionComment = ref('')
const selectedReviewerId = ref<string | null>(props.task.reviewer?.id ?? null)
const reviewDueDate = ref(props.task.reviewDueDate ? new Date(props.task.reviewDueDate).toISOString().slice(0, 16) : '')
const approvalStatus = ref<Task['approvalStatus']>(props.task.approvalStatus ?? 'NONE')
const reviewSubmittedAt = ref(props.task.reviewSubmittedAt ?? '')
const reviewTimeline = ref(props.task.reviews ?? [])
const reviewer = ref(props.task.reviewer)
const isSubmittingReview = ref(false)
const isDecidingReview = ref(false)

// ─── Column / Status ───
const columns = computed(() => kanbanStore.columns)
const selectedColumnId = ref(props.task.columnId)

// ─── Assignee ───
const initialAssigneeId = props.task.assignees[0]?.id ?? null
const selectedAssigneeId = ref<string | null>(
  initialAssigneeId,
)
const showAssigneeDropdown = ref(false)

const projectMembers = computed(() => projectStore.currentMembers)
const catalogLabelSuggestions = computed(() => {
  const catalog = projectStore.currentLabels ?? []

  return catalog.filter((label) => {
    const key = label.name.trim().toLowerCase()
    return key && !editableLabels.value.some(current => current.name.trim().toLowerCase() === key)
  })
})

const boardLabelSuggestions = computed(() => {
  const seen = new Set<string>()

  return kanbanStore.columns
    .flatMap(column => column.tasks)
    .flatMap(task => task.labels)
    .filter((label) => {
      const key = label.name.trim().toLowerCase()
      if (!key || seen.has(key)) return false
      seen.add(key)
      return !editableLabels.value.some(current => current.name.trim().toLowerCase() === key)
    })
    .filter(label =>
      !catalogLabelSuggestions.value.some(
        catalogLabel => catalogLabel.name.trim().toLowerCase() === label.name.trim().toLowerCase(),
      ),
    )
    .slice(0, 8)
})

const currentAssignee = computed(() => {
  if (!selectedAssigneeId.value) return null
  // Check from task assignees first
  const fromTask = props.task.assignees.find(a => a.id === selectedAssigneeId.value)
  if (fromTask) return fromTask
  // Fallback to project members
  const member = projectMembers.value.find(m => m.user.id === selectedAssigneeId.value)
  if (member) return { id: member.user.id, name: member.user.name, avatar: member.user.avatar }
  return null
})

const currentUserId = computed(() => authStore.currentUser?.id ?? null)

const currentReviewer = computed(() => {
  if (!selectedReviewerId.value) return null
  const member = projectMembers.value.find(m => m.user.id === selectedReviewerId.value)
  if (member) return member.user
  if (reviewer.value?.id === selectedReviewerId.value) return reviewer.value
  return null
})

const reviewerCandidates = computed(() =>
  projectMembers.value.filter(member => member.role !== 'VIEWER'),
)

const isReviewPending = computed(() => approvalStatus.value === 'IN_REVIEW')
const canSubmitReview = computed(() => !!selectedReviewerId.value && selectedReviewerId.value !== currentUserId.value)
const canDecideReview = computed(() => {
  const currentRole = projectStore.currentProject?.myRole
  return isReviewPending.value && (
    selectedReviewerId.value === currentUserId.value
    || currentRole === 'OWNER'
    || currentRole === 'ADMIN'
  )
})

const approvalBadge = computed(() => {
  switch (approvalStatus.value) {
    case 'IN_REVIEW':
      return {
        label: 'In Review',
        class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Clock3,
      }
    case 'CHANGES_REQUESTED':
      return {
        label: 'Changes Requested',
        class: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: ShieldAlert,
      }
    case 'APPROVED':
      return {
        label: 'Approved',
        class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: ShieldCheck,
      }
    default:
      return {
        label: 'Draft',
        class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        icon: GitPullRequest,
      }
  }
})

function selectAssignee(userId: string) {
  selectedAssigneeId.value = userId
  showAssigneeDropdown.value = false
}

function removeAssignee() {
  selectedAssigneeId.value = null
  showAssigneeDropdown.value = false
}

function addLabelFromInput() {
  const trimmedName = newLabelName.value.trim()
  if (!trimmedName) return

  const exists = editableLabels.value.some(
    label => label.name.trim().toLowerCase() === trimmedName.toLowerCase(),
  )
  if (exists) {
    newLabelName.value = ''
    return
  }

  editableLabels.value.push({
    name: trimmedName,
    color: newLabelColor.value,
  })
  newLabelName.value = ''
}

function addSuggestedLabel(label: TaskLabel) {
  const exists = editableLabels.value.some(
    current => current.name.trim().toLowerCase() === label.name.trim().toLowerCase(),
  )
  if (exists) return

  editableLabels.value.push({
    name: label.name,
    color: label.color,
  })
}

function removeLabel(labelName: string) {
  editableLabels.value = editableLabels.value.filter(label => label.name !== labelName)
}

async function fetchTaskDetails() {
  isLoadingAttachments.value = true
  try {
    const { data } = await kanbanApi.getTask(props.task.id)
    const taskDetail = kanbanStore.normalizeTask(data as any)
    attachments.value = taskDetail.attachments ?? []
    reviewer.value = taskDetail.reviewer
    selectedReviewerId.value = taskDetail.reviewer?.id ?? selectedReviewerId.value
    approvalStatus.value = taskDetail.approvalStatus ?? 'NONE'
    reviewSubmittedAt.value = taskDetail.reviewSubmittedAt ?? ''
    reviewDueDate.value = taskDetail.reviewDueDate ? new Date(taskDetail.reviewDueDate).toISOString().slice(0, 16) : ''
    reviewTimeline.value = taskDetail.reviews ?? []
  } catch (error) {
    console.error('Failed to fetch task details:', error)
  } finally {
    isLoadingAttachments.value = false
  }
}

function getAttachmentUrl(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const baseUrl = (runtimeConfig.public.apiBaseUrl || '').replace(/\/api\/?$/, '')
  return `${baseUrl}${url}`
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`
  return `${Math.round(size / (1024 * 102.4)) / 10} MB`
}

function formatReviewDate(value?: string) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function reviewActionLabel(action: string) {
  switch (action) {
    case 'SUBMITTED':
      return 'Submitted for review'
    case 'APPROVED':
      return 'Approved'
    case 'CHANGES_REQUESTED':
      return 'Changes requested'
    case 'CANCELLED':
      return 'Review cancelled'
    default:
      return action
  }
}

function openAttachmentPicker() {
  attachmentInputRef.value?.click()
}

async function handleAttachmentSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  isUploadingAttachment.value = true
  try {
    await kanbanApi.uploadAttachment(props.task.id, file)
    await fetchTaskDetails()
    if (kanbanStore.board) {
      await kanbanStore.fetchBoard(kanbanStore.board.projectId)
    }
  } catch (error) {
    console.error('Failed to upload attachment:', error)
  } finally {
    input.value = ''
    isUploadingAttachment.value = false
  }
}

async function removeAttachment(attachmentId: string) {
  try {
    await kanbanApi.deleteAttachment(props.task.id, attachmentId)
    attachments.value = attachments.value.filter(attachment => attachment.id !== attachmentId)
    if (kanbanStore.board) {
      await kanbanStore.fetchBoard(kanbanStore.board.projectId)
    }
  } catch (error) {
    console.error('Failed to delete attachment:', error)
  }
}

async function refreshTaskState() {
  await fetchTaskDetails()
  if (kanbanStore.board) {
    await kanbanStore.fetchBoard(kanbanStore.board.projectId)
  }
}

async function handleSubmitReview() {
  if (!canSubmitReview.value) return

  isSubmittingReview.value = true
  try {
    await kanbanApi.submitTaskReview(props.task.id, {
      reviewerId: selectedReviewerId.value ?? undefined,
      reviewDueDate: reviewDueDate.value || undefined,
      comment: reviewComment.value || undefined,
    })
    reviewComment.value = ''
    await refreshTaskState()
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    isSubmittingReview.value = false
  }
}

async function handleDecision(decision: 'APPROVED' | 'CHANGES_REQUESTED') {
  if (!canDecideReview.value) return

  isDecidingReview.value = true
  try {
    await kanbanApi.decideTaskReview(props.task.id, {
      decision,
      comment: reviewDecisionComment.value || undefined,
    })
    reviewDecisionComment.value = ''
    await refreshTaskState()
  } catch (error) {
    console.error(`Failed to ${decision.toLowerCase()} review:`, error)
  } finally {
    isDecidingReview.value = false
  }
}

async function handleCancelReview() {
  isSubmittingReview.value = true
  try {
    await kanbanApi.cancelTaskReview(props.task.id)
    await refreshTaskState()
  } catch (error) {
    console.error('Failed to cancel review:', error)
  } finally {
    isSubmittingReview.value = false
  }
}

// ─── Save ───
const isSaving = ref(false)

const handleSave = async () => {
  isSaving.value = true
  try {
    // Update task fields (title, description, priority, dueDate)
    await kanbanStore.updateTask(props.task.id, {
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority,
      dueDate: editForm.dueDate || undefined,
      labels: editableLabels.value.map(label => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
    })

    // Assign/unassign member if changed
    const currentAssigneeIdValue = props.task.assignees[0]?.id ?? null
    if (selectedAssigneeId.value !== currentAssigneeIdValue) {
      await kanbanApi.assignTask(props.task.id, selectedAssigneeId.value)
      // Re-fetch board to get updated assignee data
      if (kanbanStore.board) {
        await kanbanStore.fetchBoard(kanbanStore.board.projectId)
      }
    }

    // Move task if column changed
    if (selectedColumnId.value !== props.task.columnId) {
      const targetCol = columns.value.find(c => c.id === selectedColumnId.value)
      if (targetCol) {
        await kanbanStore.moveTask({
          taskId: props.task.id,
          targetColumnId: selectedColumnId.value,
          targetPosition: targetCol.tasks.length,
        })
      }
    }

    emit('update:open', false)
  } catch (error) {
    console.error('Failed to save task:', error)
  } finally {
    isSaving.value = false
  }
}

const handleDelete = () => {
  kanbanStore.deleteTask(props.task.id)
  emit('update:open', false)
}

const priorityOptions = [
  { label: 'Low', value: 'low', color: 'text-gray-500' },
  { label: 'Medium', value: 'medium', color: 'text-blue-500' },
  { label: 'High', value: 'high', color: 'text-orange-500' },
  { label: 'Urgent', value: 'urgent', color: 'text-red-500' },
]

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
}

const avatarColors = [
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-rose-400 to-red-500',
]

// Close dropdown on click outside
const assigneeRef = ref<HTMLElement>()
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchTaskDetails()
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
watch(() => props.task.id, () => {
  fetchTaskDetails()
})
function handleClickOutside(e: MouseEvent) {
  if (assigneeRef.value && !assigneeRef.value.contains(e.target as Node)) {
    showAssigneeDropdown.value = false
  }
}
</script>

<template>
  <UiDialog
    :open="open"
    class="max-w-4xl max-h-[92vh] overflow-hidden p-0"
    @update:open="emit('update:open', $event)"
  >
    <template #default="{ close }">
      <div class="flex max-h-[92vh] flex-col">
        <div class="border-b border-gray-100 dark:border-gray-800 px-6 py-5 pr-14">
          <input
            v-model="editForm.title"
            class="w-full text-lg font-bold text-gray-900 dark:text-white border-none outline-none focus:ring-0 p-0 bg-transparent placeholder:text-gray-400"
            placeholder="Task title"
          />
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="space-y-5">
        <!-- Meta row: Priority + Due Date + Status Column -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Priority -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Flag :class="['h-3.5 w-3.5', priorityColors[editForm.priority]]" />
              Priority
            </label>
            <select
              v-model="editForm.priority"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            >
              <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Due Date -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Calendar class="h-3.5 w-3.5" />
              Due Date
            </label>
            <input
              v-model="editForm.dueDate"
              type="datetime-local"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            />
          </div>

          <!-- Move to Column (Status) -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Columns3 class="h-3.5 w-3.5" />
              Status
            </label>
            <select
              v-model="selectedColumnId"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            >
              <option v-for="col in columns" :key="col.id" :value="col.id">
                {{ col.title }}
              </option>
            </select>
          </div>
        </div>

        <!-- Assignee -->
        <div ref="assigneeRef" class="relative">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</span>
            </div>
          </div>

          <!-- Current assignee or assign button -->
          <div class="flex items-center gap-2">
            <template v-if="currentAssignee">
              <div class="flex items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 flex-1">
                <div
                  :class="['flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0', avatarColors[0]]"
                >
                  {{ currentAssignee.name.charAt(0).toUpperCase() }}
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300 flex-1">{{ currentAssignee.name }}</span>
                <button
                  type="button"
                  class="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove assignee"
                  @click.stop="removeAssignee"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:border-[#478FC8] hover:text-[#478FC8] transition shrink-0"
                title="Change assignee"
                @click.stop="showAssigneeDropdown = !showAssigneeDropdown"
              >
                <UserPlus class="h-4 w-4" />
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-400 hover:border-[#478FC8] hover:text-[#478FC8] transition w-full"
                @click.stop="showAssigneeDropdown = !showAssigneeDropdown"
              >
                <UserPlus class="h-4 w-4" />
                Assign a member
              </button>
            </template>
          </div>

          <!-- Dropdown: Project Members -->
          <div
            v-if="showAssigneeDropdown"
            class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg max-h-48 overflow-y-auto"
          >
            <div v-if="projectMembers.length === 0" class="px-3 py-4 text-center text-xs text-gray-400">
              No project members found
            </div>
            <button
              v-for="(member, idx) in projectMembers"
              :key="member.id"
              type="button"
              class="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click.stop="selectAssignee(member.user.id)"
            >
              <div
                :class="['flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0', avatarColors[idx % avatarColors.length]]"
              >
                {{ member.user.name?.charAt(0)?.toUpperCase() || '?' }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{{ member.user.name }}</p>
                <p class="text-[11px] text-gray-400 dark:text-gray-500 truncate">{{ member.role }}</p>
              </div>
              <Check
                v-if="selectedAssigneeId === member.user.id"
                class="h-4 w-4 text-[#478FC8] shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Approval workflow -->
        <div class="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-[#EDF4FF] via-white to-[#F6FAFF] dark:from-[#0f172a] dark:via-gray-900 dark:to-[#111827] p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <GitPullRequest class="h-4 w-4 text-[#478FC8]" />
                <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">Approval Workflow</span>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Submit this task for formal review, assign an approver, and keep the decision trail documented.
              </p>
            </div>

            <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold', approvalBadge.class]">
              <component :is="approvalBadge.icon" class="h-3.5 w-3.5" />
              {{ approvalBadge.label }}
            </span>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Reviewer</label>
              <select
                v-model="selectedReviewerId"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8]"
              >
                <option :value="null">Select reviewer</option>
                <option
                  v-for="member in reviewerCandidates"
                  :key="member.id"
                  :value="member.user.id"
                >
                  {{ member.user.name }} - {{ member.role }}
                </option>
              </select>
              <p v-if="currentReviewer" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Current approver: {{ currentReviewer.name }}
              </p>
            </div>

            <div>
              <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Review due date</label>
              <input
                v-model="reviewDueDate"
                type="datetime-local"
                class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8]"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Submitted: {{ formatReviewDate(reviewSubmittedAt || undefined) }}
              </p>
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">Submission note</label>
            <UiTextarea
              v-model="reviewComment"
              placeholder="Explain what is ready, what needs approval, or any review checklist."
              class="min-h-[84px]"
            />
          </div>

          <div class="flex flex-wrap gap-2">
            <UiButton
              type="button"
              size="sm"
              class="gap-1.5 bg-[#478FC8] hover:bg-[#3a7bb3] text-white"
              :disabled="!canSubmitReview || isSubmittingReview"
              @click="handleSubmitReview"
            >
              <Send class="h-3.5 w-3.5" />
              {{ isSubmittingReview ? 'Submitting...' : (isReviewPending ? 'Resubmit Review' : 'Submit for Review') }}
            </UiButton>

            <UiButton
              v-if="isReviewPending"
              type="button"
              size="sm"
              variant="outline"
              class="gap-1.5"
              :disabled="isSubmittingReview"
              @click="handleCancelReview"
            >
              <RotateCcw class="h-3.5 w-3.5" />
              Cancel Review
            </UiButton>
          </div>

          <div v-if="canDecideReview" class="space-y-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/70 p-3">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ShieldCheck class="h-4 w-4 text-emerald-500" />
              Reviewer Decision
            </div>
            <UiTextarea
              v-model="reviewDecisionComment"
              placeholder="Add approval notes or requested changes."
              class="min-h-[80px]"
            />
            <div class="flex flex-wrap gap-2">
              <UiButton
                type="button"
                size="sm"
                class="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                :disabled="isDecidingReview"
                @click="handleDecision('APPROVED')"
              >
                <ShieldCheck class="h-3.5 w-3.5" />
                Approve
              </UiButton>
              <UiButton
                type="button"
                size="sm"
                variant="outline"
                class="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                :disabled="isDecidingReview"
                @click="handleDecision('CHANGES_REQUESTED')"
              >
                <ShieldAlert class="h-3.5 w-3.5" />
                Request Changes
              </UiButton>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">Review Timeline</p>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ reviewTimeline.length }} event{{ reviewTimeline.length === 1 ? '' : 's' }}</span>
            </div>

            <div v-if="reviewTimeline.length" class="space-y-2">
              <div
                v-for="entry in reviewTimeline"
                :key="entry.id"
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-3 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {{ reviewActionLabel(entry.action) }}
                    </p>
                    <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {{ entry.actor.name }}
                      <span v-if="entry.reviewer"> -> {{ entry.reviewer.name }}</span>
                    </p>
                  </div>
                  <span class="text-[11px] text-gray-400 dark:text-gray-500">
                    {{ formatReviewDate(entry.createdAt) }}
                  </span>
                </div>
                <p v-if="entry.comment" class="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {{ entry.comment }}
                </p>
              </div>
            </div>

            <p v-else class="text-xs text-gray-400 dark:text-gray-500">
              No review history yet. Submit this task when it is ready for validation or approval.
            </p>
          </div>
        </div>

        <!-- Labels -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Labels</span>
          </div>

          <div v-if="editableLabels.length" class="flex flex-wrap gap-2">
            <span
              v-for="label in editableLabels"
              :key="label.id ?? label.name"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
              :style="{
                color: label.color,
                borderColor: `${label.color}45`,
                backgroundColor: `${label.color}16`,
              }"
            >
              <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: label.color }" />
              {{ label.name }}
              <button
                type="button"
                class="rounded-full p-0.5 transition hover:bg-black/5"
                aria-label="Remove label"
                @click="removeLabel(label.name)"
              >
                <X class="h-3 w-3" />
              </button>
            </span>
          </div>

          <p v-else class="text-xs text-gray-400 dark:text-gray-500">
            No labels yet. Add labels to group this task by topic, owner stream, or workflow state.
          </p>

          <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/60 p-3">
            <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Tag class="h-3.5 w-3.5" />
                  New Label
                </label>
                <input
                  v-model="newLabelName"
                  type="text"
                  class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8]"
                  placeholder="e.g. Backend, Design, Blocked"
                  @keydown.enter.prevent="addLabelFromInput"
                />
              </div>

              <div>
                <label class="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Palette class="h-3.5 w-3.5" />
                  Color
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="newLabelColor"
                    type="color"
                    class="h-10 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-900"
                  />
                  <UiButton
                    type="button"
                    size="sm"
                    class="gap-1.5"
                    :disabled="!newLabelName.trim()"
                    @click="addLabelFromInput"
                  >
                    <Plus class="h-3.5 w-3.5" />
                    Add
                  </UiButton>
                </div>
              </div>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="color in labelPalette"
                :key="color"
                type="button"
                :class="[
                  'h-6 w-6 rounded-full border-2 transition',
                  newLabelColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-white dark:border-gray-800',
                ]"
                :style="{ backgroundColor: color }"
                :aria-label="`Use ${color} label color`"
                @click="newLabelColor = color"
              />
            </div>
          </div>

          <div v-if="catalogLabelSuggestions.length" class="space-y-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Project label catalog</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="label in catalogLabelSuggestions"
                :key="label.id ?? label.name"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:-translate-y-0.5"
                :style="{
                  color: label.color,
                  borderColor: `${label.color}45`,
                  backgroundColor: `${label.color}10`,
                }"
                @click="addSuggestedLabel(label)"
              >
                <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: label.color }" />
                {{ label.name }}
              </button>
            </div>
          </div>

          <div v-if="boardLabelSuggestions.length" class="space-y-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Other labels from this board</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="label in boardLabelSuggestions"
                :key="label.id ?? label.name"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition hover:-translate-y-0.5"
                :style="{
                  color: label.color,
                  borderColor: `${label.color}45`,
                  backgroundColor: `${label.color}10`,
                }"
                @click="addSuggestedLabel(label)"
              >
                <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: label.color }" />
                {{ label.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div class="space-y-3">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Paperclip class="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Attachments</span>
              <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                {{ attachments.length }}
              </span>
            </div>

            <input
              ref="attachmentInputRef"
              type="file"
              class="hidden"
              @change="handleAttachmentSelected"
            />
            <UiButton
              type="button"
              size="sm"
              variant="outline"
              class="gap-1.5"
              :disabled="isUploadingAttachment"
              @click="openAttachmentPicker"
            >
              <Loader2 v-if="isUploadingAttachment" class="h-3.5 w-3.5 animate-spin" />
              <Upload v-else class="h-3.5 w-3.5" />
              {{ isUploadingAttachment ? 'Uploading...' : 'Upload File' }}
            </UiButton>
          </div>

          <div v-if="isLoadingAttachments" class="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 class="h-4 w-4 animate-spin" />
            Loading attachments...
          </div>

          <div v-else-if="attachments.length" class="space-y-2">
            <div
              v-for="attachment in attachments"
              :key="attachment.id"
              class="flex items-center gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/50 px-3 py-3"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8] shrink-0">
                <Paperclip class="h-4 w-4" />
              </div>
              <div class="min-w-0 flex-1">
                <a
                  :href="getAttachmentUrl(attachment.url)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="block truncate text-sm font-semibold text-gray-800 transition hover:text-[#478FC8] dark:text-gray-200"
                >
                  {{ attachment.originalName }}
                </a>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ formatFileSize(attachment.size) }}
                  <span v-if="attachment.uploader"> • uploaded by {{ attachment.uploader.name }}</span>
                </p>
              </div>
              <a
                :href="getAttachmentUrl(attachment.url)"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-lg p-2 text-gray-400 transition hover:bg-gray-200/70 hover:text-[#478FC8] dark:hover:bg-gray-700"
                title="Open attachment"
              >
                <Download class="h-4 w-4" />
              </a>
              <button
                type="button"
                class="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                title="Remove attachment"
                @click="removeAttachment(attachment.id)"
              >
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>

          <p v-else class="text-xs text-gray-400 dark:text-gray-500">
            No files attached yet. Upload references, screenshots, specs, or supporting documents for this task.
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <UiTextarea
            v-model="editForm.description"
            placeholder="Add a description..."
            class="min-h-[100px]"
          />
        </div>

        <!-- Comments preview -->
        <div v-if="task.commentsCount > 0" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <MessageSquare class="h-4 w-4" />
          {{ task.commentsCount }} comments
        </div>

          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-between gap-3 border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 px-6 py-4 backdrop-blur">
          <UiButton variant="outline" size="sm" class="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-800 dark:text-red-400" @click="handleDelete">
            <Trash2 class="h-3.5 w-3.5" />
            Delete
          </UiButton>
          <div class="flex gap-2">
            <UiButton variant="outline" size="sm" @click="close">Cancel</UiButton>
            <UiButton size="sm" class="gap-1.5 bg-[#478FC8] hover:bg-[#3a7bb3] text-white" :disabled="isSaving" @click="handleSave">
              <Save class="h-3.5 w-3.5" />
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </UiButton>
          </div>
        </div>
      </div>
    </template>
  </UiDialog>
</template>
