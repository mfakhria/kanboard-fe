import { kanbanApi } from '~/features/kanban/services/task.api'

const taskCount = ref(0)
const loaded = ref(false)

export function useTaskCount() {
  async function fetchTaskCount() {
    const workspaceStore = useWorkspaceStore()
    const wsId = workspaceStore.activeWorkspace?.id
    if (!wsId) return
    try {
      const { data } = await kanbanApi.listTasks(wsId)
      taskCount.value = (data as any[]).length
      loaded.value = true
    } catch {
      // silently fail
    }
  }

  const badgeLabel = computed(() => {
    if (!loaded.value) return ''
    if (taskCount.value === 0) return ''
    return taskCount.value > 99 ? '99+' : `${taskCount.value}`
  })

  return { taskCount, badgeLabel, fetchTaskCount }
}
