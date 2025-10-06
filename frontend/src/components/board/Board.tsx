import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useSocket } from '../../hooks/useSocket';
import { boardsApi, columnsApi, tasksApi } from '../../services/api';
import { Column } from './Column';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import toast from 'react-hot-toast';

export const Board = () => {
  const { board, setBoard, setLoading, removeColumn } = useBoardStore();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isLoadingColumn, setIsLoadingColumn] = useState(false);

  // Conectar WebSocket
  useSocket(board?._id || null);

  // Cargar el board al montar
  useEffect(() => {
    const loadBoard = async () => {
      setLoading(true);
      try {
        // Obtener todos los boards
        const boards = await boardsApi.getAll();
        
        if (boards.length > 0) {
          // Cargar el primer board con sus columnas y tareas
          const fullBoard = await boardsApi.getById(boards[0]._id);
          setBoard(fullBoard);
        } else {
          // Crear un board por defecto si no existe ninguno
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-slate-400 mt-1">{board.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Conectado</span>
            </div>
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
              <div className="bg-slate-800/50 rounded-lg p-4 w-80">
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
                className="flex items-center gap-2 px-4 py-3 bg-slate-800/30 hover:bg-slate-800/50 text-slate-400 hover:text-slate-300 rounded-lg transition-colors w-80"
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