import axios from 'axios';
import type {
  Board,
  Column,
  Task,
  CreateBoardDto,
  CreateColumnDto,
  CreateTaskDto,
  UpdateTaskDto,
  MoveTaskDto,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============ BOARDS ============

export const boardsApi = {
  getAll: async (): Promise<Board[]> => {
    const { data } = await api.get<Board[]>('/boards');
    return data;
  },

  getById: async (id: string): Promise<Board> => {
    const { data } = await api.get<Board>(`/boards/${id}`);
    return data;
  },

  create: async (dto: CreateBoardDto): Promise<Board> => {
    const { data } = await api.post<Board>('/boards', dto);
    return data;
  },
};

// ============ COLUMNS ============

export const columnsApi = {
  create: async (boardId: string, dto: CreateColumnDto): Promise<Column> => {
    const { data } = await api.post<Column>(
      `/boards/${boardId}/columns`,
      dto
    );
    return data;
  },

  delete: async (columnId: string): Promise<void> => {
    await api.delete(`/boards/columns/${columnId}`);
  },
};

// ============ TASKS ============

export const tasksApi = {
  create: async (columnId: string, dto: CreateTaskDto): Promise<Task> => {
    const { data } = await api.post<Task>(
      `/boards/columns/${columnId}/tasks`,
      dto
    );
    return data;
  },

  update: async (taskId: string, dto: UpdateTaskDto): Promise<Task> => {
    const { data } = await api.patch<Task>(`/boards/tasks/${taskId}`, dto);
    return data;
  },

  move: async (taskId: string, dto: MoveTaskDto): Promise<Task> => {
    const { data } = await api.post<Task>(
      `/boards/tasks/${taskId}/move`,
      dto
    );
    return data;
  },

  delete: async (taskId: string): Promise<void> => {
    await api.delete(`/boards/tasks/${taskId}`);
  },
};

export default api;