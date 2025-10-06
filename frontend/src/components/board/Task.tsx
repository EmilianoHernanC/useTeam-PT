import { Trash2, GripVertical, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import type{ Task as TaskType } from '../../types';
import { useThemeStore } from '../../store/useThemeStore';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
  index: number;
}

export const Task = ({ task, onDelete, index }: TaskProps) => {
  const { theme } = useThemeStore();

  const formatDate = (date: string) => {
    const taskDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - taskDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return taskDate.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <Card hover className="p-4 mb-3 group">
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" style={{ color: theme.text.tertiary }} />
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h4 
              className="text-sm font-semibold mb-1.5 leading-snug"
              style={{ color: theme.text.primary }}
            >
              {task.title}
            </h4>
            
            {task.description && (
              <p 
                className="text-xs mb-2 line-clamp-2 leading-relaxed"
                style={{ color: theme.text.secondary }}
              >
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  color: theme.text.secondary 
                }}
              >
                <Calendar className="w-3 h-3" />
                {formatDate(task.createdAt)}
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg"
            style={{ 
              backgroundColor: `${theme.accent.danger}15`,
              color: theme.accent.danger 
            }}
            title="Eliminar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
};