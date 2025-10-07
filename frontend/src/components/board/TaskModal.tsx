import { useState, useEffect } from 'react';
import { X, Calendar, Flag, TrendingUp } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import type { Task } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => void;
  task?: Task | null;
  mode: 'create' | 'edit';
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  progress?: number;
}

export const TaskModal = ({ isOpen, onClose, onSave, task, mode }: TaskModalProps) => {
  const { theme } = useThemeStore();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    progress: 0,
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        progress: task.progress || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        progress: 0,
      });
    }
  }, [task, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    // Ajustar la fecha para evitar problemas de zona horaria
    const dataToSend = {
      ...formData,
      dueDate: formData.dueDate 
        ? new Date(formData.dueDate + 'T12:00:00').toISOString() 
        : undefined,
    };
    
    onSave(dataToSend);
    onClose();
  };

  if (!isOpen) return null;

  const priorityColors = {
    low: { bg: '#d1fae5', text: '#065f46', label: 'Baja prioridad' },
    medium: { bg: '#fef3c7', text: '#92400e', label: 'Normal' },
    high: { bg: '#fee2e2', text: '#991b1b', label: 'Urgente' },
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: theme.background.secondary,
          border: `2px solid ${theme.border}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: theme.border }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ color: theme.text.primary }}
          >
            {mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme.text.secondary }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Título */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              Título <span style={{ color: theme.accent.danger }}>*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Diseñar landing page"
              required
              autoFocus
            />
          </div>

          {/* Descripción - Estilo libreta */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              Descripción
            </label>
            <div className="relative">
            <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Escribe los detalles de la tarea..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none transition-all font-mono"
                style={{
                backgroundColor: theme.background.tertiary,
                borderColor: theme.border,
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: '14px',
                paddingTop: '3px',
                paddingBottom: '10px',
                backgroundImage: `repeating-linear-gradient(
                    transparent,
                    transparent 31px,
                    ${theme.border} 31px,
                    ${theme.border} 32px
                )`,
                lineHeight: '32px',
                backgroundAttachment: 'local',
                }}
                onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.accent.primary;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.accent.primary}33`;
                }}
                onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.boxShadow = 'none';
                }}
            />
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label 
              className="block text-sm font-medium mb-3"
              style={{ color: theme.text.primary }}
            >
              <Flag className="w-4 h-4 inline mr-1" />
              Prioridad
            </label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className="flex-1 px-4 py-2 rounded-xl font-medium transition-all"
                  style={{
                    backgroundColor: formData.priority === priority 
                      ? priorityColors[priority].bg 
                      : theme.background.tertiary,
                    color: formData.priority === priority
                      ? priorityColors[priority].text
                      : theme.text.secondary,
                    border: `2px solid ${
                      formData.priority === priority 
                        ? priorityColors[priority].text 
                        : theme.border
                    }`,
                  }}
                >
                  {priorityColors[priority].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha límite */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text.primary }}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha límite
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: theme.background.tertiary,
                borderColor: theme.border,
                color: theme.text.primary,
              }}
            />
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                className="text-sm font-medium"
                style={{ color: theme.text.primary }}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Progreso
              </label>
              <span 
                className="text-sm font-bold"
                style={{ color: theme.accent.primary }}
              >
                {formData.progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${theme.accent.primary} 0%, ${theme.accent.primary} ${formData.progress}%, ${theme.background.tertiary} ${formData.progress}%, ${theme.background.tertiary} 100%)`,
              }}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.title.trim()}
            >
              {mode === 'create' ? 'Crear Tarea' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};