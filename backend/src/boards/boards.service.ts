import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { Column, ColumnDocument } from './schemas/column.schema';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board.name) private boardModel: Model<BoardDocument>,
    @InjectModel(Column.name) private columnModel: Model<ColumnDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
  ) {}

  // ============ BOARDS ============
  async createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const board = new this.boardModel(createBoardDto);
    return board.save();
  }

  async findAllBoards(): Promise<Board[]> {
    return this.boardModel.find().exec();
  }

  async findBoardById(id: string): Promise<any> {
    // Obtener el board
    const board = await this.boardModel.findById(id).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // Obtener todas las columnas del board
    const columns = await this.columnModel
      .find({ boardId: new Types.ObjectId(id) })
      .sort({ position: 1 })
      .exec();

    // Obtener todas las tareas de esas columnas
    const columnIds = columns.map((col) => col._id);
    const tasks = await this.taskModel
      .find({ columnId: { $in: columnIds } })
      .sort({ position: 1 })
      .exec();

    // Organizar las tareas por columna
    const columnsWithTasks = columns.map((column) => ({
      ...column.toObject(),
      tasks: tasks.filter(
        (task) => task.columnId.toString() === column._id.toString(),
      ),
    }));

    return {
      ...board.toObject(),
      columns: columnsWithTasks,
    };
  }

  // ============ COLUMNS ============
  async createColumn(
    boardId: string,
    createColumnDto: CreateColumnDto,
  ): Promise<Column> {
    // Verificar que el board existe
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    // Si no se proporciona position, usar el último + 1
    if (createColumnDto.position === undefined) {
      const count = await this.columnModel.countDocuments({ boardId }).exec();
      createColumnDto.position = count;
    }

    const column = new this.columnModel({
      ...createColumnDto,
      boardId: new Types.ObjectId(boardId),
    });

    return column.save();
  }

  async findColumnsByBoardId(boardId: string): Promise<Column[]> {
    return this.columnModel
      .find({ boardId: new Types.ObjectId(boardId) })
      .sort({ position: 1 })
      .exec();
  }

  async deleteColumn(columnId: string): Promise<void> {
    // Eliminar todas las tareas de la columna
    await this.taskModel.deleteMany({ columnId: new Types.ObjectId(columnId) });

    // Eliminar la columna
    const result = await this.columnModel.findByIdAndDelete(columnId).exec();
    if (!result) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }
  }

  // ============ TASKS ============
  async createTask(
    columnId: string,
    createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    // Verificar que la columna existe
    const column = await this.columnModel.findById(columnId).exec();
    if (!column) {
      throw new NotFoundException(`Column with ID ${columnId} not found`);
    }

    // Si no se proporciona position, usar el último + 1
    if (createTaskDto.position === undefined) {
      const count = await this.taskModel.countDocuments({ columnId }).exec();
      createTaskDto.position = count;
    }

    const task = new this.taskModel({
      ...createTaskDto,
      columnId: new Types.ObjectId(columnId),
    });

    return task.save();
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

    // Actualizar la tarea
    task.columnId = new Types.ObjectId(newColumnId);
    task.position = newPosition;

    return task.save();
  }

  async deleteTask(taskId: string): Promise<void> {
    const result = await this.taskModel.findByIdAndDelete(taskId).exec();
    if (!result) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
  }

  async findAllTasks(): Promise<Task[]> {
    return this.taskModel.find().exec();
  }
}
