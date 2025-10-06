import { create } from 'zustand';
import type{ Board, Column, Task } from '../types';

interface BoardState {
  board: Board | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBoard: (board: Board) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Column actions
  addColumn: (column: Column) => void;
  removeColumn: (columnId: string) => void;
  
  // Task actions
  addTask: (columnId: string, task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (columnId: string, taskId: string) => void;
  moveTask: (task: Task) => void;
  
  // Utility
  reset: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  isLoading: false,
  error: null,

  setBoard: (board) => set({ board, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, isLoading: false }),

  addColumn: (column) => set((state) => {
    if (!state.board) return state;
    return {
      board: {
        ...state.board,
        columns: [...state.board.columns, column],
      },
    };
  }),

  removeColumn: (columnId) => set((state) => {
    if (!state.board) return state;
    return {
      board: {
        ...state.board,
        columns: state.board.columns.filter((col) => col._id !== columnId),
      },
    };
  }),

  addTask: (columnId, task) => set((state) => {
    if (!state.board) return state;
    return {
      board: {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col._id === columnId
            ? { ...col, tasks: [...col.tasks, task] }
            : col
        ),
      },
    };
  }),

  updateTask: (task) => set((state) => {
    if (!state.board) return state;
    return {
      board: {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col._id === task.columnId
            ? {
                ...col,
                tasks: col.tasks.map((t) =>
                  t._id === task._id ? task : t
                ),
              }
            : col
        ),
      },
    };
  }),

  removeTask: (columnId, taskId) => set((state) => {
    if (!state.board) return state;
    return {
      board: {
        ...state.board,
        columns: state.board.columns.map((col) =>
          col._id === columnId
            ? {
                ...col,
                tasks: col.tasks.filter((t) => t._id !== taskId),
              }
            : col
        ),
      },
    };
  }),

  moveTask: (task) => set((state) => {
    if (!state.board) return state;
    
    // Eliminar la tarea de todas las columnas
    const columnsWithoutTask = state.board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t._id !== task._id),
    }));

    // Agregar la tarea a la columna correcta
    const updatedColumns = columnsWithoutTask.map((col) =>
      col._id === task.columnId
        ? { ...col, tasks: [...col.tasks, task] }
        : col
    );

    return {
      board: {
        ...state.board,
        columns: updatedColumns,
      },
    };
  }),

  reset: () => set({ board: null, isLoading: false, error: null }),
}));