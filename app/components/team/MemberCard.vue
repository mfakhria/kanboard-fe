<script setup lang="ts">
import {
  Crown,
  Shield,
  Star,
  Eye,
  CalendarDays,
  MessageSquare,
  MoreHorizontal,
  Edit2,
  Trash2,
} from 'lucide-vue-next'

interface TeamMemberCard {
  id: string
  name: string
  email: string
  role: string
  rawRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  avatar?: string
  joinedAt: string
  projects?: number
  tasks?: number
  online?: boolean
}

const props = defineProps<{
  member: TeamMemberCard
}>()

const emit = defineEmits<{
  viewProfile: [member: TeamMemberCard]
  editRole: [member: TeamMemberCard]
  remove: [member: TeamMemberCard]
}>()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function closeMenu() {
  menuOpen.value = false
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const accentGradient = computed(() => {
  switch (props.member.rawRole) {
    case 'OWNER': return 'linear-gradient(90deg,#f97316,#fbbf24)'
    case 'ADMIN': return 'linear-gradient(90deg,#478FC8,#5BA3D9)'
    case 'VIEWER': return 'linear-gradient(90deg,#6b7280,#9ca3af)'
    default: return 'linear-gradient(90deg,#6366f1,#a78bfa)'
  }
})

const roleBadge = computed(() => {
  switch (props.member.rawRole) {
    case 'OWNER': return { bg: 'bg-amber-50 border border-amber-200 dark:bg-amber-500/15 dark:border-amber-400/30', text: 'text-amber-700 dark:text-amber-300', icon: Crown }
    case 'ADMIN': return { bg: 'bg-blue-50 border border-blue-200 dark:bg-blue-500/15 dark:border-blue-400/30', text: 'text-blue-700 dark:text-blue-300', icon: Shield }
    case 'VIEWER': return { bg: 'bg-gray-50 border border-gray-200 dark:bg-slate-500/15 dark:border-slate-400/30', text: 'text-gray-600 dark:text-slate-300', icon: Eye }
    default: return { bg: 'bg-indigo-50 border border-indigo-200 dark:bg-indigo-500/15 dark:border-indigo-400/30', text: 'text-indigo-700 dark:text-indigo-300', icon: Star }
  }
})

const avatarBg = computed(() => {
  switch (props.member.rawRole) {
    case 'OWNER': return 'linear-gradient(135deg,#f97316,#fb923c)'
    case 'ADMIN': return 'linear-gradient(135deg,#478FC8,#5BA3D9)'
    case 'VIEWER': return 'linear-gradient(135deg,#6b7280,#9ca3af)'
    default: return 'linear-gradient(135deg,#6366f1,#818cf8)'
  }
})

const initials = computed(() => {
  return props.member.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-black/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group flex flex-col"
  >
    <!-- Top accent bar -->
    <div class="h-1 w-full" :style="{ background: accentGradient }" />

    <div class="flex flex-col items-center pt-8 pb-6 px-6 gap-3 flex-1">
      <!-- Avatar -->
      <div class="relative">
        <div
          v-if="member.avatar"
          class="w-16 h-16 rounded-2xl overflow-hidden shadow-md flex-shrink-0"
        >
          <img :src="member.avatar" :alt="member.name" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="w-16 h-16 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md"
          :style="{ background: avatarBg, fontSize: '20px', fontWeight: 800 }"
        >
          {{ initials }}
        </div>
        <!-- Online dot -->
        <div
          :class="[
            'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900',
            member.online ? 'bg-green-400' : 'bg-gray-300',
          ]"
        />
      </div>

      <!-- Name + role + email -->
      <div class="flex flex-col items-center gap-1.5">
        <p
          class="text-gray-900 dark:text-gray-100 text-center"
          style="font-size: 15px; font-weight: 700; letter-spacing: -0.3px"
        >
          {{ member.name }}
        </p>
        <span
          :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full', roleBadge.bg, roleBadge.text]"
          style="font-size: 11px; font-weight: 700"
        >
          <component :is="roleBadge.icon" :size="10" />
          {{ member.role }}
        </span>
        <p class="text-gray-400 dark:text-gray-500" style="font-size: 12.5px">
          {{ member.email }}
        </p>
      </div>

      <!-- Stats row -->
      <div class="w-full flex items-center divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50 dark:bg-gray-800/70 rounded-xl mt-1">
        <div class="flex-1 flex flex-col items-center py-3">
          <p class="text-gray-900 dark:text-gray-100" style="font-size: 16px; font-weight: 800">
            {{ member.projects ?? 0 }}
          </p>
          <p class="text-gray-400 dark:text-gray-500" style="font-size: 11px; font-weight: 500">
            Projects
          </p>
        </div>
        <div class="flex-1 flex flex-col items-center py-3">
          <p class="text-gray-900 dark:text-gray-100" style="font-size: 16px; font-weight: 800">
            {{ member.tasks ?? 0 }}
          </p>
          <p class="text-gray-400 dark:text-gray-500" style="font-size: 11px; font-weight: 500">
            Tasks
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between px-5 py-3.5 border-t border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
        <CalendarDays :size="12" />
        <span style="font-size: 11.5px">Joined {{ formatDate(member.joinedAt) }}</span>
      </div>

      <div class="flex items-center gap-1">
        <!-- Message -->
        <button
          class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-500/15 hover:text-[#478FC8] dark:hover:text-blue-300 transition-all"
        >
          <MessageSquare :size="13" />
        </button>
        <!-- More menu -->
        <div ref="menuRef" class="relative">
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
            @click.stop="menuOpen = !menuOpen"
          >
            <MoreHorizontal :size="13" />
          </button>
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="menuOpen"
              class="absolute right-0 bottom-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl shadow-gray-100/80 dark:shadow-black/40 py-1.5 z-20 min-w-[130px]"
            >
              <button
                v-if="member.rawRole !== 'OWNER'"
                class="w-full flex items-center gap-2.5 px-3.5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                style="font-size: 13px"
                @click="emit('editRole', member); closeMenu()"
              >
                <Edit2 :size="12" />
                Edit role
              </button>
              <button
                v-if="member.rawRole !== 'OWNER'"
                class="w-full flex items-center gap-2.5 px-3.5 py-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors"
                style="font-size: 13px"
                @click="emit('remove', member); closeMenu()"
              >
                <Trash2 :size="12" />
                Remove
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
