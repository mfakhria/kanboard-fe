<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'

const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const toggleTheme = () => {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>

<template>
  <button
    class="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggleTheme"
  >
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 rotate-[-90deg] scale-0"
      enter-to-class="opacity-100 rotate-0 scale-100"
      leave-active-class="transition duration-150 ease-in absolute"
      leave-from-class="opacity-100 rotate-0 scale-100"
      leave-to-class="opacity-0 rotate-90 scale-0"
      mode="out-in"
    >
      <Moon v-if="!isDark" class="h-5 w-5 text-gray-500 dark:text-gray-400" />
      <Sun v-else class="h-5 w-5 text-yellow-400" />
    </Transition>
  </button>
</template>
