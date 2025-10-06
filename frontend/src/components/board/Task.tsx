import { Trash2, GripVertical } from 'lucide-react';
import { Card } from '../../ui/Card';
import type{ Task as TaskType } from '../../types';

interface TaskProps {
  task: TaskType;
  onDelete: (taskId: string) => void;
}

export const Task = ({ task, onDelete }: TaskProps) => {
  return (
    <Card hover className="p-3 mb-2 cursor-move group">
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-500 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-slate-100 mb-1">
            {task.title}
          </h4>
          
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500">
              {new Date(task.createdAt).toLocaleDateString('es-AR')}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/10 rounded"
          title="Eliminar tarea"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </Card>
  );
};