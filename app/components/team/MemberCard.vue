<script setup lang="ts">
import {
  MoreVertical,
  MessageCircle,
} from 'lucide-vue-next'

interface TeamMemberCard {
  id: string
  name: string
  email: string
  role: string
  rawRole: string
  avatar?: string
  joinedAt: string
}

const props = defineProps<{
  member: TeamMemberCard
}>()

const emit = defineEmits<{
  viewProfile: [member: TeamMemberCard]
  editRole: [member: TeamMemberCard]
  remove: [member: TeamMemberCard]
}>()

const roleBadgeClass = computed(() => {
  switch (props.member.rawRole) {
    case 'OWNER': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    case 'ADMIN': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    case 'MEMBER': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    case 'VIEWER': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-600'
  }
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
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
            <UiDropdownItem @click="() => { emit('viewProfile', member); close() }">View Profile</UiDropdownItem>
            <UiDropdownItem v-if="member.rawRole !== 'OWNER'" @click="() => { emit('editRole', member); close() }">Edit Role</UiDropdownItem>
            <UiDropdownItem v-if="member.rawRole !== 'OWNER'" class="text-destructive" @click="() => { emit('remove', member); close() }">Remove</UiDropdownItem>
          </template>
        </UiDropdown>
      </div>

      <!-- Avatar -->
      <div class="flex flex-col items-center">
        <div class="relative">
          <UiAvatar :src="member.avatar" :alt="member.name" size="xl" />
        </div>
        <h3 class="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{{ member.name }}</h3>
        <span :class="['mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', roleBadgeClass]">
          {{ member.role }}
        </span>
        <p class="mt-1 text-xs text-muted-foreground">{{ member.email }}</p>
      </div>

      <!-- Joined date + Message action -->
      <div class="mt-4 flex items-center justify-between">
        <p class="text-xs text-muted-foreground">Joined {{ formatDate(member.joinedAt) }}</p>
        <button class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition" title="Message">
          <MessageCircle class="h-3.5 w-3.5" />
        </button>
      </div>
    </UiCardContent>
  </UiCard>
</template>
