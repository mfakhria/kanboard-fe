import { defineStore } from 'pinia'
import { workspaceApi } from '~/features/workspace/services/workspace.api'
import type { Workspace, WorkspaceMember, WorkspaceInvitation, WorkspaceInvitationAction } from '~/features/workspace/types'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  pendingInvitations: WorkspaceInvitation[]
  isLoading: boolean
}

export const useWorkspaceStore = defineStore('workspace', {
  state: (): WorkspaceState => ({
    workspaces: [],
    currentWorkspace: null,
    pendingInvitations: [],
    isLoading: false,
  }),

  getters: {
    allWorkspaces: (state) => state.workspaces,
    activeWorkspace: (state) => state.currentWorkspace,
    members: (state) => state.currentWorkspace?.members ?? [],
    invitations: (state) => state.pendingInvitations,
  },

  actions: {
    async fetchWorkspaces() {
      this.isLoading = true
      try {
        const { data } = await workspaceApi.list()
        this.workspaces = data as Workspace[]

        // Auto-create a default workspace if user has none
        if (this.workspaces.length === 0) {
          const created = await this.createWorkspace({ name: 'My Team' })
          if (created) {
            this.workspaces = [created]
          }
        }

        if (!this.currentWorkspace && this.workspaces.length > 0) {
          // Restore last active workspace from localStorage
          const savedId = localStorage.getItem('activeWorkspaceId')
          const saved = savedId ? this.workspaces.find(w => w.id === savedId) : null
          this.currentWorkspace = saved || (this.workspaces[0] ?? null)
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

    async updateWorkspace(workspaceId: string, payload: { name?: string; description?: string }) {
      try {
        await workspaceApi.update(workspaceId, payload)
        await this.fetchWorkspaceById(workspaceId)
        return this.workspaces.find(w => w.id === workspaceId) ?? this.currentWorkspace
      } catch (error) {
        console.error('Failed to update workspace:', error)
        throw error
      }
    },

    async inviteMember(workspaceId: string, payload: { email: string; role?: 'ADMIN' | 'MEMBER' | 'VIEWER' }) {
      try {
        await workspaceApi.inviteMember(workspaceId, { email: payload.email, role: payload.role || 'MEMBER' })
      } catch (error) {
        console.error('Failed to invite member:', error)
        throw error
      }
    },

    async fetchPendingInvitations() {
      try {
        const { data } = await workspaceApi.getPendingInvitations()
        this.pendingInvitations = data as WorkspaceInvitation[]
      } catch (error) {
        console.error('Failed to fetch pending invitations:', error)
        throw error
      }
    },

    async respondInvitation(invitationId: string, action: WorkspaceInvitationAction) {
      try {
        await workspaceApi.respondInvitation(invitationId, action)
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.id !== invitationId)

        if (action === 'accept') {
          await this.fetchWorkspaces()
        }
      } catch (error) {
        console.error('Failed to respond invitation:', error)
        throw error
      }
    },

    async updateMemberRole(workspaceId: string, memberId: string, role: string) {
      try {
        await workspaceApi.assignRole(workspaceId, memberId, role)
        await this.fetchWorkspaceById(workspaceId)
      } catch (error) {
        console.error('Failed to update member role:', error)
        throw error
      }
    },

    async removeMember(workspaceId: string, memberId: string) {
      try {
        await workspaceApi.removeMember(workspaceId, memberId)
        await this.fetchWorkspaceById(workspaceId)
      } catch (error) {
        console.error('Failed to remove member:', error)
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

    async setCurrentWorkspace(workspaceId: string) {
      const prev = this.currentWorkspace?.id
      this.currentWorkspace = this.workspaces.find(w => w.id === workspaceId) ?? null
      if (this.currentWorkspace) localStorage.setItem('activeWorkspaceId', this.currentWorkspace.id)

      // Re-fetch dependent data when switching to a different team
      if (prev !== workspaceId && this.currentWorkspace) {
        const projectStore = useProjectStore()
        const analyticsStore = useAnalyticsStore()
        await Promise.all([
          projectStore.fetchProjects(workspaceId),
          analyticsStore.fetchAnalytics(workspaceId),
        ])
      }
    },
  },
})
