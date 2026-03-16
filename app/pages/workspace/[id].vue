<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()
const authStore = useAuthStore()

const workspaceId = computed(() => String(route.params.id || ''))

const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref(false)
const saveError = ref('')

const form = reactive({
  name: '',
  description: '',
  photoUrl: '',
})

function showWorkspaceAccessDenied() {
  if (!import.meta.client) return
  window.dispatchEvent(new CustomEvent('app:error-alert', {
    detail: { message: 'You have not been invited to this workspace.' },
  }))
}

function hasWorkspaceAccess(id: string) {
  const userId = authStore.currentUser?.id
  if (!userId) return false

  return workspaceStore.allWorkspaces.some((workspace: any) => {
    if (workspace?.id !== id) return false
    if (workspace?.ownerId === userId) return true
    return (workspace?.members ?? []).some((member: any) => member?.user?.id === userId)
  })
}

const photoStorageKey = computed(() => `workspace:photo:${workspaceId.value}`)

const workspace = computed(() => {
  return workspaceStore.allWorkspaces.find(w => w.id === workspaceId.value) ?? workspaceStore.activeWorkspace
})

const initials = computed(() => {
  const name = form.name.trim()
  if (!name) return 'T'
  const parts = name.split(/\s+/)
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '') || name.slice(0, 1)
})

function loadLocalPhoto() {
  if (import.meta.server) return
  form.photoUrl = localStorage.getItem(photoStorageKey.value) || ''
}

function saveLocalPhoto() {
  if (import.meta.server) return
  const value = form.photoUrl.trim()
  if (value) {
    localStorage.setItem(photoStorageKey.value, value)
  } else {
    localStorage.removeItem(photoStorageKey.value)
  }
}

function hydrateForm() {
  const data = workspace.value
  if (!data) return
  form.name = data.name
  form.description = data.description || ''
  loadLocalPhoto()
}

async function loadWorkspace() {
  if (!workspaceId.value) return
  isLoading.value = true
  try {
    if (!workspaceStore.allWorkspaces.length) {
      await workspaceStore.fetchWorkspaces()
    }

    if (!hasWorkspaceAccess(workspaceId.value)) {
      showWorkspaceAccessDenied()
      await router.replace('/team')
      return
    }

    await workspaceStore.fetchWorkspaceById(workspaceId.value)

    if (workspaceStore.activeWorkspace?.id !== workspaceId.value) {
      showWorkspaceAccessDenied()
      await router.replace('/team')
      return
    }

    hydrateForm()
  } finally {
    isLoading.value = false
  }
}

async function handleSave() {
  if (!workspaceId.value || !form.name.trim()) return
  saveError.value = ''
  isSaving.value = true
  try {
    await workspaceStore.updateWorkspace(workspaceId.value, {
      name: form.name.trim(),
      description: form.description.trim(),
    })
    saveLocalPhoto()
  } catch (error: any) {
    const status = error?.response?.status
    const message = error?.response?.data?.message
    if (status === 403) {
      saveError.value = Array.isArray(message)
        ? String(message[0] || 'You cannot edit another user\'s workspace.')
        : String(message || 'You cannot edit another user\'s workspace.')
    } else {
      saveError.value = 'Failed to save workspace changes. Please try again.'
    }
  } finally {
    isSaving.value = false
  }
}

function resetForm() {
  hydrateForm()
}

async function handleDelete() {
  if (!workspaceId.value) return
  const confirmed = globalThis.confirm('Delete this workspace/team? This action cannot be undone.')
  if (!confirmed) return

  isDeleting.value = true
  try {
    await workspaceStore.deleteWorkspace(workspaceId.value)
    router.push('/dashboard')
  } finally {
    isDeleting.value = false
  }
}

watch(
  () => workspaceId.value,
  async () => {
    await loadWorkspace()
  },
  { immediate: true },
)

watch(
  () => workspace.value,
  () => {
    if (!isSaving.value) hydrateForm()
  },
)
</script>

<template>
  <LayoutPageContainer>
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-gray-900 dark:text-white">Edit Team</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Update workspace name, photo, and description.</p>
        </div>
      </div>

      <div v-if="isLoading" class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-sm text-gray-500 dark:text-gray-400">
        Loading workspace...
      </div>

      <div v-else-if="!workspace" class="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 p-6 text-sm text-red-600 dark:text-red-300">
        Workspace not found or you do not have access.
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div class="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Team Preview</p>
          <div class="mt-4 flex flex-col items-center text-center">
            <div class="relative">
              <img
                v-if="form.photoUrl"
                :src="form.photoUrl"
                alt="Team photo"
                class="h-20 w-20 rounded-2xl object-cover border border-gray-200 dark:border-gray-700"
              >
              <div
                v-else
                class="h-20 w-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl"
                style="background: linear-gradient(135deg, #478FC8 0%, #3570A5 100%);"
              >
                {{ initials.toUpperCase() }}
              </div>
            </div>
            <p class="mt-3 text-base font-bold text-gray-900 dark:text-white">{{ form.name || 'Workspace Name' }}</p>
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {{ workspace.members.length }} member{{ workspace.members.length !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>

        <form class="lg:col-span-2 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4" @submit.prevent="handleSave">
          <div>
            <UiLabel for="ws-name">Workspace Name</UiLabel>
            <UiInput id="ws-name" v-model="form.name" placeholder="e.g. Product Team" class="mt-1.5" />
          </div>

          <div>
            <UiLabel for="ws-photo">Team Photo URL</UiLabel>
            <UiInput id="ws-photo" v-model="form.photoUrl" placeholder="https://example.com/team-image.jpg" class="mt-1.5" />
            <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">Photo is saved locally on this browser per workspace.</p>
          </div>

          <div>
            <UiLabel for="ws-desc">Description</UiLabel>
            <UiTextarea id="ws-desc" v-model="form.description" class="mt-1.5" rows="4" placeholder="What this team is working on..." />
          </div>

          <div class="flex items-center justify-between gap-3 pt-2 flex-wrap">
            <UiButton
              variant="destructive"
              type="button"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              {{ isDeleting ? 'Deleting...' : 'Delete Team' }}
            </UiButton>

            <div class="flex items-center gap-3">
              <UiButton type="button" variant="outline" @click="resetForm">Reset</UiButton>
              <UiButton
                type="submit"
                class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white"
                :disabled="isSaving || !form.name.trim()"
              >
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </UiButton>
            </div>
          </div>

          <p v-if="saveError" class="text-sm text-red-500 dark:text-red-400">
            {{ saveError }}
          </p>
        </form>
      </div>
    </div>
  </LayoutPageContainer>
</template>
