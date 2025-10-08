import { useState, useEffect } from 'react';
// import { createPortal } from 'react-dom';
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
  startDate?: string;
  dueDate?: string;
  progress?: number;
}

export const TaskModal = ({ isOpen, onClose, onSave, task, mode }: TaskModalProps) => {
  const { theme } = useThemeStore();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    progress: 0,
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority || 'medium',
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        progress: task.progress || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        progress: 0,
      });
    }
  }, [task, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    const dataToSend = {
      ...formData,
      startDate: formData.startDate 
        ? new Date(formData.startDate + 'T12:00:00').toISOString() 
        : undefined,
      dueDate: formData.dueDate 
        ? new Date(formData.dueDate + 'T12:00:00').toISOString() 
        : undefined,
    };
    
    onSave(dataToSend);
    onClose();
  };

  if (!isOpen) return null;

  const priorityColors = {
    low: { border: '#22c55e', label: 'Baja prioridad' },
    medium: { border: '#eab308', label: 'Normal' },
    high: { border: '#ef4444', label: 'Urgente' },
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 99999 // ✅ Aumentado para estar por encima de TODO
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ 
          backgroundColor: '#F9F5E3',
          border: '3px solid #D4C5A0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b-2"
          style={{ borderColor: '#D4C5A0' }}
        >
          <h2 
            className="text-2xl font-bold"
            style={{ 
              color: theme.text.primary,
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            {mode === 'create' ? '📝 Nueva Tarea' : '✏️ Editar Tarea'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: theme.text.primary }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label 
              className="block text-sm font-bold mb-2"
              style={{ 
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace'
              }}
            >
              Título <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Diseñar landing page"
              required
              autoFocus
              style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderColor: '#D4C5A0',
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace',
                border: '2px solid #D4C5A0',
              }}
            />
          </div>

          {/* Descripción */}
          <div>
            <label 
              className="block text-sm font-bold mb-2"
              style={{ 
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace'
              }}
            >
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detalles de la tarea..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none transition-all"
              style={{
                backgroundColor: 'rgba(255,255,255,0.6)',
                borderColor: '#D4C5A0',
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace',
                lineHeight: '24px',
              }}
            />
          </div>

          {/* Prioridad */}
          <div>
            <label 
              className="block text-sm font-bold mb-3"
              style={{ 
                color: theme.text.primary,
                fontFamily: '"Courier New", Courier, monospace'
              }}
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
                  className="flex-1 px-4 py-2 rounded-xl font-bold transition-all"
                  style={{
                    backgroundColor: formData.priority === priority 
                      ? 'rgba(0,0,0,0.1)' 
                      : 'rgba(255,255,255,0.6)',
                    color: theme.text.primary,
                    border: `3px solid ${
                      formData.priority === priority 
                        ? priorityColors[priority].border 
                        : '#D4C5A0'
                    }`,
                    fontFamily: '"Courier New", Courier, monospace',
                  }}
                >
                  {priorityColors[priority].label}
                </button>
              ))}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                className="block text-sm font-bold mb-2"
                style={{ 
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Inicio (opcional)
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderColor: '#D4C5A0',
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace',
                }}
              />
            </div>

            <div>
              <label 
                className="block text-sm font-bold mb-2"
                style={{ 
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Vencimiento (opcional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.6)',
                  borderColor: '#D4C5A0',
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace',
                }}
              />
            </div>
          </div>

          {/* Progreso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                className="text-sm font-bold"
                style={{ 
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Progreso
              </label>
              <span 
                className="text-sm font-bold"
                style={{ 
                  color: '#08298d',
                  fontFamily: '"Courier New", Courier, monospace'
                }}
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
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #08298d 0%, #08298d ${formData.progress}%, rgba(0,0,0,0.1) ${formData.progress}%, rgba(0,0,0,0.1) 100%)`,
              }}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              disabled={!formData.title.trim()}
              className="flex-1"
              style={{ 
                background: '#08298d',
                border: '2px solid #08298d',
                fontFamily: '"Courier New", Courier, monospace',
              }}
            >
              {mode === 'create' ? '✅ Crear Tarea' : '💾 Guardar Cambios'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: theme.text.primary,
                border: '2px solid #D4C5A0',
                fontFamily: '"Courier New", Courier, monospace',
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};