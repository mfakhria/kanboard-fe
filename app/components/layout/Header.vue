<script setup lang="ts">
import { Search, Mail, Bell, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'

const authStore = useAuthStore()

const props = withDefaults(defineProps<{
  sidebarCollapsed?: boolean
}>(), {
  sidebarCollapsed: false,
})

const emit = defineEmits<{
  toggleSidebar: []
  toggleCollapse: []
}>()

const searchQuery = ref('')
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white dark:bg-gray-900 px-4 lg:px-8">
    <!-- Left section: toggle + search -->
    <div class="flex items-center gap-2 flex-1">
      <!-- Mobile menu button -->
      <button class="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800" @click="emit('toggleSidebar')">
        <Menu class="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>

      <!-- Desktop sidebar toggle -->
      <button
        class="hidden lg:flex rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        @click="emit('toggleCollapse')"
        :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <PanelLeftOpen v-if="sidebarCollapsed" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <PanelLeftClose v-else class="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>

      <!-- Search bar -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search task"
          class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2 pl-10 pr-12 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-lime-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-lime-500"
        />
        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded border dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5">
          <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">⌘ F</span>
        </div>
      </div>
    </div>

    <!-- Right section -->
    <div class="flex items-center gap-3 ml-4">
      <!-- Theme Toggle -->
      <UiThemeToggle />

      <!-- Mail -->
      <button class="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <Mail class="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>

      <!-- Notifications -->
      <button class="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <Bell class="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
      </button>

      <!-- Profile -->
      <div class="flex items-center gap-3 ml-2 pl-3 border-l dark:border-gray-700">
        <div class="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center overflow-hidden">
          <span class="text-sm font-bold text-white">TM</span>
        </div>
        <div class="hidden sm:block">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ authStore.currentUser?.name || 'Totok Michael' }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400">{{ authStore.currentUser?.email || 'tmichael20@mail.com' }}</p>
        </div>
      </div>
    </div>
  </header>
</template>
