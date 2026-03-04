export const useWorkspace = () => {
  const workspaceStore = useWorkspaceStore()

  const loadWorkspaces = async () => {
    await workspaceStore.fetchWorkspaces()
  }

  return {
    workspaces: computed(() => workspaceStore.allWorkspaces),
    currentWorkspace: computed(() => workspaceStore.activeWorkspace),
    members: computed(() => workspaceStore.members),
    isLoading: computed(() => workspaceStore.isLoading),
    loadWorkspaces,
    createWorkspace: workspaceStore.createWorkspace,
    setCurrentWorkspace: workspaceStore.setCurrentWorkspace,
  }
}
