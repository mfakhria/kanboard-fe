<script setup lang="ts">
import {
  Users,
  Plus,
  FolderKanban,
  Crown,
  ChevronRight,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
})

const workspaceStore = useWorkspaceStore()

const showCreateTeam = ref(false)
const newTeamName = ref('')
const newTeamDescription = ref('')
const isCreating = ref(false)

onMounted(async () => {
  if (!workspaceStore.allWorkspaces.length) {
    await workspaceStore.fetchWorkspaces()
  }
})

const teams = computed(() => workspaceStore.allWorkspaces)

function getWorkspaceColor(workspaceId: string) {
  if (import.meta.server) return 'linear-gradient(135deg, #3570A5, #478FC8)'
  return localStorage.getItem(`workspace:color:${workspaceId}`) || 'linear-gradient(135deg, #3570A5, #478FC8)'
}

function getWorkspacePhoto(workspaceId: string) {
  if (import.meta.server) return ''
  return localStorage.getItem(`workspace:photo:${workspaceId}`) || ''
}

function getOwnerName(ws: any): string {
  const owner = ws.members?.find((m: any) => m.role === 'OWNER')
  return owner?.user?.name ?? '-'
}

async function handleCreateTeam() {
  if (!newTeamName.value.trim()) return
  isCreating.value = true
  try {
    await workspaceStore.createWorkspace({
      name: newTeamName.value.trim(),
      description: newTeamDescription.value.trim() || undefined,
    })
    newTeamName.value = ''
    newTeamDescription.value = ''
    showCreateTeam.value = false
  } catch {
    // Error handled in store
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <LayoutPageContainer>
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <div
              class="w-1 h-8 rounded-full"
              style="background: linear-gradient(to bottom, #478FC8, #3570A5)"
            />
            <h1
              class="text-gray-900 dark:text-white"
              style="font-size: clamp(20px, 2.5vw, 28px); font-weight: 900; letter-spacing: -0.8px; line-height: 1.15"
            >
              Teams
            </h1>
          </div>
          <p class="pl-4 text-gray-500 dark:text-gray-400" style="font-size: 13.5px; line-height: 1.6">
            Manage your
            <span
              style="font-weight: 600; background: linear-gradient(90deg, #478FC8, #5BA3D9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text"
            >teams</span>
            and collaborate with members.
          </p>
        </div>

        <button
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 13.5px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.30)"
          @click="showCreateTeam = true"
        >
          <Plus :size="15" />
          Create Team
        </button>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #dbeafe, #eff6ff)">
            <Users :size="20" class="text-[#478FC8]" />
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500" style="font-size: 12.5px; font-weight: 500">Total Teams</p>
            <p class="text-gray-900 dark:text-gray-100" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ teams.length }}
            </p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #ede9fe, #f5f3ff)">
            <FolderKanban :size="20" class="text-purple-600" />
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500" style="font-size: 12.5px; font-weight: 500">Total Projects</p>
            <p class="text-gray-900 dark:text-gray-100" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ teams.reduce((sum, t) => sum + (t._count?.projects ?? 0), 0) }}
            </p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-6 py-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style="background: linear-gradient(135deg, #d1fae5, #ecfdf5)">
            <Users :size="20" class="text-emerald-600" />
          </div>
          <div>
            <p class="text-gray-400 dark:text-gray-500" style="font-size: 12.5px; font-weight: 500">Total Members</p>
            <p class="text-gray-900 dark:text-gray-100" style="font-size: 26px; font-weight: 800; letter-spacing: -0.8px; line-height: 1.2">
              {{ teams.reduce((sum, t) => sum + (t.members?.length ?? 0), 0) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Team cards grid -->
      <div
        v-if="teams.length > 0"
        class="grid gap-4"
        style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))"
      >
        <NuxtLink
          v-for="ws in teams"
          :key="ws.id"
          :to="`/team/${ws.id}`"
          class="group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[#478FC8]/30 transition-all"
        >
          <!-- Team name + arrow -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <img
                v-if="getWorkspacePhoto(ws.id)"
                :src="getWorkspacePhoto(ws.id)"
                :alt="ws.name"
                class="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
              >
              <div
                v-else
                class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                :style="{ background: getWorkspaceColor(ws.id), fontSize: '16px' }"
              >
                {{ ws.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <h3
                  class="text-gray-900 dark:text-white group-hover:text-[#478FC8] transition-colors"
                  style="font-size: 15px; font-weight: 700; letter-spacing: -0.3px"
                >
                  {{ ws.name }}
                </h3>
                <p
                  v-if="ws.description"
                  class="text-gray-400 dark:text-gray-500 line-clamp-1"
                  style="font-size: 12px; margin-top: 1px"
                >
                  {{ ws.description }}
                </p>
              </div>
            </div>
            <ChevronRight
              :size="16"
              class="text-gray-300 dark:text-gray-600 group-hover:text-[#478FC8] group-hover:translate-x-0.5 transition-all mt-1"
            />
          </div>

          <!-- Stats row -->
          <div class="flex items-center gap-4 pt-3 border-t border-gray-50 dark:border-gray-800">
            <div class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <Users :size="13" />
              <span style="font-size: 12.5px; font-weight: 500">{{ ws.members?.length ?? 0 }} members</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
              <FolderKanban :size="13" />
              <span style="font-size: 12.5px; font-weight: 500">{{ ws._count?.projects ?? 0 }} projects</span>
            </div>
          </div>

          <!-- Owner -->
          <div class="flex items-center gap-1.5 mt-2.5 text-gray-400 dark:text-gray-500">
            <Crown :size="12" />
            <span style="font-size: 11.5px; font-weight: 500">Owner: {{ getOwnerName(ws) }}</span>
          </div>
        </NuxtLink>

        <!-- Create team placeholder card -->
        <button
          class="bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center gap-3 py-12 px-6 text-gray-400 dark:text-gray-500 hover:border-[#478FC8]/50 hover:text-[#478FC8] hover:bg-[#478FC8]/5 dark:hover:bg-[#478FC8]/10 transition-all group"
          @click="showCreateTeam = true"
        >
          <div class="w-12 h-12 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-[#478FC8]/50 flex items-center justify-center transition-all">
            <Plus :size="20" />
          </div>
          <span style="font-size: 13.5px; font-weight: 600">Create new team</span>
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 gap-3"
      >
        <Users :size="36" style="opacity: 0.4" />
        <p style="font-size: 15px; font-weight: 600">No teams yet</p>
        <p style="font-size: 13px">Create your first team to get started.</p>
        <button
          class="mt-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 13.5px; font-weight: 700"
          @click="showCreateTeam = true"
        >
          <Plus :size="15" />
          Create Team
        </button>
      </div>
    </div>

    <!-- Create Team Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showCreateTeam" class="fixed inset-0 z-50 flex items-center justify-center">
          <div class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" @click="showCreateTeam = false" />

          <div
            class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full mx-4 flex flex-col gap-6 p-7"
            style="max-width: 420px"
          >
            <div class="flex flex-col gap-1">
              <h2 class="text-gray-900 dark:text-gray-100" style="font-size: 18px; font-weight: 800; letter-spacing: -0.4px">
                Create Team
              </h2>
              <p class="text-gray-400 dark:text-gray-500" style="font-size: 13.5px">
                Set up a new team to collaborate on projects.
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Team name</label>
              <input
                v-model="newTeamName"
                type="text"
                placeholder="e.g. Engineering Team"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-[#478FC8]/10 transition-all"
                style="font-size: 13.5px"
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-gray-600 dark:text-gray-300" style="font-size: 13px; font-weight: 600">Description <span class="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                v-model="newTeamDescription"
                rows="3"
                placeholder="What does this team work on?"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-[#478FC8]/10 transition-all resize-none"
                style="font-size: 13.5px"
              />
            </div>

            <div class="flex items-center gap-3">
              <button
                class="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                style="font-size: 14px; font-weight: 600"
                @click="showCreateTeam = false"
              >
                Cancel
              </button>
              <button
                :disabled="isCreating || !newTeamName.trim()"
                :class="[
                  'flex-1 py-3 rounded-xl text-white transition-all hover:opacity-90 active:scale-[0.98]',
                  isCreating || !newTeamName.trim() ? 'opacity-70 cursor-not-allowed' : '',
                ]"
                style="background: linear-gradient(135deg, #3570A5, #478FC8); font-size: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(71,143,200,0.35)"
                @click="handleCreateTeam"
              >
                {{ isCreating ? 'Creating...' : 'Create Team' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </LayoutPageContainer>
</template>
