<script setup lang="ts">
import { computed } from 'vue'
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
  name?: string
  size?: number
  class?: string
}>(), {
  name: 'FolderKanban',
  size: 20,
})

const iconMap: Record<string, Component> = {
  FolderKanban, Briefcase, Code, Palette, Globe, Rocket, Target,
  ShoppingCart, BookOpen, GraduationCap, Heart, Music, Camera, Film,
  Gamepad2, Cpu, Database, Server, Cloud, Shield, Lock,
  BarChart3, PieChart, TrendingUp, Megaphone, Mail, MessageSquare,
  Users, Building2, Landmark, Plane, Car, Truck, Package,
  Lightbulb, Wrench, Settings, Compass, Map, Flag, Star,
  Zap, Flame, Leaf, Sun, Moon, Coffee, Headphones, Smartphone,
}

const icon = computed(() => iconMap[props.name] || FolderKanban)
</script>

<template>
  <component :is="icon" :size="size" :class="$props.class" />
</template>
