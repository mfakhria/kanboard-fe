export const useProjects = () => {
  const projectStore = useProjectStore()

  const loadProjects = async () => {
    await projectStore.fetchProjects()
  }

  return {
    projects: computed(() => projectStore.allProjects),
    runningProjects: computed(() => projectStore.runningProjects),
    completedProjects: computed(() => projectStore.completedProjects),
    pendingProjects: computed(() => projectStore.pendingProjects),
    totalProjects: computed(() => projectStore.totalProjects),
    isLoading: computed(() => projectStore.isLoading),
    loadProjects,
    createProject: projectStore.createProject,
    updateProject: projectStore.updateProject,
    deleteProject: projectStore.deleteProject,
  }
}
