<script setup lang="ts">
import { Users, Clock, ChevronRight } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const members = computed(() => analyticsStore.teamMembers)

const avatarColors = ['bg-orange-400', 'bg-purple-500', 'bg-blue-500', 'bg-emerald-500', 'bg-rose-500']
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <Users class="h-4 w-4 text-pink-500" />
        <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Team Collaboration</span>
      </div>
      <NuxtLink to="/team" class="flex items-center gap-1 text-[#478FC8] hover:text-[#3570A5] transition-colors text-xs font-semibold">
        View All
        <ChevronRight class="h-3 w-3" />
      </NuxtLink>
    </div>
    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <div v-if="members.length === 0" class="flex-1 flex flex-col items-center justify-center gap-2 py-10">
        <Users class="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p class="text-[13px] font-semibold text-gray-500 dark:text-gray-400">No assigned tasks yet</p>
      </div>

      <div v-else class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800/60 px-5 py-2">
        <div
          v-for="(member, idx) in members"
          :key="member.id"
          class="flex items-center gap-3 py-3"
        >
          <!-- Avatar -->
          <UiAvatar v-if="member.avatar" :src="member.avatar" :alt="member.name" size="sm" />
          <div
            v-else
            :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white font-bold', avatarColors[idx % avatarColors.length]]"
            style="font-size: 12px;"
          >
            {{ member.name.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2) }}
          </div>

          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-[#478FC8] truncate">{{ member.name }}</p>
            <p class="text-[11.5px] text-gray-400 dark:text-gray-500 truncate">{{ member.task }}</p>
          </div>

          <!-- Task count -->
          <div class="flex shrink-0 items-center gap-1 text-gray-500 dark:text-gray-400 text-[11.5px] font-medium">
            <Clock class="h-[11px] w-[11px]" />
            1 task
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
