<script setup lang="ts">
import { Users, CheckCircle2 } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const members = computed(() => analyticsStore.teamMembers)

const avatarColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#10b981']
</script>

<template>
  <UiCard class="h-full border border-gray-100 dark:border-gray-800 shadow-sm">
    <UiCardHeader class="px-5 pt-5 pb-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 dark:bg-pink-900/20">
            <Users class="h-3.5 w-3.5 text-pink-500" />
          </div>
          <UiCardTitle class="text-sm text-gray-700 dark:text-gray-200">Team Collaboration</UiCardTitle>
        </div>
        <NuxtLink to="/team">
          <button class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#478FC8] hover:bg-[#EDF4FF] dark:hover:bg-[#478FC8]/10 transition h-7">
            <Users class="h-3 w-3" />
            View All
          </button>
        </NuxtLink>
      </div>
    </UiCardHeader>
    <UiCardContent class="px-5 pb-5">
      <div v-if="members.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
        <Users class="h-8 w-8 mb-2 opacity-30" />
        <p class="text-xs">No assigned tasks yet</p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="(member, idx) in members"
          :key="member.id"
          class="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <!-- Avatar -->
          <UiAvatar
            v-if="member.avatar"
            :src="member.avatar"
            :alt="member.name"
            size="sm"
          />
          <div
            v-else
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            :style="{ backgroundColor: avatarColors[idx % avatarColors.length] }"
          >
            {{ member.name.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2) }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">
              {{ member.name }}
            </p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500 truncate">
              {{ member.task }}
            </p>
          </div>

          <!-- Task count -->
          <div class="flex shrink-0 items-center gap-1.5">
            <CheckCircle2 class="h-3.5 w-3.5 text-[#478FC8]" />
            <span class="text-xs text-gray-500 dark:text-gray-400">1 task</span>
          </div>
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>
