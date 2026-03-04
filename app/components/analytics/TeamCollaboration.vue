<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const members = computed(() => analyticsStore.teamMembers)

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-lime-50', text: 'text-lime-600', label: 'Completed' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'In Progress' },
  pending: { bg: 'bg-orange-50', text: 'text-orange-600', label: 'Pending' },
}

const avatarColors = ['bg-red-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-lime-400']
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Team Collaboration</UiCardTitle>
        <button class="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
          <Plus class="h-3 w-3" />
          Add Member
        </button>
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-4">
      <div
        v-for="(member, idx) in members"
        :key="member.id"
        class="flex items-center gap-3"
      >
        <div :class="['flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold', avatarColors[idx % avatarColors.length]]">
          {{ member.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900">{{ member.name }}</p>
          <p class="text-xs text-gray-500 truncate">
            Working on <span class="font-medium text-gray-700">{{ member.task }}</span>
          </p>
        </div>
        <span
          :class="[
            'rounded-full px-2.5 py-1 text-xs font-medium',
            statusStyles[member.status]?.bg,
            statusStyles[member.status]?.text,
          ]"
        >
          {{ statusStyles[member.status]?.label }}
        </span>
      </div>
    </UiCardContent>
  </UiCard>
</template>
