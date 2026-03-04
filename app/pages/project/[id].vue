<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const kanbanStore = useKanbanStore()
const projectStore = useProjectStore()

const projectId = computed(() => route.params.id as string)

onMounted(async () => {
  await projectStore.fetchProjects()
  projectStore.setCurrentProject(projectId.value)
  await kanbanStore.fetchBoard(projectId.value)
})

const project = computed(() => projectStore.currentProject)
</script>

<template>
  <LayoutPageContainer>
    <!-- Project Header -->
    <LayoutPageHeader :title="project?.name || 'Kanban Board'">
      <template #breadcrumb>
        <div class="flex items-center gap-2 mb-1">
          <NuxtLink to="/dashboard" class="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Dashboard</NuxtLink>
          <span class="text-gray-300 dark:text-gray-600">/</span>
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project?.name || 'Project' }}</span>
        </div>
      </template>
      <template #actions>
        <div class="flex -space-x-2">
          <div class="h-8 w-8 rounded-full bg-red-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-bold">A</div>
          <div class="h-8 w-8 rounded-full bg-blue-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-bold">E</div>
          <div class="h-8 w-8 rounded-full bg-purple-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-bold">I</div>
          <div class="h-8 w-8 rounded-full bg-amber-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs text-white font-bold">D</div>
        </div>
        <UiButton variant="outline" size="sm">
          + Invite
        </UiButton>
      </template>
    </LayoutPageHeader>

    <!-- Kanban Board -->
    <KanbanKanbanBoard />
  </LayoutPageContainer>
</template>
