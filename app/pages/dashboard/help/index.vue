<script setup lang="ts">
import {
  HelpCircle,
  BookOpen,
  Headphones,
} from 'lucide-vue-next'
import type { Component } from 'vue'

definePageMeta({
  layout: 'dashboard',
})

type HelpTab = 'faq' | 'guides' | 'contact'

interface TabItem {
  id: HelpTab
  label: string
  icon: Component
}

const tabItems: TabItem[] = [
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'guides', label: 'Guides', icon: BookOpen },
  { id: 'contact', label: 'Contact Us', icon: Headphones },
]

const activeTab = ref<HelpTab>('faq')
</script>

<template>
  <LayoutPageContainer>
    <!-- Header -->
    <div>
      <div class="flex items-center gap-3 mb-1">
        <div class="w-1 h-8 rounded-full bg-gradient-to-b from-[#478FC8] to-[#3570A5]" />
        <h1 class="text-[clamp(20px,2.5vw,28px)] font-black tracking-tight text-gray-900 dark:text-white leading-tight">
          Help Center
        </h1>
      </div>
      <p class="text-[13.5px] text-gray-500 dark:text-gray-400 pl-4 leading-relaxed">
        Find answers to
        <span class="font-semibold bg-gradient-to-r from-[#478FC8] to-[#6db3e8] bg-clip-text text-transparent">common questions</span>
        and learn how to use Kanzon.
      </p>
    </div>

    <!-- Quick Links -->
    <HelpQuickLinks />

    <!-- Tab Navigation -->
    <div class="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
      <button
        v-for="tab in tabItems"
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
    <HelpTabFaq v-if="activeTab === 'faq'" />
    <HelpTabGuides v-else-if="activeTab === 'guides'" />
    <HelpTabContact v-else-if="activeTab === 'contact'" />
  </LayoutPageContainer>
</template>
