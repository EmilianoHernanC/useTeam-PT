// Entidades

export interface Board {
  _id: string;
  title: string;
  description?: string;
  columns: Column[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  _id: string;
  title: string;
  boardId: string;
  position: number;
  isFixed?: boolean;
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  columnId: string;
  position: number;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  startDate?: string;
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

// Dtos

export interface CreateBoardDto {
  title: string;
  description?: string;
}

export interface CreateColumnDto {
  title: string;
  position?: number;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  position?: number;
  priority?: 'low' | 'medium' | 'high'; // NUEVO
  dueDate?: string; // NUEVO
  progress?: number; // NUEVO
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  columnId?: string;
  position?: number;
  priority?: 'low' | 'medium' | 'high'; // NUEVO
  dueDate?: string; // NUEVO
  progress?: number; // NUEVO
}

export interface MoveTaskDto {
  columnId: string;
  position: number;
}

// eventos de Websocket

export interface SocketEvents {
  'board:created': (board: Board) => void;
  'board:updated': (data: { boardId: string; board: Board }) => void;
  'column:created': (data: { boardId: string; column: Column }) => void;
  'column:deleted': (data: { boardId: string; columnId: string }) => void;
  'task:created': (data: { boardId: string; columnId: string; task: Task }) => void;
  'task:updated': (data: { boardId: string; task: Task }) => void;
  'task:moved': (data: { boardId: string; task: Task }) => void;
  'task:deleted': (data: { boardId: string; columnId: string; taskId: string }) => void;
}

// Interfaz UI

export interface OnlineUser {
  id: string;
  color: string;
  connectedAt: Date;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}