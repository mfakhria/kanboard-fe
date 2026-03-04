export const useProjects = () => {
  const projectStore = useProjectStore()

  const loadProjects = async (workspaceId?: string) => {
    await projectStore.fetchProjects(workspaceId)
  }

  const loadProject = async (id: string) => {
    await projectStore.fetchProjectById(id)
  }

  return {
    projects: computed(() => projectStore.allProjects),
    currentProject: computed(() => projectStore.currentProject),
    runningProjects: computed(() => projectStore.runningProjects),
    completedProjects: computed(() => projectStore.completedProjects),
    pendingProjects: computed(() => projectStore.pendingProjects),
    totalProjects: computed(() => projectStore.totalProjects),
    isLoading: computed(() => projectStore.isLoading),
    loadProjects,
    loadProject,
    createProject: projectStore.createProject,
    updateProject: projectStore.updateProject,
    deleteProject: projectStore.deleteProject,
  }
}
