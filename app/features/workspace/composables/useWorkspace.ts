export const useWorkspace = () => {
  const workspaceStore = useWorkspaceStore()

  const loadWorkspaces = async () => {
    await workspaceStore.fetchWorkspaces()
  }

  const loadWorkspace = async (id: string) => {
    await workspaceStore.fetchWorkspaceById(id)
  }

  return {
    workspaces: computed(() => workspaceStore.allWorkspaces),
    currentWorkspace: computed(() => workspaceStore.activeWorkspace),
    members: computed(() => workspaceStore.members),
    isLoading: computed(() => workspaceStore.isLoading),
    loadWorkspaces,
    loadWorkspace,
    createWorkspace: workspaceStore.createWorkspace,
    inviteMember: workspaceStore.inviteMember,
    deleteWorkspace: workspaceStore.deleteWorkspace,
    setCurrentWorkspace: workspaceStore.setCurrentWorkspace,
  }
}
