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
  const { theme } = useThemeStore();
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
        setIsExporting(false); // ✅ Esto debería ejecutarse siempre
    }
};

  return (
    <header 
      className="border-b px-6 py-4"
      style={{ 
        backgroundColor: theme.background.secondary,
        borderColor: theme.border 
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: theme.text.primary }}
          >
            {title}
          </h1>
          {description && (
            <p 
              className="text-sm mt-1"
              style={{ color: theme.text.secondary }}
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
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar Backlog
          </Button>

          {/* Status de conexión */}
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ backgroundColor: `${theme.accent.success}20` }}
          >
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: theme.accent.success }}
            ></div>
            <span 
              className="text-sm font-medium"
              style={{ color: theme.accent.success }}
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