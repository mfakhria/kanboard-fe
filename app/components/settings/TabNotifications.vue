<script setup lang="ts">
import {
  Mail,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FolderKanban,
  Users,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { NotificationPreferences } from '~/features/notification/types'

interface NotifItem {
  icon: Component
  iconColor: string
  iconBg: string
  darkIconBg: string
  title: string
  description: string
  key: keyof NotificationPreferences
}

const notificationStore = useNotificationStore()

const channelItems: NotifItem[] = [
  { icon: Mail, iconColor: '#478FC8', iconBg: '#edf4ff', darkIconBg: 'rgba(71,143,200,0.15)', title: 'Email Notifications', description: 'Get notified via email for important updates', key: 'emailEnabled' },
  { icon: Bell, iconColor: '#7c3aed', iconBg: '#f5f3ff', darkIconBg: 'rgba(124,58,237,0.15)', title: 'Push Notifications', description: 'Receive browser push notifications', key: 'pushEnabled' },
]

const activityItems: NotifItem[] = [
  { icon: CheckCircle2, iconColor: '#16a34a', iconBg: '#f0fdf4', darkIconBg: 'rgba(22,163,106,0.15)', title: 'Task Assigned', description: 'When a task is assigned to you', key: 'taskAssigned' },
  { icon: CheckCircle2, iconColor: '#478FC8', iconBg: '#edf4ff', darkIconBg: 'rgba(71,143,200,0.15)', title: 'Task Completed', description: 'When a task you\'re involved with is completed', key: 'taskCompleted' },
  { icon: AlertTriangle, iconColor: '#ea580c', iconBg: '#fff7ed', darkIconBg: 'rgba(234,88,12,0.15)', title: 'Task Overdue', description: 'When a task passes its due date', key: 'taskOverdue' },
  { icon: FolderKanban, iconColor: '#0891b2', iconBg: '#ecfeff', darkIconBg: 'rgba(8,145,178,0.15)', title: 'Project Updates', description: 'When project status or details change', key: 'projectUpdates' },
  { icon: Users, iconColor: '#7c3aed', iconBg: '#f5f3ff', darkIconBg: 'rgba(124,58,237,0.15)', title: 'Team Activity', description: 'When team members join or leave', key: 'teamActivity' },
  { icon: Clock, iconColor: '#d97706', iconBg: '#fffbeb', darkIconBg: 'rgba(217,119,6,0.15)', title: 'Weekly Digest', description: 'Receive a weekly summary of your projects', key: 'weeklyDigest' },
]

onMounted(async () => {
  if (!notificationStore.preferences) {
    await notificationStore.fetchPreferences()
  }
})

function isEnabled(key: keyof NotificationPreferences) {
  return !!notificationStore.preferences?.[key]
}

async function handleToggle(key: keyof NotificationPreferences) {
  const currentValue = isEnabled(key)
  await notificationStore.updatePreference(key, !currentValue)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Channels -->
    <SettingsSection title="Notification Channels" description="Choose how you want to receive notifications.">
      <div class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        <div v-for="item in channelItems" :key="item.key" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: item.iconBg }"
            >
              <component :is="item.icon" :style="{ width: '15px', height: '15px', color: item.iconColor }" />
            </div>
            <div>
              <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">{{ item.title }}</p>
              <p class="text-gray-400 dark:text-gray-500 text-[12px]">{{ item.description }}</p>
            </div>
          </div>
          <SettingsToggle :enabled="isEnabled(item.key)" @toggle="handleToggle(item.key)" />
        </div>
      </div>
    </SettingsSection>

    <!-- Activity -->
    <SettingsSection title="Activity Notifications" description="Fine-tune which activities trigger notifications.">
      <div class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        <div v-for="item in activityItems" :key="item.key" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div class="flex items-center gap-3">
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: item.iconBg }"
            >
              <component :is="item.icon" :style="{ width: '15px', height: '15px', color: item.iconColor }" />
            </div>
            <div>
              <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">{{ item.title }}</p>
              <p class="text-gray-400 dark:text-gray-500 text-[12px]">{{ item.description }}</p>
            </div>
          </div>
          <SettingsToggle :enabled="isEnabled(item.key)" @toggle="handleToggle(item.key)" />
        </div>
      </div>
    </SettingsSection>
  </div>
</template>
