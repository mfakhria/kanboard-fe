<script setup lang="ts">
import {
  Lightbulb,
  BookOpen,
  Zap,
  MessageSquare,
  ExternalLink,
} from 'lucide-vue-next'
import type { Component } from 'vue'

interface QuickLink {
  icon: Component
  label: string
  desc: string
  color: string
  bg: string
  darkBg: string
}

const links: QuickLink[] = [
  { icon: Lightbulb, label: "What's New", desc: 'Latest features & updates', color: '#d97706', bg: '#fffbeb', darkBg: 'rgba(217,119,6,0.15)' },
  { icon: BookOpen, label: 'Documentation', desc: 'Full API & feature docs', color: '#478FC8', bg: '#edf4ff', darkBg: 'rgba(71,143,200,0.15)' },
  { icon: Zap, label: 'Keyboard Shortcuts', desc: 'Speed up your workflow', color: '#7c3aed', bg: '#f5f3ff', darkBg: 'rgba(124,58,237,0.15)' },
  { icon: MessageSquare, label: 'Community Forum', desc: 'Connect with other users', color: '#0891b2', bg: '#ecfeff', darkBg: 'rgba(8,145,178,0.15)' },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
    <div
      v-for="link in links"
      :key="link.label"
      class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        :style="{ background: link.bg }"
      >
        <component :is="link.icon" :style="{ width: '16px', height: '16px', color: link.color }" />
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-[#478FC8] transition-colors">
          {{ link.label }}
        </p>
        <p class="text-gray-400 dark:text-gray-500 truncate text-[11.5px]">
          {{ link.desc }}
        </p>
      </div>
      <ExternalLink class="text-gray-300 dark:text-gray-600 group-hover:text-[#478FC8] transition-colors shrink-0" style="width: 13px; height: 13px;" />
    </div>
  </div>
</template>
