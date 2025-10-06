import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { Column as ColumnType } from '../../types';
import { Task } from './Task';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { tasksApi } from '../../services/api';
import { useThemeStore } from '../../store/useThemeStore';
import toast from 'react-hot-toast';

interface ColumnProps {
  column: ColumnType;
  onDeleteColumn: (columnId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const Column = ({ column, onDeleteColumn, onDeleteTask }: ColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useThemeStore();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsLoading(true);
    try {
      await tasksApi.create(column._id, {
        title: newTaskTitle,
      });
      setNewTaskTitle('');
      setIsAddingTask(false);
      toast.success('Tarea creada');
    } catch (error) {
      toast.error('Error al crear tarea');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

      {/* Tasks */}
      <div className="space-y-2 mb-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {column.tasks.map((task, index) => (
          <Task 
            key={task._id} 
            task={task} 
            onDelete={onDeleteTask} 
            index={index} 
          />
        ))}
      </div>

      {/* Add Task */}
      {isAddingTask ? (
        <div className="space-y-2">
          <Input
            placeholder="Título de la tarea"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }
            }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAddTask}
              isLoading={isLoading}
              disabled={!newTaskTitle.trim()}
            >
              Agregar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
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
      )}
    </div>
  );
};