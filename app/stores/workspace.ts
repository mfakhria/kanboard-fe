import { defineStore } from 'pinia'
import { workspaceApi } from '~/features/workspace/services/workspace.api'
import type { Workspace, WorkspaceMember } from '~/features/workspace/types'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    workspaces: [],
    currentWorkspace: null,
    isLoading: false,
  }),

  getters: {
    allWorkspaces: (state) => state.workspaces,
    activeWorkspace: (state) => state.currentWorkspace,
    members: (state) => state.currentWorkspace?.members ?? [],
  },

  actions: {
    async fetchWorkspaces() {
      this.isLoading = true
      try {
        const { data } = await workspaceApi.list()
        this.workspaces = data as Workspace[]

        // Auto-create a default workspace if user has none
        if (this.workspaces.length === 0) {
          const created = await this.createWorkspace({ name: 'My Workspace' })
          if (created) {
            this.workspaces = [created]
          }
        }

        if (!this.currentWorkspace && this.workspaces.length > 0) {
          // Restore last active workspace from localStorage
          const savedId = localStorage.getItem('activeWorkspaceId')
          const saved = savedId ? this.workspaces.find(w => w.id === savedId) : null
          this.currentWorkspace = saved || this.workspaces[0] ?? null
          if (this.currentWorkspace) localStorage.setItem('activeWorkspaceId', this.currentWorkspace.id)
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchWorkspaceById(id: string) {
      this.isLoading = true
      try {
        const { data } = await workspaceApi.get(id)
        this.currentWorkspace = data as Workspace
        if (this.currentWorkspace) localStorage.setItem('activeWorkspaceId', this.currentWorkspace.id)
        // Update in list too
        const idx = this.workspaces.findIndex(w => w.id === id)
        if (idx !== -1) this.workspaces[idx] = data as Workspace
        else this.workspaces.push(data as Workspace)
      } catch (error) {
        console.error('Failed to fetch workspace:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createWorkspace(payload: { name: string; description?: string }) {
      try {
        const { data } = await workspaceApi.create(payload)
        const workspace = data as Workspace
        this.workspaces.push(workspace)
        return workspace
      } catch (error) {
        console.error('Failed to create workspace:', error)
        throw error
      }
    },

    async inviteMember(workspaceId: string, payload: { email: string; role?: 'ADMIN' | 'MEMBER' | 'VIEWER' }) {
      try {
        await workspaceApi.inviteMember(workspaceId, { email: payload.email, role: payload.role || 'MEMBER' })
        // Re-fetch workspace to get updated members
        await this.fetchWorkspaceById(workspaceId)
      } catch (error) {
        console.error('Failed to invite member:', error)
        throw error
      }
    },

    async deleteWorkspace(id: string) {
      try {
        await workspaceApi.delete(id)
        this.workspaces = this.workspaces.filter(w => w.id !== id)
        if (this.currentWorkspace?.id === id) {
          this.currentWorkspace = this.workspaces[0] ?? null
          if (this.currentWorkspace) localStorage.setItem('activeWorkspaceId', this.currentWorkspace.id)
        }
      } catch (error) {
        console.error('Failed to delete workspace:', error)
        throw error
      }
    },

    setCurrentWorkspace(workspaceId: string) {
      this.currentWorkspace = this.workspaces.find(w => w.id === workspaceId) ?? null
      if (this.currentWorkspace) localStorage.setItem('activeWorkspaceId', this.currentWorkspace.id)
    },
  },
})
