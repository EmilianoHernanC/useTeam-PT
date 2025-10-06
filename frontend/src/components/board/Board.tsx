import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useSocket } from '../../hooks/useSocket';
import { boardsApi, columnsApi, tasksApi } from '../../services/api';
import { Column } from './Column';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { ThemeToggle } from '../../ui/ThemeToggle';
import toast from 'react-hot-toast';

export const Board = () => {
  const { board, setBoard, setLoading, removeColumn } = useBoardStore();
  const { theme } = useThemeStore();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isLoadingColumn, setIsLoadingColumn] = useState(false);

  useSocket(board?._id || null);

  useEffect(() => {
    const loadBoard = async () => {
      setLoading(true);
      try {
        const boards = await boardsApi.getAll();
        
        if (boards.length > 0) {
          const fullBoard = await boardsApi.getById(boards[0]._id);
          setBoard(fullBoard);
        } else {
          const newBoard = await boardsApi.create({
            title: 'Mi Tablero Kanban',
            description: 'Tablero de trabajo',
          });
          const fullBoard = await boardsApi.getById(newBoard._id);
          setBoard(fullBoard);
        }
      } catch (error) {
        console.error('Error loading board:', error);
        toast.error('Error al cargar el tablero');
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [setBoard, setLoading]);

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !board) return;

    setIsLoadingColumn(true);
    try {
      await columnsApi.create(board._id, {
        title: newColumnTitle,
      });
      setNewColumnTitle('');
      setIsAddingColumn(false);
      toast.success('Columna creada');
    } catch (error) {
      toast.error('Error al crear columna');
      console.error(error);
    } finally {
      setIsLoadingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta columna y todas sus tareas?')) {
      return;
    }

    try {
      await columnsApi.delete(columnId);
      removeColumn(columnId);
      toast.success('Columna eliminada');
    } catch (error) {
      toast.error('Error al eliminar columna');
      console.error(error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      toast.success('Tarea eliminada');
    } catch (error) {
      toast.error('Error al eliminar tarea');
      console.error(error);
    }
  };

  if (!board) {
    return (
      <div 
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: theme.background.primary }}
      >
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: theme.accent.primary }}
          ></div>
          <p style={{ color: theme.text.secondary }}>Cargando tablero...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="h-screen flex flex-col"
      style={{ backgroundColor: theme.background.primary }}
    >
      {/* Header */}
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
              {board.title}
            </h1>
            {board.description && (
              <p 
                className="text-sm mt-1"
                style={{ color: theme.text.secondary }}
              >
                {board.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
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
                Conectado
              </span>
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-4 h-full">
          {/* Columns */}
          {board.columns.map((column) => (
            <Column
              key={column._id}
              column={column}
              onDeleteColumn={handleDeleteColumn}
              onDeleteTask={handleDeleteTask}
            />
          ))}

          {/* Add Column Button */}
          <div className="flex-shrink-0">
            {isAddingColumn ? (
              <div 
                className="rounded-2xl p-4 w-80 border-2"
                style={{ 
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border 
                }}
              >
                <Input
                  placeholder="Nombre de la columna"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn();
                    if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleAddColumn}
                    isLoading={isLoadingColumn}
                    disabled={!newColumnTitle.trim()}
                  >
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all w-80 border-2 border-dashed hover:scale-[1.02]"
                style={{ 
                  backgroundColor: theme.background.tertiary,
                  borderColor: theme.border,
                  color: theme.text.secondary 
                }}
              >
                <Plus className="w-5 h-5" />
                Agregar columna
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};