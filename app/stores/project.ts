import { defineStore } from 'pinia'
import { projectApi } from '~/features/project/services/project.api'
import type { Project, CreateProjectPayload, UpdateProjectPayload, ProjectMember, ProjectInvitation, InviteToProjectPayload } from '~/features/project/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  pendingInvitations: ProjectInvitation[]
  currentMembers: ProjectMember[]
  currentInvitations: ProjectInvitation[]
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    isLoading: false,
    pendingInvitations: [],
    currentMembers: [],
    currentInvitations: [],
  }),

  getters: {
    allProjects: (state) => state.projects,
    runningProjects: (state) => state.projects.filter(p => p.status === 'ACTIVE'),
    completedProjects: (state) => state.projects.filter(p => p.status === 'COMPLETED'),
    pendingProjects: (state) => state.projects.filter(p => p.status === 'ARCHIVED'),
    totalProjects: (state) => state.projects.length,
    projectsByWorkspace: (state) => (workspaceId: string) =>
      state.projects.filter(p => p.workspaceId === workspaceId),
  },

  actions: {
    async fetchProjects(workspaceId?: string) {
      this.isLoading = true
      try {
        // If workspaceId provided, fetch for that workspace; otherwise use current workspace
        const wsId = workspaceId || useWorkspaceStore().activeWorkspace?.id
        if (!wsId) {
          console.warn('No workspace selected, cannot fetch projects')
          return
        }
        const { data } = await projectApi.list(wsId)
        this.projects = data as Project[]
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchProjectById(id: string) {
      this.isLoading = true
      try {
        const { data } = await projectApi.get(id)
        this.currentProject = data as Project
        // Also update in list
        const idx = this.projects.findIndex(p => p.id === id)
        if (idx !== -1) this.projects[idx] = data as Project
        else this.projects.push(data as Project)
      } catch (error) {
        console.error('Failed to fetch project:', error)
      } finally {
        this.isLoading = false
      }
    },

    async createProject(payload: CreateProjectPayload) {
      try {
        const { data } = await projectApi.create(payload)
        const project = data as Project
        this.projects.push(project)
        return project
      } catch (error) {
        console.error('Failed to create project:', error)
        throw error
      }
    },

    async updateProject(id: string, payload: UpdateProjectPayload) {
      try {
        const { data } = await projectApi.update(id, payload)
        const idx = this.projects.findIndex(p => p.id === id)
        if (idx !== -1) this.projects[idx] = data as Project
        if (this.currentProject?.id === id) this.currentProject = data as Project
      } catch (error) {
        console.error('Failed to update project:', error)
        throw error
      }
    },

    async deleteProject(id: string) {
      try {
        await projectApi.delete(id)
        this.projects = this.projects.filter(p => p.id !== id)
        if (this.currentProject?.id === id) this.currentProject = null
      } catch (error) {
        console.error('Failed to delete project:', error)
        throw error
      }
    },

    setCurrentProject(projectId: string) {
      this.currentProject = this.projects.find(p => p.id === projectId) ?? null
    },

    // ─── Members & Invitations ─────────────────────────────────────────

    async fetchMembers(projectId: string) {
      try {
        const { data } = await projectApi.getMembers(projectId)
        this.currentMembers = data as ProjectMember[]
      } catch (error) {
        console.error('Failed to fetch members:', error)
      }
    },

    async fetchProjectInvitations(projectId: string) {
      try {
        const { data } = await projectApi.getInvitations(projectId)
        this.currentInvitations = data as ProjectInvitation[]
      } catch (error) {
        console.error('Failed to fetch invitations:', error)
      }
    },

    async inviteMember(projectId: string, payload: InviteToProjectPayload) {
      try {
        const { data } = await projectApi.invite(projectId, payload)
        this.currentInvitations.push(data as ProjectInvitation)
        return data
      } catch (error) {
        console.error('Failed to invite member:', error)
        throw error
      }
    },

    async updateMemberRole(projectId: string, memberId: string, role: string) {
      try {
        const { data } = await projectApi.updateMemberRole(projectId, memberId, role)
        const idx = this.currentMembers.findIndex(m => m.id === memberId)
        if (idx !== -1) this.currentMembers[idx] = data as ProjectMember
      } catch (error) {
        console.error('Failed to update member role:', error)
        throw error
      }
    },

    async removeMember(projectId: string, memberId: string) {
      try {
        await projectApi.removeMember(projectId, memberId)
        this.currentMembers = this.currentMembers.filter(m => m.id !== memberId)
      } catch (error) {
        console.error('Failed to remove member:', error)
        throw error
      }
    },

    async cancelInvitation(projectId: string, invitationId: string) {
      try {
        await projectApi.cancelInvitation(projectId, invitationId)
        this.currentInvitations = this.currentInvitations.filter(i => i.id !== invitationId)
      } catch (error) {
        console.error('Failed to cancel invitation:', error)
        throw error
      }
    },

    async fetchPendingInvitations() {
      try {
        const { data } = await projectApi.getPendingInvitations()
        this.pendingInvitations = data as ProjectInvitation[]
      } catch (error) {
        console.error('Failed to fetch pending invitations:', error)
      }
    },

    async acceptInvitation(token: string) {
      try {
        const { data } = await projectApi.acceptInvitation(token)
        this.pendingInvitations = this.pendingInvitations.filter(i => i.token !== token)
        return data as { project: { id: string; name: string; workspaceId: string } }
      } catch (error) {
        console.error('Failed to accept invitation:', error)
        throw error
      }
    },

    async declineInvitation(token: string) {
      try {
        await projectApi.declineInvitation(token)
        this.pendingInvitations = this.pendingInvitations.filter(i => i.token !== token)
      } catch (error) {
        console.error('Failed to decline invitation:', error)
        throw error
      }
    },
  },
})
