import { defineStore } from 'pinia'
import { projectApi } from '~/features/project/services/project.api'
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '~/features/project/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
}

export const useProjectStore = defineStore('project', {
  state: (): ProjectState => ({
    projects: [],
    currentProject: null,
    isLoading: false,
  }),

  getters: {
    allProjects: (state) => state.projects,
    runningProjects: (state) => state.projects.filter(p => p.status === 'running'),
    completedProjects: (state) => state.projects.filter(p => p.status === 'completed'),
    pendingProjects: (state) => state.projects.filter(p => p.status === 'pending'),
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
  },
})
