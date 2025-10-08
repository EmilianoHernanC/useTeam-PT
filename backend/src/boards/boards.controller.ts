import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';
import { CreateTaskDto, UpdateTaskDto } from './dto/create-task.dto';

@Controller('api/boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // Board enviar
  @Post()
  createBoard(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.createBoard(createBoardDto);
  }
  // llamarlos a todos
  @Get()
  findAllBoards() {
    return this.boardsService.findAllBoards();
  }
  //board por id
  @Get(':id')
  findBoardById(@Param('id') id: string) {
    return this.boardsService.findBoardById(id);
  }

  // export
  @Post(':boardId/export')
  async exportBacklog(@Param('boardId') boardId: string) {
    return this.boardsService.exportBacklog(boardId);
  }

  // columnas
  @Post(':boardId/columns')
  createColumn(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.boardsService.createColumn(boardId, createColumnDto);
  }

  @Delete('columns/:columnId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteColumn(@Param('columnId') columnId: string): Promise<void> {
    return this.boardsService.deleteColumn(columnId);
  }

  // Tareas
  @Post('columns/:columnId/tasks')
  createTask(
    @Param('columnId') columnId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.boardsService.createTask(columnId, createTaskDto);
  }

  @Patch('tasks/:taskId')
  updateTask(
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.boardsService.updateTask(taskId, updateTaskDto);
  }

  @Post('tasks/:taskId/move')
  moveTask(
    @Param('taskId') taskId: string,
    @Body() moveDto: { columnId: string; position: number },
  ) {
    return this.boardsService.moveTask(
      taskId,
      moveDto.columnId,
      moveDto.position,
    );
  }

  @Delete('tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('taskId') taskId: string): Promise<void> {
    return this.boardsService.deleteTask(taskId);
  }
}
