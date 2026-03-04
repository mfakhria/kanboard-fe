import { defineStore } from 'pinia'
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '~/features/project/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
}

// Mock projects matching the dashboard UI image
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Develop API Endpoints',
    description: 'Build all REST API endpoints for the application',
    workspaceId: '1',
    status: 'running',
    color: '#3b82f6',
    icon: '⚡',
    dueDate: 'Nov 26, 2024',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Onboarding Flow',
    description: 'Design and implement user onboarding',
    workspaceId: '1',
    status: 'running',
    color: '#f59e0b',
    icon: '🎯',
    dueDate: 'Nov 28, 2024',
    createdAt: '2024-10-05T00:00:00Z',
    updatedAt: '2024-11-05T00:00:00Z',
  },
  {
    id: '3',
    name: 'Build Dashboard',
    description: 'Create the main dashboard with analytics',
    workspaceId: '1',
    status: 'running',
    color: '#8b5cf6',
    icon: '📊',
    dueDate: 'Nov 30, 2024',
    createdAt: '2024-10-10T00:00:00Z',
    updatedAt: '2024-11-10T00:00:00Z',
  },
  {
    id: '4',
    name: 'Optimize Page Load',
    description: 'Improve performance and loading times',
    workspaceId: '1',
    status: 'pending',
    color: '#ef4444',
    icon: '🚀',
    dueDate: 'Dec 5, 2024',
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    id: '5',
    name: 'Cross-Browser Testing',
    description: 'Test across all major browsers',
    workspaceId: '1',
    status: 'pending',
    color: '#ec4899',
    icon: '🔍',
    dueDate: 'Dec 6, 2024',
    createdAt: '2024-10-20T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
  ...Array.from({ length: 19 }, (_, i) => ({
    id: String(i + 6),
    name: `Project ${i + 6}`,
    description: `Description of project ${i + 6}`,
    workspaceId: '1',
    status: (['running', 'completed', 'pending', 'completed', 'running', 'completed', 'completed', 'running', 'completed', 'completed', 'running', 'completed', 'running', 'completed', 'completed', 'completed', 'completed', 'completed', 'completed'] as const)[i] ?? ('running' as const),
    color: '#6b7280',
    icon: '📁',
    dueDate: 'Dec 15, 2024',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-01T00:00:00Z',
  })),
]

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
    async fetchProjects() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        this.projects = mockProjects
      } finally {
        this.isLoading = false
      }
    },

    async createProject(payload: CreateProjectPayload) {
      const newProject: Project = {
        id: String(Date.now()),
        name: payload.name,
        description: payload.description,
        workspaceId: payload.workspaceId,
        status: 'pending',
        color: payload.color || '#6b7280',
        icon: '📁',
        dueDate: payload.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.projects.push(newProject)
      return newProject
    },

    async updateProject(id: string, payload: UpdateProjectPayload) {
      const idx = this.projects.findIndex(p => p.id === id)
      if (idx !== -1) {
        const existing = this.projects[idx]
        if (existing) {
          this.projects[idx] = { ...existing, ...payload, updatedAt: new Date().toISOString() } as Project
        }
      }
    },

    async deleteProject(id: string) {
      this.projects = this.projects.filter(p => p.id !== id)
    },

    setCurrentProject(projectId: string) {
      this.currentProject = this.projects.find(p => p.id === projectId) ?? null
    },
  },
})
