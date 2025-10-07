import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType } from '../../types';
import { Task } from './Task';
import { tasksApi, boardsApi } from '../../services/api';
import { useThemeStore } from '../../store/useThemeStore';
import { useBoardStore } from '../../store/useBoardStore';
import { TaskModal, type TaskFormData } from './TaskModal';
import toast from 'react-hot-toast';

interface ColumnProps {
  column: ColumnType;
  onDeleteColumn: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const Column = ({ column, onDeleteColumn, onDeleteTask }: ColumnProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { theme } = useThemeStore();
  const { board, setBoard } = useBoardStore();
  
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const taskIds = column.tasks.map((task) => task._id);

  const handleCreateTask = async (taskData: TaskFormData) => {
    try {
      await tasksApi.create(column._id, taskData);
      toast.success('Tarea creada');
      
      // Recargar board completo
      if (board) {
        const updatedBoard = await boardsApi.getById(board._id);
        setBoard(updatedBoard);
      }
    } catch (error) {
      toast.error('Error al crear tarea');
      console.error(error);
    }
  };

  return (
    <>
      <div 
        className="rounded-2xl p-4 w-80 flex-shrink-0 border-2"
        style={{ 
          backgroundColor: theme.background.secondary,
          borderColor: theme.border 
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 
              className="font-semibold"
              style={{ color: theme.text.primary }}
            >
              {column.title}
            </h3>
            <span 
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ 
                backgroundColor: theme.background.tertiary,
                color: theme.text.secondary 
              }}
            >
              {column.tasks.length}
            </span>
          </div>
          
          <button
            onClick={() => onDeleteColumn(column._id)}
            className="p-1 hover:bg-red-500/10 rounded transition-colors"
            title="Eliminar columna"
          >
            <Trash2 className="w-4 h-4" style={{ color: theme.accent.danger }} />
          </button>
        </div>

        {/* Tasks - Droppable Area */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div 
            ref={setNodeRef}
            className="space-y-2 mb-3 max-h-[calc(100vh-300px)] overflow-y-auto min-h-[100px]"
          >
            {column.tasks.map((task, index) => (
              <Task 
                key={task._id} 
                task={task} 
                onDelete={onDeleteTask} 
                index={index} 
              />
            ))}
          </div>
        </SortableContext>

        {/* Add Task Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
          style={{ 
            color: theme.text.secondary,
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.background.hover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Plus className="w-4 h-4" />
          Agregar tarea
        </button>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
        mode="create"
      />
    </>
  );
};