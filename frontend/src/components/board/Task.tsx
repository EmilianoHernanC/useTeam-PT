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
  const { theme, isDark } = useThemeStore();
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
      label: 'Baja'
    },
    medium: { 
      color: '#eab308',
      label: 'Media'
    },
    high: { 
      color: '#ef4444',
      label: 'Alta'
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
      <div
        ref={setNodeRef}
        style={style}
        className="group"
      >
        <div 
          className="rounded-xl p-3 transition-all cursor-pointer"
          style={{ 
            backgroundColor: isDark 
              ? theme.background.tertiary  // En dark mode: #2d2d2d (gris oscuro)
              : 'rgba(255, 255, 255, 0.6)', // En light mode: blanco semi-transparente
            border: `2px solid ${config.color}`,
            boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              <div 
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded transition-colors"
                style={{ 
                  touchAction: 'none',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical 
                  className="w-4 h-4" 
                  style={{ color: theme.text.tertiary }}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p 
                    className="text-sm font-medium flex-1"
                    style={{ 
                      color: theme.text.primary,
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {task.title}
                  </p>
                </div>
                
                {task.description && (
                  <p 
                    className="text-xs mt-1"
                    style={{ 
                      color: theme.text.secondary,
                      fontFamily: '"Courier New", Courier, monospace'
                    }}
                  >
                    {task.description.substring(0, 60)}
                    {task.description.length > 60 && '...'}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {task.startDate && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: theme.text.secondary,
                        fontFamily: '"Courier New", Courier, monospace'
                      }}
                    >
                      🟢 {new Date(task.startDate).toLocaleDateString('es-AR')}
                    </span>
                  )}
                  
                  {task.dueDate && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                        color: theme.text.secondary,
                        fontFamily: '"Courier New", Courier, monospace'
                      }}
                    >
                      🔴 {new Date(task.dueDate).toLocaleDateString('es-AR')}
                    </span>
                  )}
                </div>

                {task.progress !== undefined && task.progress > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className="text-xs" 
                        style={{ 
                          color: theme.text.secondary,
                          fontFamily: '"Courier New", Courier, monospace'
                        }}
                      >
                        Progreso
                      </span>
                      <span 
                        className="text-xs font-bold"
                        style={{ 
                          color: getProgressColor(task.progress),
                          fontFamily: '"Courier New", Courier, monospace'
                        }}
                      >
                        {task.progress}%
                      </span>
                    </div>
                    <div 
                      className="h-2 rounded-full overflow-hidden"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' 
                      }}
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
              className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
              style={{
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
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