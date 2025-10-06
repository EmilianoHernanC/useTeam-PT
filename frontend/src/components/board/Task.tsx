import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task as TaskType } from '../../types';
import { useThemeStore } from '../../store/useThemeStore';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
  index: number;
}

export const Task = ({ task, onDelete }: TaskProps) => {
  const { theme } = useThemeStore();
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group"
    >
      <div 
        className="rounded-xl p-3 border-2 transition-all"
        style={{ 
          backgroundColor: isDragging ? theme.background.hover : theme.background.tertiary,
          borderColor: isDragging ? theme.accent.primary : theme.border,
          boxShadow: isDragging ? `0 8px 24px ${theme.shadow}` : 'none',
          transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {/* Área de agarre - IMPORTANTE */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-black/5 rounded transition-colors"
              style={{ touchAction: 'none' }}
            >
              <GripVertical 
                className="w-4 h-4" 
                style={{ color: theme.text.tertiary }}
              />
            </div>
            
            <p 
              className="text-sm flex-1"
              style={{ color: theme.text.primary }}
            >
              {task.title}
            </p>
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

        {task.description && (
          <p 
            className="text-xs mt-2 ml-7"
            style={{ color: theme.text.secondary }}
          >
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};