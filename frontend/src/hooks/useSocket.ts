import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useBoardStore } from '../store/useBoardStore';
import toast from 'react-hot-toast';
import { boardsApi } from '../services/api';

export const useSocket = (boardId: string | null) => {
  const {
    addColumn,
    removeColumn,
    addTask,
    updateTask,
    removeTask,
    moveTask,
  } = useBoardStore();

  useEffect(() => {
    if (!boardId) return;

    // Conectar al WebSocket
    socketService.connect();

    // eventos en las columnas 
    socketService.on('column:created', async ({ boardId: eventBoardId }) => {
      if (eventBoardId === boardId) {
        // En lugar de solo agregar la columna, recarga el board completo
        try {
          const updatedBoard = await boardsApi.getById(boardId);
          useBoardStore.getState().setBoard(updatedBoard);
          toast.success('Nueva columna creada');
        } catch (error) {
          console.error('Error reloading board:', error);
        }
      }
    });

    socketService.on('column:deleted', ({ boardId: eventBoardId, columnId }) => {
      if (eventBoardId === boardId) {
        removeColumn(columnId);
        toast('Columna eliminada', { icon: '🗑️' });
      }
    });

    // eventos en las tareas
    socketService.on('task:created', ({ boardId: eventBoardId, columnId, task }) => {
      if (eventBoardId === boardId) {
        addTask(columnId, task);
        toast.success('Nueva tarea creada');
      }
    });

    socketService.on('task:updated', ({ boardId: eventBoardId, task }) => {
      if (eventBoardId === boardId) {
        updateTask(task);
        toast('Tarea actualizada', { icon: '✏️' });
      }
    });

    socketService.on('task:moved', ({ boardId: eventBoardId, task }) => {
      if (eventBoardId === boardId) {
        moveTask(task);
      }
    });

    socketService.on('task:deleted', ({ boardId: eventBoardId, columnId, taskId }) => {
      if (eventBoardId === boardId) {
        removeTask(columnId, taskId);
        toast('Tarea eliminada', { icon: '🗑️' });
      }
    });

    // limpiar al desmontar
    return () => {
      socketService.off('column:created');
      socketService.off('column:deleted');
      socketService.off('task:created');
      socketService.off('task:updated');
      socketService.off('task:moved');
      socketService.off('task:deleted');
    };
  }, [boardId, addColumn, removeColumn, addTask, updateTask, removeTask, moveTask]);

  return {
    isConnected: socketService.isConnected(),
  };
};