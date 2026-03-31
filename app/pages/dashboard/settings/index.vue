<script setup lang="ts">
import {
  User,
  Bell,
  Palette,
  Shield,
  Building2,
} from 'lucide-vue-next'
import type { Component } from 'vue'

definePageMeta({
  layout: 'dashboard',
})

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security' | 'workspace'

interface TabItem {
  id: SettingsTab
  label: string
  icon: Component
}

const tabs: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'workspace', label: 'Team', icon: Building2 },
]

const route = useRoute()
const activeTab = ref<SettingsTab>('profile')

watchEffect(() => {
  const tab = route.query.tab
  const nextTab = typeof tab === 'string' ? tab : ''
  if (tabs.some(item => item.id === nextTab)) {
    activeTab.value = nextTab as SettingsTab
  }
})
</script>

<template>
  <LayoutPageContainer>
    <!-- Header -->
    <div>
      <div class="flex items-center gap-3 mb-1">
        <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3570A5]" />
        <h1 class="text-[clamp(20px,2.5vw,28px)] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
          Settings
        </h1>
      </div>
      <p class="text-[13.5px] text-gray-500 dark:text-gray-400 pl-4 leading-relaxed">
        Manage your account
        <span class="font-semibold bg-gradient-to-r from-[#478FC8] to-[#6db3e8] bg-clip-text text-transparent">preferences</span>
        and configuration.
      </p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 text-[13px]"
        :class="activeTab === tab.id
          ? 'text-white shadow-md'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
        "
        :style="activeTab === tab.id
          ? { background: 'linear-gradient(135deg, #478FC8, #3570A5)', fontWeight: 700, boxShadow: '0 4px 12px rgba(71,143,200,0.3)' }
          : { fontWeight: 600 }
        "
        @click="activeTab = tab.id"
      >
        <component :is="tab.icon" style="width: 14px; height: 14px;" />
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <SettingsTabProfile v-if="activeTab === 'profile'" />
    <SettingsTabNotifications v-else-if="activeTab === 'notifications'" />
    <SettingsTabAppearance v-else-if="activeTab === 'appearance'" />
    <SettingsTabSecurity v-else-if="activeTab === 'security'" />
    <SettingsTabWorkspace v-else-if="activeTab === 'workspace'" />
  </LayoutPageContainer>
</template>
