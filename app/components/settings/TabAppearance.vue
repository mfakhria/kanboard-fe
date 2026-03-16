<script setup lang="ts">
import { Sun, Moon, Monitor, Check } from 'lucide-vue-next'
import type { Component } from 'vue'

const colorMode = useColorMode()

const theme = computed(() => {
  if (colorMode.preference === 'system') return 'system'
  return colorMode.value === 'dark' ? 'dark' : 'light'
})

function setTheme(value: 'light' | 'dark' | 'system') {
  colorMode.preference = value
}

const accentColor = ref('#478FC8')
const compactMode = ref(false)
const animations = ref(true)

interface ThemeOption {
  id: 'light' | 'dark' | 'system'
  label: string
  icon: Component
  desc: string
}

const themes: ThemeOption[] = [
  { id: 'light', label: 'Light', icon: Sun, desc: 'Clean light interface' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Easy on the eyes' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Match OS settings' },
]

const colors = [
  { value: '#478FC8', label: 'Blue' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f97316', label: 'Orange' },
  { value: '#22c55e', label: 'Green' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#f43f5e', label: 'Rose' },
]
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- Theme -->
    <SettingsSection title="Theme" description="Customize the look and feel of your team.">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="t in themes"
          :key="t.id"
          class="flex flex-col items-center gap-2.5 py-5 px-4 rounded-xl border-2 transition-all duration-200"
          :class="theme === t.id
            ? 'border-[#478FC8] bg-[#edf4ff]/50 dark:bg-[#478FC8]/10'
            : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
          "
          @click="setTheme(t.id)"
        >
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center"
            :class="theme === t.id ? 'text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'"
            :style="theme === t.id ? { background: 'linear-gradient(135deg, #478FC8, #3570A5)', boxShadow: '0 4px 12px rgba(71,143,200,0.3)' } : {}"
          >
            <component :is="t.icon" style="width: 18px; height: 18px;" />
          </div>
          <div class="text-center">
            <p
              class="text-[13.5px]"
              :style="{ fontWeight: theme === t.id ? 700 : 600, color: theme === t.id ? '#2d6da3' : undefined }"
              :class="theme !== t.id ? 'text-gray-700 dark:text-gray-300' : ''"
            >
              {{ t.label }}
            </p>
            <p class="text-gray-400 dark:text-gray-500 mt-0.5 text-[11px]">{{ t.desc }}</p>
          </div>
          <div
            v-if="theme === t.id"
            class="w-5 h-5 rounded-full flex items-center justify-center text-white"
            style="background: linear-gradient(135deg, #478FC8, #3570A5);"
          >
            <Check style="width: 11px; height: 11px;" />
          </div>
        </button>
      </div>
    </SettingsSection>

    <!-- Accent Color -->
    <SettingsSection title="Accent Color" description="Choose a color that represents your brand.">
      <div class="flex items-center gap-3 flex-wrap">
        <button
          v-for="c in colors"
          :key="c.value"
          class="w-10 h-10 rounded-xl transition-all duration-200 flex items-center justify-center"
          :class="accentColor === c.value ? 'ring-2 ring-offset-2 dark:ring-offset-gray-900 scale-110' : 'hover:scale-105'"
          :style="{
            background: c.value,
            '--tw-ring-color': accentColor === c.value ? c.value : undefined,
            boxShadow: accentColor === c.value ? `0 4px 12px ${c.value}44` : 'none',
          }"
          :title="c.label"
          @click="accentColor = c.value"
        >
          <Check v-if="accentColor === c.value" style="width: 14px; height: 14px; color: #fff;" />
        </button>
      </div>
    </SettingsSection>

    <!-- Display -->
    <SettingsSection title="Display" description="Adjust display preferences.">
      <div class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800">
        <div class="flex items-center justify-between py-3 first:pt-0">
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">Compact Mode</p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">Reduce spacing for a denser layout</p>
          </div>
          <SettingsToggle :enabled="compactMode" @toggle="compactMode = !compactMode" />
        </div>
        <div class="flex items-center justify-between py-3 last:pb-0">
          <div>
            <p class="text-[13.5px] font-semibold text-gray-900 dark:text-white">Animations</p>
            <p class="text-gray-400 dark:text-gray-500 text-[12px]">Enable smooth transitions and animations</p>
          </div>
          <SettingsToggle :enabled="animations" @toggle="animations = !animations" />
        </div>
      </div>
    </SettingsSection>
  </div>
</template>
