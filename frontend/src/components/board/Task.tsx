import { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task as TaskType } from '../../types';
import { useThemeStore } from '../../store/useThemeStore';
import { TaskModal, type TaskFormData } from './TaskModal';
import { tasksApi } from '../../services/api';
import toast from 'react-hot-toast';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
  index: number;
}

export const Task = ({ task, onDelete }: TaskProps) => {
  const { theme } = useThemeStore();
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
      toast.success('Tarea actualizada');
    } catch (error) {
      toast.error('Error al actualizar tarea');
      console.error(error);
    }
  };

  const priorityColors = {
    low: '#d1fae5',
    medium: '#fef3c7',
    high: '#fee2e2',
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group"
      >
        <div 
          className="rounded-xl p-3 border-2 transition-all cursor-pointer"
          style={{ 
            backgroundColor: isDragging ? theme.background.hover : theme.background.tertiary,
            borderColor: isDragging ? theme.accent.primary : theme.border,
            boxShadow: isDragging ? `0 8px 24px ${theme.shadow}` : 'none',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            borderLeftWidth: '4px',
            borderLeftColor: task.priority ? priorityColors[task.priority] : theme.border,
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1">
              {/* Área de agarre */}
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

                {/* Metadata */}
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
                  
                  {task.progress !== undefined && task.progress > 0 && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ 
                        backgroundColor: theme.background.hover,
                        color: theme.text.secondary 
                      }}
                    >
                      📊 {task.progress}%
                    </span>
                  )}
                </div>
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

      {/* Edit Modal */}
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