<script setup lang="ts">
import {
  Building2,
  Clock,
  Globe,
  Save,
  Download,
  Trash2,
  CheckCircle2,
} from 'lucide-vue-next'

const workspaceName = ref('Kanzon Workspace')
const timezone = ref('Asia/Jakarta (GMT+7)')
const language = ref('English')
const dateFormat = ref('DD/MM/YYYY')
const autoArchive = ref(true)
const publicTasks = ref(false)
const saved = ref(false)

const handleSave = () => {
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- General -->
    <SettingsSection title="General Settings" description="Configure your workspace preferences.">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingsFormField
          v-model="workspaceName"
          label="Workspace Name"
          :icon="Building2"
        />

        <!-- Timezone -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Timezone</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Clock style="width: 14px; height: 14px;" />
            </div>
            <select
              v-model="timezone"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 appearance-none text-[13.5px]"
            >
              <option>Asia/Jakarta (GMT+7)</option>
              <option>Asia/Singapore (GMT+8)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/London (GMT+0)</option>
              <option>Asia/Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>

        <!-- Language -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Language</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Globe style="width: 14px; height: 14px;" />
            </div>
            <select
              v-model="language"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 appearance-none text-[13.5px]"
            >
              <option>English</option>
              <option>Bahasa Indonesia</option>
            </select>
          </div>
        </div>

        <!-- Date Format -->
        <div class="flex flex-col gap-1.5">
          <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">Date Format</label>
          <div class="relative">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <Clock style="width: 14px; height: 14px;" />
            </div>
            <select
              v-model="dateFormat"
              class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 appearance-none text-[13.5px]"
            >
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Save -->
      <div class="flex items-center justify-end mt-4 gap-3">
        <span v-if="saved" class="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-[12.5px] font-semibold">
          <CheckCircle2 style="width: 14px; height: 14px;" />
          Saved!
        </span>
        <button
          class="px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98] text-[13.5px] font-bold"
          style="background: linear-gradient(135deg, #478FC8, #3570A5); box-shadow: 0 4px 16px rgba(71,143,200,0.3);"
          @click="handleSave"
        >
          <span class="flex items-center gap-2">
            <Save style="width: 14px; height: 14px;" />
            Save Changes
          </span>
        </button>
      </div>
    </SettingsSection>

    <!-- Preferences -->
    <SettingsSection title="Preferences" description="Control default behaviors.">
      <div class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        <div class="flex items-center justify-between py-3 first:pt-0">
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">Auto-Archive Completed Tasks</p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">Automatically archive tasks 7 days after completion</p>
          </div>
          <SettingsToggle :enabled="autoArchive" @toggle="autoArchive = !autoArchive" />
        </div>
        <div class="flex items-center justify-between py-3 last:pb-0">
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">Public Task Visibility</p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">Allow all members to view all tasks by default</p>
          </div>
          <SettingsToggle :enabled="publicTasks" @toggle="publicTasks = !publicTasks" />
        </div>
      </div>
    </SettingsSection>

    <!-- Data Management -->
    <SettingsSection title="Data Management" description="Export or manage your workspace data.">
      <div class="flex flex-col gap-3 sm:flex-row">
        <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-[13px] font-semibold">
          <Download style="width: 14px; height: 14px;" />
          Export Data
        </button>
        <button class="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-[13px] font-semibold">
          <Trash2 style="width: 14px; height: 14px;" />
          Delete Workspace
        </button>
      </div>
    </SettingsSection>
  </div>
</template>
