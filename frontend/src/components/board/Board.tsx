import { useEffect, useState } from 'react';
import { GripVertical } from 'lucide-react';
import { useBoardStore } from '../../store/useBoardStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useSocket } from '../../hooks/useSocket';
import { boardsApi, columnsApi, tasksApi } from '../../services/api';
import { Column } from './Column';
import { AddColumnButton } from './AddColumnButton';
import { Header } from '../Layout/Header';
import toast from 'react-hot-toast';
import { 
  DndContext,
  PointerSensor,
  DragOverlay, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import type { Column as ColumnType, Task } from '../../types';

export const Board = () => {
  const { board, setBoard, setLoading, removeColumn } = useBoardStore();
  const { theme } = useThemeStore();
  const [isLoadingColumn, setIsLoadingColumn] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const socket = useSocket(board?._id || null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
        delay: 100, 
        tolerance: 5,
      },
    })
  );

  const activeTask = activeId 
    ? board?.columns
        .flatMap(col => col.tasks)
        .find(task => task._id === activeId)
    : null;

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

  const handleAddColumn = async (title: string) => {
    if (!board) return;

    setIsLoadingColumn(true);
    try {
      await columnsApi.create(board._id, { title });
      
      const updatedBoard = await boardsApi.getById(board._id);
      setBoard(updatedBoard);
      
      toast.success('Columna creada');
    } catch (error) {
      toast.error('Error al crear columna');
      console.error(error);
    } finally {
      setIsLoadingColumn(false);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    const column = board?.columns.find(col => col._id === columnId);
    
    if (column?.isFixed) {
      toast.error('No se pueden eliminar las columnas fijas (To Do / Done)');
      return;
    }

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !board) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    let sourceColumn: ColumnType | undefined;
    let activeTask: Task | undefined;
    
    for (const col of board.columns) {
      const task = col.tasks.find(t => t._id === activeTaskId);
      if (task) {
        sourceColumn = col;
        activeTask = task;
        break;
      }
    }

    if (!activeTask || !sourceColumn) {
      setActiveId(null);
      return;
    }

    let targetColumn: ColumnType | undefined;
    let newPosition = 0;

    targetColumn = board.columns.find(col => col._id === overId);
    
    if (targetColumn) {
      newPosition = targetColumn.tasks.length;
      
      if (targetColumn._id === sourceColumn._id) {
        newPosition = Math.max(0, newPosition - 1);
      }
    } else {
      for (const col of board.columns) {
        const taskIndex = col.tasks.findIndex(t => t._id === overId);
        if (taskIndex !== -1) {
          targetColumn = col;
          newPosition = taskIndex;
          break;
        }
      }
    }

    if (!targetColumn) {
      setActiveId(null);
      return;
    }

    const currentPosition = sourceColumn.tasks.findIndex(t => t._id === activeTaskId);
    if (targetColumn._id === sourceColumn._id && newPosition === currentPosition) {
      setActiveId(null);
      return;
    }

    try {
      await tasksApi.move(activeTaskId, {
        columnId: targetColumn._id,
        position: newPosition,
      });
      
      const updatedBoard = await boardsApi.getById(board._id);
      setBoard(updatedBoard);
      
      toast.success('Tarea movida');
    } catch (error) {
      toast.error('Error al mover tarea');
      console.error(error);
    }

    setActiveId(null);
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
          <p 
            style={{ 
              color: theme.text.secondary,
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            Cargando tablero...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div 
        className="h-screen flex flex-col"
        style={{ backgroundColor: theme.background.primary }}
      >
        {/* Header */}
        <Header 
          boardId={board._id}
          title={board.title}
          description={board.description}
          isConnected={socket?.isConnected || false}
        />

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
            <AddColumnButton 
              onAddColumn={handleAddColumn}
              isLoading={isLoadingColumn}
            />
          </div>
        </div>
      </div>

      {/* DragOverlay */}
      <DragOverlay>
        {activeTask ? (
          <div 
            className="rounded-xl p-3 border-2 rotate-3 opacity-90"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderColor: '#D4C5A0',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              width: '288px',
            }}
          >
            <div className="flex items-start gap-2">
              <GripVertical 
                className="w-4 h-4 mt-0.5" 
                style={{ color: theme.text.tertiary }}
              />
              <p 
                className="text-sm flex-1 font-bold" 
                style={{ 
                  color: theme.text.primary,
                  fontFamily: '"Courier New", Courier, monospace'
                }}
              >
                {activeTask.title}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};