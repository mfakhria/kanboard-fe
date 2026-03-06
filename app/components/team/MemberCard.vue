<script setup lang="ts">
import {
  MoreVertical,
  Phone,
  MessageCircle,
  Video,
} from 'lucide-vue-next'

interface TeamMemberCard {
  id: string
  name: string
  role: string
  avatar?: string
  taskProgress: number
  collaborators: { name: string; avatar?: string }[]
  status: 'online' | 'offline'
}

const props = defineProps<{
  member: TeamMemberCard
}>()

const progressColor = computed(() => {
  if (props.member.taskProgress >= 80) return 'bg-[#478FC8]'
  if (props.member.taskProgress >= 60) return 'bg-[#478FC8]'
  if (props.member.taskProgress >= 40) return 'bg-amber-500'
  return 'bg-red-500'
})

const avatarColors = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-emerald-500',
]
</script>

<template>
  <UiCard class="group relative transition-shadow hover:shadow-lg">
    <UiCardContent class="p-5">
      <!-- Top: Menu -->
      <div class="flex justify-end">
        <UiDropdown>
          <template #trigger>
            <button class="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted">
              <MoreVertical class="h-4 w-4" />
            </button>
          </template>
          <template #default="{ close }">
            <UiDropdownItem @click="close">View Profile</UiDropdownItem>
            <UiDropdownItem @click="close">Edit Role</UiDropdownItem>
            <UiDropdownItem class="text-destructive" @click="close">Remove</UiDropdownItem>
          </template>
        </UiDropdown>
      </div>

      <!-- Avatar -->
      <div class="flex flex-col items-center">
        <div class="relative">
          <UiAvatar :src="member.avatar" :alt="member.name" size="xl" />
          <!-- Online indicator -->
          <span
            v-if="member.status === 'online'"
            class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-gray-800 bg-emerald-500"
          />
        </div>
        <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{{ member.name }}</h3>
        <p class="text-xs text-muted-foreground">{{ member.role }}</p>
      </div>

      <!-- Task Progress -->
      <div class="mt-4">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-muted-foreground">Task</span>
          <span class="text-xs font-semibold" :class="progressColor.replace('bg-', 'text-')">{{ member.taskProgress }}%</span>
        </div>
        <div class="mt-1.5">
          <UiProgress :model-value="member.taskProgress" :indicator-class="progressColor" />
        </div>
      </div>

      <!-- Bottom: Collaborators + Actions -->
      <div class="mt-4 flex items-center justify-between">
        <!-- Collaborator Avatars -->
        <div class="flex -space-x-2">
          <template v-for="(collab, idx) in member.collaborators.slice(0, 3)" :key="idx">
            <UiAvatar
              :src="collab.avatar"
              :alt="collab.name"
              size="sm"
              class="ring-2 ring-white dark:ring-gray-800"
            />
          </template>
          <span
            v-if="member.collaborators.length > 3"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#478FC8] text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-800"
          >
            +{{ member.collaborators.length - 3 }}
          </span>
        </div>

        <!-- Action Icons -->
        <div class="flex items-center gap-1">
          <button class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition" title="Call">
            <Phone class="h-3.5 w-3.5" />
          </button>
          <button class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition" title="Message">
            <MessageCircle class="h-3.5 w-3.5" />
          </button>
          <button class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition" title="Video">
            <Video class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
