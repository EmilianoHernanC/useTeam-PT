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

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private boardsGateway: BoardsGateway,
  ) {}

  // Tableros
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new this.boardModel(createBoardDto);
    const savedBoard = await board.save();

    // Crear columnas fijas automáticamente
    const toDoColumn = new this.columnModel({
      title: 'To Do',
      boardId: savedBoard._id,
      position: 999,
      isFixed: true,
    });

    const doneColumn = new this.columnModel({
      title: 'Done',
      boardId: savedBoard._id,
      position: 1,
      isFixed: true,
    });

    await toDoColumn.save();
    await doneColumn.save();

    // Notificar a todos los clientes conectados
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

    const columnsWithTasks = columns.map((column) => {
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

  // Columnas
  async createColumn(
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<Column> {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    if (createColumnDto.position === undefined) {
      const count = await this.columnModel.countDocuments({ boardId }).exec();
      createColumnDto.position = count;
    }

    const column = new this.columnModel({
      ...createColumnDto,
      boardId: new Types.ObjectId(boardId),
    });

    const savedColumn = await column.save();

    // Notificar en tiempo real
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

    // Validar si es columna fija
    if (column.isFixed) {
      throw new BadRequestException(
        'Cannot delete fixed columns (To Do / Done)',
      );
    }

    const boardId = column.boardId.toString();

    // Eliminar todas las tareas de la columna
    await this.taskModel.deleteMany({ columnId: new Types.ObjectId(columnId) });

    // Eliminar la columna
    await this.columnModel.findByIdAndDelete(columnId).exec();

    // Notificar en tiempo real
    this.boardsGateway.notifyColumnDeleted(boardId, columnId);
  }

  // Tareas
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

    // Notificar en tiempo real
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

    // Obtener la columna para saber el boardId
    const column = await this.columnModel.findById(task.columnId).exec();

    // Notificar en tiempo real
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

    // Si se mueve a la misma columna
    if (oldColumnId === newColumnIdStr) {
      const oldPosition = task.position;

      // Reordenar tareas en la misma columna
      if (newPosition < oldPosition) {
        // Mover hacia arriba: incrementar position de las tareas entre newPosition y oldPosition
        await this.taskModel.updateMany(
          {
            columnId: new Types.ObjectId(newColumnId),
            position: { $gte: newPosition, $lt: oldPosition },
          },
          { $inc: { position: 1 } },
        );
      } else if (newPosition > oldPosition) {
        // Mover hacia abajo: decrementar position de las tareas entre oldPosition y newPosition
        await this.taskModel.updateMany(
          {
            columnId: new Types.ObjectId(newColumnId),
            position: { $gt: oldPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } },
        );
      }
    } else {
      // Mover a otra columna
      // Decrementar position de las tareas después de la posición antigua
      await this.taskModel.updateMany(
        {
          columnId: new Types.ObjectId(oldColumnId),
          position: { $gt: task.position },
        },
        { $inc: { position: -1 } },
      );

      // Incrementar position de las tareas después de la nueva posición
      await this.taskModel.updateMany(
        {
          columnId: new Types.ObjectId(newColumnId),
          position: { $gte: newPosition },
        },
        { $inc: { position: 1 } },
      );
    }

    // Actualizar la tarea movida
    task.columnId = new Types.ObjectId(newColumnId);
    task.position = newPosition;

    const updatedTask = await task.save();

    // Obtener el boardId
    const column = await this.columnModel.findById(newColumnId).exec();

    // Convertir a objeto plano
    const taskObject = updatedTask.toObject();

    // Notificar en tiempo real
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

    // Obtener el boardId antes de eliminar
    const column = await this.columnModel.findById(columnId).exec();

    // Eliminar la tarea
    await this.taskModel.findByIdAndDelete(taskId).exec();

    // Notificar en tiempo real
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
