import { useState } from 'react';
import { Download } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';
import { ThemeToggle } from '../../ui/ThemeToggle';
import { Button } from '../../ui/Button';
import { boardsApi } from '../../services/api';
import toast from 'react-hot-toast';
import axios from 'axios';

interface HeaderProps {
  boardId: string;
  title: string;
  description?: string;
  isConnected: boolean;
}

export const Header = ({ boardId, title, description, isConnected }: HeaderProps) => {
  const { theme, isDark } = useThemeStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await boardsApi.exportBacklog(boardId);
      toast.success(response.message || 'Exportación iniciada. Recibirás un email con el CSV.');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Error al exportar backlog');
      } else {
        toast.error('Error inesperado al exportar');
      }
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header 
      className="border-b px-6 py-4"
      style={{ 
        backgroundColor: isDark ? theme.background.secondary : '#F9F5E3',
        borderColor: isDark ? theme.border : '#D4C5A0',
        borderWidth: '2px'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ 
              color: theme.text.primary,
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            📋 {title}
          </h1>
          {description && (
            <p 
              className="text-sm mt-1"
              style={{ 
                color: theme.text.secondary,
                fontFamily: '"Courier New", Courier, monospace'
              }}
            >
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Botón Exportar */}
          <Button
            onClick={handleExport}
            isLoading={isExporting}
            size="sm"
            variant="primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Backlog
          </Button>

          {/* Status de conexión */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ 
              backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `2px solid ${isConnected ? '#22c55e' : '#ef4444'}`
            }}
          >
            <div 
              className="w-2 h-2 rounded-full"
              style={{ 
                backgroundColor: isConnected ? '#22c55e' : '#ef4444',
                animation: isConnected ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            />
            <span 
              className="text-xs font-bold"
              style={{ 
                color: isConnected ? '#22c55e' : '#ef4444',
                fontFamily: '"Courier New", Courier, monospace'
              }}
            >
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};