import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

interface AddColumnButtonProps {
  onAddColumn: (title: string) => Promise<void>;
  isLoading: boolean;
}

export const AddColumnButton = ({ onAddColumn, isLoading }: AddColumnButtonProps) => {
  const { theme } = useThemeStore();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleAdd = async () => {
    if (!title.trim()) return;
    
    await onAddColumn(title);
    setTitle('');
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTitle('');
  };

  if (isAdding) {
    return (
      <div 
        className="rounded-2xl p-4 w-80 border-2 shadow-lg flex-shrink-0"
        style={{ 
          backgroundColor: '#F9F5E3',
          borderColor: '#D4C5A0',
        }}
      >
        <Input
          placeholder="Nombre de la columna"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
          style={{
            fontFamily: '"Courier New", Courier, monospace',
          }}
        />
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="primary"
            onClick={handleAdd}
            isLoading={isLoading}
            disabled={!title.trim()}
          >
            Agregar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all w-80 border-2 border-dashed hover:scale-[1.02] flex-shrink-0"
      style={{ 
        backgroundColor: 'rgba(249, 245, 227, 0.5)',
        borderColor: '#D4C5A0',
        color: theme.text.secondary,
        fontFamily: '"Courier New", Courier, monospace'
      }}
    >
      <Plus className="w-5 h-5" />
      Agregar columna
    </button>
  );
};