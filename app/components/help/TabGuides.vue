<script setup lang="ts">
import {
  Rocket,
  LayoutDashboard,
  Users,
  BarChart3,
  CalendarDays,
  Settings,
  FileText,
  Video,
  ArrowRight,
} from 'lucide-vue-next'
import type { Component } from 'vue'

interface Guide {
  id: string
  title: string
  description: string
  icon: Component
  iconColor: string
  iconBg: string
  type: 'Article' | 'Video'
  readTime: string
}

const guides: Guide[] = [
  {
    id: 'g1',
    title: 'Quick Start Guide',
    description: 'Get up and running with Kanzon in under 5 minutes. Learn the basics of creating projects and tasks.',
    icon: Rocket,
    iconColor: '#478FC8',
    iconBg: 'linear-gradient(135deg, #edf4ff, #dbeafe)',
    type: 'Article',
    readTime: '5 min read',
  },
  {
    id: 'g2',
    title: 'Mastering the Kanban Board',
    description: 'Deep dive into drag-and-drop workflows, custom columns, and advanced board configurations.',
    icon: LayoutDashboard,
    iconColor: '#7c3aed',
    iconBg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    type: 'Video',
    readTime: '8 min watch',
  },
  {
    id: 'g3',
    title: 'Team Collaboration Best Practices',
    description: 'Learn how to effectively manage roles, assign tasks, and keep your team aligned and productive.',
    icon: Users,
    iconColor: '#0891b2',
    iconBg: 'linear-gradient(135deg, #ecfeff, #cffafe)',
    type: 'Article',
    readTime: '6 min read',
  },
  {
    id: 'g4',
    title: 'Using Analytics to Boost Productivity',
    description: "Understand your team's performance metrics and use data to make better project decisions.",
    icon: BarChart3,
    iconColor: '#ea580c',
    iconBg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    type: 'Article',
    readTime: '4 min read',
  },
  {
    id: 'g5',
    title: 'Calendar & Deadline Management',
    description: 'Master the calendar view, set smart deadlines, and never miss an important milestone.',
    icon: CalendarDays,
    iconColor: '#16a34a',
    iconBg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    type: 'Video',
    readTime: '7 min watch',
  },
  {
    id: 'g6',
    title: 'Workspace Settings & Customization',
    description: 'Configure your workspace theme, notifications, security preferences, and team settings.',
    icon: Settings,
    iconColor: '#64748b',
    iconBg: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
    type: 'Article',
    readTime: '3 min read',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
    <div
      v-for="guide in guides"
      :key="guide.id"
      class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col cursor-pointer"
    >
      <!-- Accent bar -->
      <div class="h-1 w-full" :style="{ background: guide.iconBg }" />

      <div class="flex flex-col gap-3 p-5 flex-1">
        <!-- Icon + type badge -->
        <div class="flex items-center justify-between">
          <div
            class="w-11 h-11 rounded-xl flex items-center justify-center"
            :style="{ background: guide.iconBg }"
          >
            <component :is="guide.icon" :style="{ width: '18px', height: '18px', color: guide.iconColor }" />
          </div>
          <div class="flex items-center gap-1.5">
            <Video v-if="guide.type === 'Video'" style="width: 11px; height: 11px; color: #7c3aed;" />
            <FileText v-else style="width: 11px; height: 11px; color: #478FC8;" />
            <span
              class="px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="guide.type === 'Video'
                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                : 'bg-[#edf4ff] dark:bg-[#478FC8]/15 text-[#478FC8] border border-[#478FC8]/20'
              "
            >
              {{ guide.type }}
            </span>
          </div>
        </div>

        <!-- Title + desc -->
        <div>
          <h3 class="text-[14.5px] font-bold text-gray-900 dark:text-white group-hover:text-[#478FC8] transition-colors tracking-tight">
            {{ guide.title }}
          </h3>
          <p class="text-gray-400 dark:text-gray-500 mt-1 text-[12.5px] leading-relaxed">
            {{ guide.description }}
          </p>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-auto pt-2">
          <span class="text-gray-400 dark:text-gray-500 text-[11.5px]">
            {{ guide.readTime }}
          </span>
          <span class="flex items-center gap-1 text-[#478FC8] opacity-0 group-hover:opacity-100 transition-opacity text-[12px] font-semibold">
            Read more
            <ArrowRight style="width: 11px; height: 11px;" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
