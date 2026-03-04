import { defineStore } from 'pinia'
import type { Board, Column, Task, CreateTaskPayload, MoveTaskPayload } from '~/features/kanban/types'

interface KanbanState {
  board: Board | null
  isLoading: boolean
}

// Mock kanban data
const mockBoard: Board = {
  id: '1',
  projectId: '1',
  name: 'Development Board',
  columns: [
    {
      id: 'col-1',
      boardId: '1',
      title: 'To Do',
      position: 0,
      color: '#6b7280',
      tasks: [
        {
          id: 'task-1',
          columnId: 'col-1',
          title: 'Design system setup',
          description: 'Set up the base design system with tokens and components',
          position: 0,
          priority: 'high',
          status: 'todo',
          dueDate: '2024-12-01',
          assignees: [{ id: '1', name: 'Totok Michael', avatar: '/images/avatar.jpg' }],
          labels: ['design', 'setup'],
          commentsCount: 3,
          attachmentsCount: 1,
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-11-01T00:00:00Z',
        },
        {
          id: 'task-2',
          columnId: 'col-1',
          title: 'User authentication flow',
          description: 'Implement login, register, and password reset',
          position: 1,
          priority: 'urgent',
          status: 'todo',
          dueDate: '2024-12-05',
          assignees: [{ id: '3', name: 'Edwin Adenike' }],
          labels: ['auth', 'backend'],
          commentsCount: 5,
          attachmentsCount: 0,
          createdAt: '2024-11-02T00:00:00Z',
          updatedAt: '2024-11-02T00:00:00Z',
        },
        {
          id: 'task-3',
          columnId: 'col-1',
          title: 'Database schema design',
          description: 'Design and implement the Prisma schema',
          position: 2,
          priority: 'medium',
          status: 'todo',
          assignees: [],
          labels: ['database'],
          commentsCount: 1,
          attachmentsCount: 2,
          createdAt: '2024-11-03T00:00:00Z',
          updatedAt: '2024-11-03T00:00:00Z',
        },
      ],
    },
    {
      id: 'col-2',
      boardId: '1',
      title: 'In Progress',
      position: 1,
      color: '#3b82f6',
      tasks: [
        {
          id: 'task-4',
          columnId: 'col-2',
          title: 'API endpoint development',
          description: 'Build REST API endpoints for CRUD operations',
          position: 0,
          priority: 'high',
          status: 'in_progress',
          dueDate: '2024-11-28',
          assignees: [
            { id: '2', name: 'Alexandra Deff' },
            { id: '3', name: 'Edwin Adenike' },
          ],
          labels: ['api', 'backend'],
          commentsCount: 8,
          attachmentsCount: 3,
          createdAt: '2024-11-05T00:00:00Z',
          updatedAt: '2024-11-15T00:00:00Z',
        },
        {
          id: 'task-5',
          columnId: 'col-2',
          title: 'Responsive layout for homepage',
          description: 'Make the homepage fully responsive',
          position: 1,
          priority: 'medium',
          status: 'in_progress',
          dueDate: '2024-11-30',
          assignees: [{ id: '5', name: 'David Oshodi' }],
          labels: ['frontend', 'responsive'],
          commentsCount: 2,
          attachmentsCount: 0,
          createdAt: '2024-11-06T00:00:00Z',
          updatedAt: '2024-11-16T00:00:00Z',
        },
      ],
    },
    {
      id: 'col-3',
      boardId: '1',
      title: 'Review',
      position: 2,
      color: '#f59e0b',
      tasks: [
        {
          id: 'task-6',
          columnId: 'col-3',
          title: 'Search and filter functionality',
          description: 'Implement search with filter capabilities',
          position: 0,
          priority: 'medium',
          status: 'review',
          dueDate: '2024-11-25',
          assignees: [{ id: '4', name: 'Isaac Oluwatemilorun' }],
          labels: ['feature', 'frontend'],
          commentsCount: 4,
          attachmentsCount: 1,
          createdAt: '2024-11-07T00:00:00Z',
          updatedAt: '2024-11-17T00:00:00Z',
        },
      ],
    },
    {
      id: 'col-4',
      boardId: '1',
      title: 'Done',
      position: 3,
      color: '#16a34a',
      tasks: [
        {
          id: 'task-7',
          columnId: 'col-4',
          title: 'Github project repository',
          description: 'Set up project repo with CI/CD',
          position: 0,
          priority: 'low',
          status: 'done',
          assignees: [{ id: '2', name: 'Alexandra Deff' }],
          labels: ['devops'],
          commentsCount: 6,
          attachmentsCount: 2,
          createdAt: '2024-11-01T00:00:00Z',
          updatedAt: '2024-11-20T00:00:00Z',
        },
        {
          id: 'task-8',
          columnId: 'col-4',
          title: 'Project setup and configuration',
          description: 'Initial project scaffolding',
          position: 1,
          priority: 'low',
          status: 'done',
          assignees: [{ id: '1', name: 'Totok Michael' }],
          labels: ['setup'],
          commentsCount: 2,
          attachmentsCount: 0,
          createdAt: '2024-10-25T00:00:00Z',
          updatedAt: '2024-11-18T00:00:00Z',
        },
      ],
    },
  ],
}

