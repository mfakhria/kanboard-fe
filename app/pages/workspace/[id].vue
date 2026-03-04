<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const workspaceStore = useWorkspaceStore()
const projectStore = useProjectStore()

const workspaceId = computed(() => route.params.id as string)

onMounted(async () => {
  await workspaceStore.fetchWorkspaces()
  workspaceStore.setCurrentWorkspace(workspaceId.value)
  await projectStore.fetchProjects()
})

const workspace = computed(() => workspaceStore.activeWorkspace)
const projects = computed(() => projectStore.projectsByWorkspace(workspaceId.value))
</script>

<template>
  <LayoutPageContainer>
    <LayoutPageHeader :title="workspace?.name || 'Workspace'" :subtitle="workspace?.description || 'Manage your workspace projects'" />

    <!-- Projects Grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="`/project/${project.id}`"
        class="group rounded-xl border bg-white dark:bg-gray-900 dark:border-gray-700 p-5 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">{{ project.icon }}</span>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400 transition">{{ project.name }}</h3>
            <p class="text-xs text-gray-400 dark:text-gray-500">Due: {{ project.dueDate }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{{ project.description }}</p>
        <div class="mt-3">
          <UiBadge :variant="project.status === 'running' ? 'success' : project.status === 'completed' ? 'default' : 'warning'">
            {{ project.status }}
          </UiBadge>
        </div>
      </NuxtLink>
    </div>
  </LayoutPageContainer>
</template>
