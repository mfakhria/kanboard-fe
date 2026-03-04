import { defineStore } from 'pinia'
import type { Workspace, WorkspaceMember } from '~/features/workspace/types'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
}

// Mock workspace data
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Kanboard Team',
    description: 'Main product workspace',
    ownerId: '1',
    members: [
      {
        id: '1',
        userId: '1',
        workspaceId: '1',
        role: 'owner',
        user: { id: '1', name: 'Totok Michael', email: 'tmichael20@mail.com', avatar: '/images/avatar.jpg' },
        joinedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        userId: '2',
        workspaceId: '1',
        role: 'member',
        user: { id: '2', name: 'Alexandra Deff', email: 'alex@mail.com' },
        joinedAt: '2024-01-15T00:00:00Z',
      },
      {
        id: '3',
        userId: '3',
        workspaceId: '1',
        role: 'member',
        user: { id: '3', name: 'Edwin Adenike', email: 'edwin@mail.com' },
        joinedAt: '2024-02-01T00:00:00Z',
      },
      {
        id: '4',
        userId: '4',
        workspaceId: '1',
        role: 'member',
        user: { id: '4', name: 'Isaac Oluwatemilorun', email: 'isaac@mail.com' },
        joinedAt: '2024-02-15T00:00:00Z',
      },
      {
        id: '5',
        userId: '5',
        workspaceId: '1',
        role: 'member',
        user: { id: '5', name: 'David Oshodi', email: 'david@mail.com' },
        joinedAt: '2024-03-01T00:00:00Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
  },
]

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
        await new Promise(resolve => setTimeout(resolve, 500))
        this.workspaces = mockWorkspaces
        if (!this.currentWorkspace && this.workspaces.length > 0) {
          this.currentWorkspace = this.workspaces[0] ?? null
        }
      } finally {
        this.isLoading = false
      }
    },

    async createWorkspace(payload: { name: string; description?: string }) {
      const newWorkspace: Workspace = {
        id: String(Date.now()),
        name: payload.name,
        description: payload.description,
        ownerId: '1',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.workspaces.push(newWorkspace)
      return newWorkspace
    },

    setCurrentWorkspace(workspaceId: string) {
      this.currentWorkspace = this.workspaces.find(w => w.id === workspaceId) ?? null
    },
  },
})
