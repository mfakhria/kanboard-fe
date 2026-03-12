<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FolderKanban, Briefcase, Code, Palette, Globe, Rocket, Target,
  ShoppingCart, BookOpen, GraduationCap, Heart, Music, Camera, Film,
  Gamepad2, Cpu, Database, Server, Cloud, Shield, Lock,
  BarChart3, PieChart, TrendingUp, Megaphone, Mail, MessageSquare,
  Users, Building2, Landmark, Plane, Car, Truck, Package,
  Lightbulb, Wrench, Settings, Compass, Map, Flag, Star,
  Zap, Flame, Leaf, Sun, Moon, Coffee, Headphones, Smartphone,
} from 'lucide-vue-next'
import type { Component } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
}>(), {
  modelValue: 'FolderKanban',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showPicker = ref(false)
const searchQuery = ref('')

const iconMap: Record<string, Component> = {
  FolderKanban, Briefcase, Code, Palette, Globe, Rocket, Target,
  ShoppingCart, BookOpen, GraduationCap, Heart, Music, Camera, Film,
  Gamepad2, Cpu, Database, Server, Cloud, Shield, Lock,
  BarChart3, PieChart, TrendingUp, Megaphone, Mail, MessageSquare,
  Users, Building2, Landmark, Plane, Car, Truck, Package,
  Lightbulb, Wrench, Settings, Compass, Map, Flag, Star,
  Zap, Flame, Leaf, Sun, Moon, Coffee, Headphones, Smartphone,
}

const iconNames = Object.keys(iconMap)

const filteredIcons = computed(() => {
  if (!searchQuery.value) return iconNames
  const q = searchQuery.value.toLowerCase()
  return iconNames.filter(name => name.toLowerCase().includes(q))
})

const selectedIcon = computed(() => iconMap[props.modelValue] || iconMap['FolderKanban'])

function selectIcon(name: string) {
  emit('update:modelValue', name)
  showPicker.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="relative">
    <!-- Trigger button -->
    <button
      type="button"
      class="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      @click="showPicker = !showPicker"
    >
      <component :is="selectedIcon" class="h-5 w-5 text-gray-700 dark:text-gray-300" />
      <span class="text-gray-700 dark:text-gray-300">{{ modelValue || 'FolderKanban' }}</span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showPicker"
        class="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border bg-background p-3 shadow-lg"
      >
        <!-- Search -->
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search icons..."
          class="mb-2 flex h-8 w-full rounded-md border border-input bg-transparent px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <!-- Icon grid -->
        <div class="grid max-h-48 grid-cols-6 gap-1 overflow-y-auto">
          <button
            v-for="name in filteredIcons"
            :key="name"
            type="button"
            :title="name"
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
              modelValue === name
                ? 'bg-[#478FC8] text-white'
                : 'hover:bg-accent text-gray-600 dark:text-gray-400'
            ]"
            @click="selectIcon(name)"
          >
            <component :is="iconMap[name]" class="h-4.5 w-4.5" />
          </button>
        </div>
        <p v-if="filteredIcons.length === 0" class="py-3 text-center text-xs text-muted-foreground">No icons found</p>
      </div>
    </Transition>

    <!-- Backdrop to close -->
    <div v-if="showPicker" class="fixed inset-0 z-40" @click="showPicker = false" />
  </div>
</template>
