import { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task as TaskType } from '../../types';
import { useThemeStore } from '../../store/useThemeStore';
import { TaskModal, type TaskFormData } from './TaskModal';
import { tasksApi, boardsApi } from '../../services/api';
import { useBoardStore } from '../../store/useBoardStore';
import toast from 'react-hot-toast';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
  index: number;
}

export const Task = ({ task, onDelete }: TaskProps) => {
  const { theme } = useThemeStore();
  const { board, setBoard } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleEditTask = async (taskData: TaskFormData) => {
    try {
      await tasksApi.update(task._id, taskData);
      
      if (board) {
        const updatedBoard = await boardsApi.getById(board._id);
        setBoard(updatedBoard);
      }
      
      toast.success('Tarea actualizada');
    } catch (error) {
      toast.error('Error al actualizar tarea');
      console.error(error);
    }
  };

  const priorityConfig = {
    low: { 
      color: '#22c55e',
      glow: '0 0 15px rgba(34, 197, 94, 0.6)'
    },
    medium: { 
      color: '#eab308',
      glow: '0 0 15px rgba(234, 179, 8, 0.6)'
    },
    high: { 
      color: '#ef4444',
      glow: '0 0 15px rgba(239, 68, 68, 0.6)'
    },
  };

  const priority = task.priority || 'medium';
  const config = priorityConfig[priority];

  const getProgressColor = (progress: number) => {
    if (progress < 50) return '#ef4444';
    if (progress < 70) return '#eab308';
    return '#22c55e';
  };

  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: ${config.glow};
          }
          50% {
            box-shadow: 0 0 25px ${config.color}80;
          }
        }
      `}</style>

      <div
        ref={setNodeRef}
        style={style}
        className="group"
      >
        <div 
          className="rounded-xl p-3 transition-all cursor-pointer"
          style={{ 
            backgroundColor: isDragging ? theme.background.hover : theme.background.tertiary,
            border: `2px solid ${config.color}`,
            boxShadow: isDragging ? `0 8px 24px ${theme.shadow}` : config.glow,
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <div 
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-black/5 rounded transition-colors"
                style={{ touchAction: 'none' }}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical 
                  className="w-4 h-4" 
                  style={{ color: theme.text.tertiary }}
                />
              </div>
              
              <div className="flex-1">
                <p 
                  className="text-sm font-medium"
                  style={{ color: theme.text.primary }}
                >
                  {task.title}
                </p>
                
                {task.description && (
                  <p 
                    className="text-xs mt-1"
                    style={{ color: theme.text.secondary }}
                  >
                    {task.description.substring(0, 60)}
                    {task.description.length > 60 && '...'}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {task.dueDate && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: theme.background.hover,
                        color: theme.text.secondary 
                      }}
                    >
                      📅 {new Date(task.dueDate).toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>

                {task.progress !== undefined && task.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: theme.text.secondary }}>
                        Progreso
                      </span>
                      <span 
                        className="text-xs font-bold"
                        style={{ color: getProgressColor(task.progress) }}
                      >
                        {task.progress}%
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: theme.background.hover }}
                    >
                      <div 
                        className="h-full transition-all duration-300 rounded-full"
                        style={{ 
                          width: `${task.progress}%`,
                          backgroundColor: getProgressColor(task.progress)
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task._id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
              title="Eliminar tarea"
            >
              <Trash2 className="w-4 h-4" style={{ color: theme.accent.danger }} />
            </button>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleEditTask}
        task={task}
        mode="edit"
      />
    </>
  );
};