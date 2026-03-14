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
} from 'lucide-vue-next'
import type { Task } from '~/features/kanban/types'
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

// ─── Editable form fields ───
const editForm = reactive({
  title: props.task.title,
  description: props.task.description || '',
  priority: props.task.priority,
  dueDate: props.task.dueDate ? new Date(props.task.dueDate).toISOString().split('T')[0] : '',
})

// ─── Column / Status ───
const columns = computed(() => kanbanStore.columns)
const selectedColumnId = ref(props.task.columnId)

// ─── Assignee ───
const selectedAssigneeId = ref<string | null>(
  props.task.assignees.length > 0 ? props.task.assignees[0].id : null,
)
const showAssigneeDropdown = ref(false)

const projectMembers = computed(() => projectStore.currentMembers)

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

function selectAssignee(userId: string) {
  selectedAssigneeId.value = userId
  showAssigneeDropdown.value = false
}

function removeAssignee() {
  selectedAssigneeId.value = null
  showAssigneeDropdown.value = false
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
    })

    // Assign/unassign member if changed
    const currentAssigneeIdValue = props.task.assignees.length > 0 ? props.task.assignees[0].id : null
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
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
function handleClickOutside(e: MouseEvent) {
  if (assigneeRef.value && !assigneeRef.value.contains(e.target as Node)) {
    showAssigneeDropdown.value = false
  }
}
</script>

<template>
  <UiDialog :open="open" @update:open="emit('update:open', $event)">
    <template #default="{ close }">
      <div class="space-y-5">
        <!-- Title -->
        <div>
          <input
            v-model="editForm.title"
            class="w-full text-lg font-bold text-gray-900 dark:text-white border-none outline-none focus:ring-0 p-0 bg-transparent placeholder:text-gray-400"
            placeholder="Task title"
          />
        </div>

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
              type="date"
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

        <!-- Labels -->
        <div v-if="task.labels.length">
          <div class="flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Labels</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="label in task.labels"
              :key="label"
              class="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {{ label }}
            </span>
          </div>
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

        <!-- Actions -->
        <div class="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
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
