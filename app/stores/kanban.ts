import { defineStore } from 'pinia'
import { kanbanApi } from '~/features/kanban/services/task.api'
import type { Board, Column, Task, CreateTaskPayload, MoveTaskPayload } from '~/features/kanban/types'

interface KanbanState {
  board: Board | null
  isLoading: boolean
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
        const { data } = await kanbanApi.getBoard(projectId)
        // Backend returns board(s) – may be array or single object
        const raw = data as any
        if (Array.isArray(raw)) {
          // GET /boards?projectId returns an array; take first
          this.board = raw.length > 0 ? this.normalizeBoard(raw[0]) : null
        } else {
          this.board = this.normalizeBoard(raw)
        }
      } catch (error) {
        console.error('Failed to fetch board:', error)
      } finally {
        this.isLoading = false
      }
    },

    /** Normalise backend board shape to match frontend Board type */
    normalizeBoard(raw: any): Board {
      return {
        id: raw.id,
        projectId: raw.projectId,
        name: raw.name,
        columns: (raw.columns ?? [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((col: any) => ({
            id: col.id,
            boardId: col.boardId,
            title: col.name ?? col.title,
            position: col.position,
            color: col.color,
            tasks: (col.tasks ?? [])
              .sort((a: any, b: any) => a.position - b.position)
              .map((t: any) => this.normalizeTask(t)),
          })),
      }
    },

    normalizeTask(t: any): Task {
      return {
        id: t.id,
        columnId: t.columnId,
        title: t.title,
        description: t.description ?? '',
        position: t.position,
        priority: t.priority?.toLowerCase() ?? 'medium',
        status: t.status ?? 'todo',
        dueDate: t.dueDate,
        assignees: t.assignee
          ? [{ id: t.assignee.id, name: t.assignee.name, avatar: t.assignee.avatar }]
          : [],
        labels: (t.labels ?? []).map((l: any) => (typeof l === 'string' ? l : l.name ?? l.label)),
        commentsCount: t._count?.comments ?? t.commentsCount ?? 0,
        attachmentsCount: t.attachmentsCount ?? 0,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }
    },

    async addColumn(title: string) {
      if (!this.board) return
      try {
        const { data } = await kanbanApi.createColumn({
          boardId: this.board.id,
          title,
          position: this.board.columns.length,
        })
        const col = data as any
        const newColumn: Column = {
          id: col.id,
          boardId: col.boardId,
          title: col.name ?? col.title ?? title,
          position: col.position,
          color: col.color,
          tasks: [],
        }
        this.board.columns.push(newColumn)
      } catch (error) {
        console.error('Failed to add column:', error)
      }
    },

    async updateColumn(columnId: string, title: string) {
      if (!this.board) return
      try {
        await kanbanApi.updateColumn(columnId, { title })
        const col = this.board.columns.find(c => c.id === columnId)
        if (col) col.title = title
      } catch (error) {
        console.error('Failed to update column:', error)
      }
    },

    async deleteColumn(columnId: string) {
      if (!this.board) return
      try {
        await kanbanApi.deleteColumn(columnId)
        this.board.columns = this.board.columns.filter(c => c.id !== columnId)
      } catch (error) {
        console.error('Failed to delete column:', error)
      }
    },

    async addTask(columnId: string, payload: CreateTaskPayload) {
      if (!this.board) return
      const column = this.board.columns.find(c => c.id === columnId)
      if (!column) return

      try {
        const { data } = await kanbanApi.createTask({
          ...payload,
          columnId,
        })
        const t = data as any
        column.tasks.push(this.normalizeTask(t))
      } catch (error) {
        console.error('Failed to add task:', error)
      }
    },

    async updateTask(taskId: string, updates: Partial<Task>) {
      if (!this.board) return
      try {
        const { data } = await kanbanApi.updateTask(taskId, updates)
        const updated = data as any
        for (const col of this.board.columns) {
          const idx = col.tasks.findIndex(t => t.id === taskId)
          if (idx !== -1) {
            col.tasks[idx] = this.normalizeTask(updated)
            break
          }
        }
      } catch (error) {
        console.error('Failed to update task:', error)
      }
    },

    async deleteTask(taskId: string) {
      if (!this.board) return
      try {
        await kanbanApi.deleteTask(taskId)
        for (const col of this.board.columns) {
          const idx = col.tasks.findIndex(t => t.id === taskId)
          if (idx !== -1) {
            col.tasks.splice(idx, 1)
            col.tasks.forEach((t, i) => (t.position = i))
            break
          }
        }
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    },

    async moveTask(payload: MoveTaskPayload) {
      if (!this.board) return

      // Optimistic update
      let task: Task | undefined
      let sourceColumn: Column | undefined

      for (const col of this.board.columns) {
        const idx = col.tasks.findIndex(t => t.id === payload.taskId)
        if (idx !== -1) {
          task = col.tasks.splice(idx, 1)[0]
          sourceColumn = col
          break
        }
      }

      if (!task) return

      const targetColumn = this.board.columns.find(c => c.id === payload.targetColumnId)
      if (!targetColumn) return

      task.columnId = payload.targetColumnId
      task.position = payload.targetPosition
      targetColumn.tasks.splice(payload.targetPosition, 0, task)

      sourceColumn?.tasks.forEach((t, i) => (t.position = i))
      targetColumn.tasks.forEach((t, i) => (t.position = i))

      try {
        await kanbanApi.moveTask(payload)
      } catch (error) {
        console.error('Failed to move task, reverting:', error)
        // Revert by re-fetching the board
        if (this.board) {
          await this.fetchBoard(this.board.projectId)
        }
      }
    },

    async reorderColumns(newOrder: Column[]) {
      if (!this.board) return
      // Optimistic update
      this.board.columns = newOrder.map((col, i) => ({ ...col, position: i }))

      try {
        await kanbanApi.reorderColumns(
          newOrder.map((col, i) => ({ id: col.id, position: i }))
        )
      } catch (error) {
        console.error('Failed to reorder columns:', error)
        if (this.board) {
          await this.fetchBoard(this.board.projectId)
        }
      }
    },
  },
})
