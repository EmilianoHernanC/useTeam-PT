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
  const { theme, isDark } = useThemeStore();
  const { board, setBoard } = useBoardStore();
  
  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  const taskIds = column.tasks.map((task) => task._id);

  const handleCreateTask = async (taskData: TaskFormData) => {
    // Límite de 3 tareas por columna
    if (column.tasks.length >= 3) {
      toast.error('Máximo 3 tareas por columna');
      return;
    }

    try {
      await tasksApi.create(column._id, taskData);
      toast.success('Tarea creada');
      
      if (board) {
        const updatedBoard = await boardsApi.getById(board._id);
        setBoard(updatedBoard);
      }
    } catch (error) {
      toast.error('Error al crear tarea');
      console.error(error);
    }
  };

  const canDelete = column.title !== 'To Do' && column.title !== 'Done';
  const canAddTask = column.tasks.length < 3;

  return (
    <>
      <div className="relative w-80 flex-shrink-0">
        {/* Columna con efecto papel */}
        <div 
          className="relative rounded-2xl border-2 shadow-lg"
          style={{ 
            backgroundColor: isDark ? theme.background.secondary : '#F9F5E3',
            borderColor: isDark ? theme.border : '#D4C5A0',
            boxShadow: isDark 
              ? '0 4px 12px rgba(0,0,0,0.5), inset 0 0 100px rgba(255,255,255,0.02)'
              : '0 4px 12px rgba(0,0,0,0.15), inset 0 0 100px rgba(0,0,0,0.05)',
            paddingLeft: '2.5rem',
            paddingRight: '1rem',
            paddingTop: '1.5rem',
            paddingBottom: '1rem',
            minHeight: '500px',
            maxHeight: 'calc(100vh - 200px)',
          }}
        >
          {/* Margen rojo vertical (sangría) */}
          <div 
            className="absolute left-8 top-0 bottom-0 w-0.5"
            style={{
              backgroundColor: isDark ? theme.accent.primary : '#E74C3C',
              opacity: isDark ? 0.3 : 0.4
            }}
          />

          {/* Líneas horizontales (renglones) */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
            style={{
              backgroundImage: isDark 
                ? 'repeating-linear-gradient(transparent, transparent 31px, rgba(255, 255, 255, 0.05) 31px, rgba(255, 255, 255, 0.05) 32px)'
                : 'repeating-linear-gradient(transparent, transparent 31px, rgba(150, 150, 150, 0.15) 31px, rgba(150, 150, 150, 0.15) 32px)',
              backgroundSize: '100% 32px',
            }}
          />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-4 ml-2" style={{ marginTop: '-20px' }}>
            <div className="flex items-center gap-2">
              <h3 
                className="font-bold text-lg"
                style={{ 
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace',
                  textShadow: isDark ? '1px 1px 0px rgba(0,0,0,0.5)' : '1px 1px 0px rgba(255,255,255,0.5)',
                  lineHeight: '32px'
                }}
              >
                {column.title}
              </h3>
              <span 
                className="px-2 py-0.5 text-xs rounded-full font-semibold"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: theme.text.secondary 
                }}
              >
                {column.tasks.length}/3
              </span>
            </div>
            
            {canDelete && (
              <button
                onClick={() => onDeleteColumn(column._id)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                title="Eliminar columna"
              >
                <Trash2 className="w-4 h-4" style={{ color: theme.accent.danger }} />
              </button>
            )}
          </div>

          {/* Tasks - Droppable Area */}
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div 
              ref={setNodeRef}
              className="relative space-y-3 mb-3 ml-2 overflow-y-auto" 
              style={{
                minHeight: '330px',
                maxHeight: '330px'
              }}
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
          <div className="relative ml-2" style={{ marginTop: '55px' }}>
            {canAddTask ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all hover:scale-[1.02]"
                style={{ 
                  color: theme.text.secondary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: isDark ? '2px dashed rgba(255,255,255,0.3)' : '2px dashed rgba(0,0,0,0.5)',
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                <Plus className="w-4 h-4" />
                Agregar tarea ({column.tasks.length}/3)
              </button>
            ) : (
              <div 
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all hover:scale-[1.02]"
                style={{ 
                  color: theme.text.tertiary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: isDark ? '2px dashed rgba(255,255,255,0.2)' : '2px dashed rgba(0,0,0,0.5)',
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                Columna llena (3/3)
              </div>
            )}
          </div>
        </div>
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