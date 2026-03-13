<script setup lang="ts">
import { Users } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const members = computed(() => analyticsStore.teamMembers)

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Completed' },
  in_progress: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'In Progress' },
  pending: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', label: 'Pending' },
}

const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500']
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Team Collaboration</UiCardTitle>
        <NuxtLink to="/team">
          <button class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <Users class="h-3 w-3" />
            View All
          </button>
        </NuxtLink>
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-4">
      <div
        v-for="(member, idx) in members"
        :key="member.id"
        class="flex items-center gap-3"
      >
        <UiAvatar
          v-if="member.avatar"
          :src="member.avatar"
          :alt="member.name"
          size="sm"
        />
        <div v-else :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold', avatarColors[idx % avatarColors.length]]">
          {{ member.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ member.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            Working on <span class="font-medium text-gray-700 dark:text-gray-300">{{ member.task }}</span>
          </p>
        </div>
        <span
          :class="[
            'rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
            statusStyles[member.status]?.bg,
            statusStyles[member.status]?.text,
          ]"
        >
          {{ statusStyles[member.status]?.label }}
        </span>
      </div>

      <div v-if="members.length === 0" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No assigned tasks yet
      </div>
    </UiCardContent>
  </UiCard>
</template>
