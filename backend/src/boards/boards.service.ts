import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Column, ColumnDocument } from './schemas/column.schema';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';
import { BoardsGateway } from './boards.gateway';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private boardsGateway: BoardsGateway,
    private httpService: HttpService,
  ) {}

  // ============ EXPORT BACKLOG ============
  async exportBacklog(boardId: string): Promise<{ message: string }> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    const columns = await this.columnModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ position: 1 })
      .exec();

    console.log('📊 Columnas encontradas:', columns.length); // ✅ AGREGÁ ESTO

    const columnIds = columns.map((col) => col._id);
    const tasks = await this.taskModel
      .find({ columnId: { $in: columnIds } })
      .sort({ position: 1 })
      .exec();

    console.log('📝 Tareas encontradas:', tasks.length); // ✅ AGREGÁ ESTO
    console.log('🔍 Tareas:', JSON.stringify(tasks, null, 2)); // ✅ AGREGÁ ESTO

    // Preparar datos para N8N
    const exportData = tasks.map((task) => {
      const column = columns.find(
        (col) => col._id.toString() === task.columnId.toString(),
      );

      return {
        id: String(task._id),
        title: task.title,
        description: task.description || '',
        column: column?.title || 'Unknown',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : '',
        progress: task.progress || 0,
        createdAt: task.createdAt ? new Date(task.createdAt).toISOString() : '',
      };
    });

    // Enviar a N8N webhook
    const n8nWebhookUrl =
      process.env.N8N_WEBHOOK_URL ||
      'http://localhost:5678/webhook/kanban-export';
      
      console.log('🎯 URL de N8N:', n8nWebhookUrl);
      console.log('📦 Datos a enviar:', {
      boardTitle: board.title,
        totalTasks: exportData.length,
      tasks: exportData.length > 0 ? 'SÍ hay tareas' : 'NO hay tareas',
      });

    try {
      await firstValueFrom(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.httpService.post(n8nWebhookUrl, {
          boardTitle: board.title,
          totalTasks: exportData.length,
          tasks: exportData,
          exportDate: new Date().toISOString(),
        }),
      );

      return {
        message: `Exportación iniciada. ${exportData.length} tareas serán enviadas por email.`,
      };
    } catch (error) {
      console.error('Error al enviar a N8N:', error);
      throw new BadRequestException(
        'Error al procesar la exportación. Verifica que N8N esté corriendo.',
      );
    }
  }

  // Tableros
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new this.boardModel(createBoardDto);
    const savedBoard = await board.save();

    const toDoColumn = new this.columnModel({
      title: 'To Do',
      boardId: savedBoard._id,
      position: 0,
      isFixed: false,
    });

    const doneColumn = new this.columnModel({
      title: 'Done',
      boardId: savedBoard._id,
      position: 999,
      isFixed: true,
    });

    await toDoColumn.save();
    await doneColumn.save();

    this.boardsGateway.notifyBoardCreated(savedBoard);

    return savedBoard;
  }

  async findAllBoards(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async findBoardById(id: string): Promise<any> {
    const board = await this.boardModel.findById(id).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    const columns = await this.columnModel
      .find({ boardId: new Types.ObjectId(id) })
      .sort({ position: 1 })
      .exec();

    const columnIds = columns.map((col) => col._id);
    const tasks = await this.taskModel
      .find({ columnId: { $in: columnIds } })
      .sort({ position: 1 })
      .exec();

    const sortedColumns = this.sortColumnsWithDoneAtEnd(columns);

    const columnsWithTasks = sortedColumns.map((column) => {
      const columnId = column._id.toString();
      return {
        _id: column._id,
        title: column.title,
        boardId: column.boardId,
        position: column.position,
        isFixed: column.isFixed,
        createdAt: column.createdAt,
        updatedAt: column.updatedAt,
        tasks: tasks.filter((task) => task.columnId.toString() === columnId),
      };
    });

    return {
      _id: board._id,
      title: board.title,
      description: board.description,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      columns: columnsWithTasks,
    };
  }

  private sortColumnsWithDoneAtEnd(
    columns: ColumnDocument[],
  ): ColumnDocument[] {
    const doneColumn = columns.find((col) => col.title === 'Done');
    const otherColumns = columns
      .filter((col) => col.title !== 'Done')
      .sort((a, b) => a.position - b.position);

    return doneColumn ? [...otherColumns, doneColumn] : otherColumns;
  }

  async createColumn(
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<Column> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    if (createColumnDto.position === undefined) {
      const columns = await this.columnModel
        .find({ boardId })
        .sort({ position: 1 })
        .exec();

      const doneColumn = columns.find((col) => col.title === 'Done');
      if (doneColumn) {
        createColumnDto.position = doneColumn.position - 1;
      } else {
        createColumnDto.position = columns.length;
      }
    }

    const column = new this.columnModel({
      ...createColumnDto,
      boardId: new Types.ObjectId(boardId),
    });

    const savedColumn = await column.save();
    this.boardsGateway.notifyColumnCreated(boardId, savedColumn);

    return savedColumn;
  }

  async findColumnsByBoardId(boardId: string): Promise<Column[]> {
    return this.columnModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ position: 1 })
      .exec();
  }

  async deleteColumn(columnId: string): Promise<void> {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    if (column.isFixed || column.title === 'To Do') {
      throw new BadRequestException(
        'No se puede eliminar las columnas To Do y Done',
      );
    }

    const boardId = column.boardId.toString();

    await this.taskModel.deleteMany({ columnId: new Types.ObjectId(columnId) });
    await this.columnModel.findByIdAndDelete(columnId).exec();

    this.boardsGateway.notifyColumnDeleted(boardId, columnId);
  }

  async createTask(
    columnId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    if (createTaskDto.position === undefined) {
      const count = await this.taskModel.countDocuments({ columnId }).exec();
      createTaskDto.position = count;
    }

    const task = new this.taskModel({
      ...createTaskDto,
      columnId: new Types.ObjectId(columnId),
    });

    const savedTask = await task.save();

    this.boardsGateway.notifyTaskCreated(
      column.boardId.toString(),
      columnId,
      savedTask,
    );

    return savedTask;
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskModel
      .findByIdAndUpdate(taskId, updateTaskDto, { new: true })
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const column = await this.columnModel.findById(task.columnId).exec();

    if (column) {
      this.boardsGateway.notifyTaskUpdated(column.boardId.toString(), task);
    }

    return task;
  }

  async moveTask(
    taskId: string,
    newColumnId: string,
    newPosition: number,
  ): Promise<Task> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const oldColumnId = task.columnId.toString();
    const newColumnIdStr = newColumnId.toString();

    if (oldColumnId === newColumnIdStr) {
      const oldPosition = task.position;

      if (newPosition < oldPosition) {
        await this.taskModel.updateMany(
          {
            columnId: new Types.ObjectId(newColumnId),
            position: { $gte: newPosition, $lt: oldPosition },
          },
          { $inc: { position: 1 } },
        );
      } else if (newPosition > oldPosition) {
        await this.taskModel.updateMany(
          {
            columnId: new Types.ObjectId(newColumnId),
            position: { $gt: oldPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } },
        );
      }
    } else {
      await this.taskModel.updateMany(
        {
          columnId: new Types.ObjectId(oldColumnId),
          position: { $gt: task.position },
        },
        { $inc: { position: -1 } },
      );

      await this.taskModel.updateMany(
        {
          columnId: new Types.ObjectId(newColumnId),
          position: { $gte: newPosition },
        },
        { $inc: { position: 1 } },
      );
    }

    task.columnId = new Types.ObjectId(newColumnId);
    task.position = newPosition;

    const updatedTask = await task.save();
    const column = await this.columnModel.findById(newColumnId).exec();
    const taskObject = updatedTask.toObject();

    if (column) {
      this.boardsGateway.notifyTaskMoved(
        column.boardId.toString(),
        taskObject as Task,
      );
    }

    return taskObject as Task;
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = await this.taskModel.findById(taskId).exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    const columnId = task.columnId.toString();
    const column = await this.columnModel.findById(columnId).exec();

    await this.taskModel.findByIdAndDelete(taskId).exec();

    if (column) {
      this.boardsGateway.notifyTaskDeleted(
        column.boardId.toString(),
        columnId,
        taskId,
      );
    }
  }

  async findAllTasks(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }
}
