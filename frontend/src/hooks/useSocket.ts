import { useEffect } from 'react';
import { socketService } from '../services/socket';
import { useBoardStore } from '../store/useBoardStore';
import toast from 'react-hot-toast';

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

    // ============ COLUMN EVENTS ============
    socketService.on('column:created', ({ boardId: eventBoardId, column }) => {
      if (eventBoardId === boardId) {
        addColumn(column);
        toast.success('Nueva columna creada');
      }
    });

    socketService.on('column:deleted', ({ boardId: eventBoardId, columnId }) => {
      if (eventBoardId === boardId) {
        removeColumn(columnId);
        toast('Columna eliminada', { icon: '🗑️' }); // ← Cambiado
      }
    });

    // ============ TASK EVENTS ============
    socketService.on('task:created', ({ boardId: eventBoardId, columnId, task }) => {
      if (eventBoardId === boardId) {
        addTask(columnId, task);
        toast.success('Nueva tarea creada');
      }
    });

    socketService.on('task:updated', ({ boardId: eventBoardId, task }) => {
      if (eventBoardId === boardId) {
        updateTask(task);
        toast('Tarea actualizada', { icon: '✏️' }); // ← Cambiado
      }
    });

    socketService.on('task:moved', ({ boardId: eventBoardId, task }) => {
      if (eventBoardId === boardId) {
        moveTask(task);
        // No mostrar toast para cada movimiento (sería molesto)
      }
    });

    socketService.on('task:deleted', ({ boardId: eventBoardId, columnId, taskId }) => {
      if (eventBoardId === boardId) {
        removeTask(columnId, taskId);
        toast('Tarea eliminada', { icon: '🗑️' }); // ← Cambiado
      }
    });

    // Cleanup al desmontar
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