export const useKanbanStore = defineStore('kanban', {
  state: (): KanbanState => ({
    board: null,
    isLoading: false,
  }),

  getters: {
    columns: (state) => state.board?.columns ?? [],
    totalTasks: (state) => {
      if (!state.board) return 0
      return state.board.columns.reduce((sum, col) => sum + col.tasks.length, 0)
    },
  },

  actions: {
    async fetchBoard(projectId: string) {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        this.board = { ...mockBoard, projectId }
      } finally {
        this.isLoading = false
      }
    },

    addColumn(title: string) {
      if (!this.board) return
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        boardId: this.board.id,
        title,
        position: this.board.columns.length,
        tasks: [],
      }
      this.board.columns.push(newColumn)
    },

    updateColumn(columnId: string, title: string) {
      if (!this.board) return
      const col = this.board.columns.find(c => c.id === columnId)
      if (col) col.title = title
    },

    deleteColumn(columnId: string) {
      if (!this.board) return
      this.board.columns = this.board.columns.filter(c => c.id !== columnId)
    },

    addTask(columnId: string, payload: CreateTaskPayload) {
      if (!this.board) return
      const column = this.board.columns.find(c => c.id === columnId)
      if (!column) return

      const newTask: Task = {
        id: `task-${Date.now()}`,
        columnId,
        title: payload.title,
        description: payload.description,
        position: column.tasks.length,
        priority: payload.priority || 'medium',
        status: 'todo',
        dueDate: payload.dueDate,
        assignees: [],
        labels: payload.labels || [],
        commentsCount: 0,
        attachmentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      column.tasks.push(newTask)
    },

    updateTask(taskId: string, updates: Partial<Task>) {
      if (!this.board) return
      for (const col of this.board.columns) {
        const task = col.tasks.find(t => t.id === taskId)
        if (task) {
          Object.assign(task, updates, { updatedAt: new Date().toISOString() })
          break
        }
      }
    },

    deleteTask(taskId: string) {
      if (!this.board) return
      for (const col of this.board.columns) {
        const idx = col.tasks.findIndex(t => t.id === taskId)
        if (idx !== -1) {
          col.tasks.splice(idx, 1)
          // Reorder
          col.tasks.forEach((t, i) => (t.position = i))
          break
        }
      }
    },

    moveTask(payload: MoveTaskPayload) {
      if (!this.board) return

      let task: Task | undefined
      let sourceColumn: Column | undefined

      // Find and remove from source
      for (const col of this.board.columns) {
        const idx = col.tasks.findIndex(t => t.id === payload.taskId)
        if (idx !== -1) {
          task = col.tasks.splice(idx, 1)[0]
          sourceColumn = col
          break
        }
      }

      if (!task) return

      // Add to target
      const targetColumn = this.board.columns.find(c => c.id === payload.targetColumnId)
      if (!targetColumn) return

      task.columnId = payload.targetColumnId
      task.position = payload.targetPosition
      targetColumn.tasks.splice(payload.targetPosition, 0, task)

      // Reorder both columns
      sourceColumn?.tasks.forEach((t, i) => (t.position = i))
      targetColumn.tasks.forEach((t, i) => (t.position = i))
    },

    reorderColumns(newOrder: Column[]) {
      if (!this.board) return
      this.board.columns = newOrder.map((col, i) => ({ ...col, position: i }))
    },
  },
})
