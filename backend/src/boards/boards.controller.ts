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

  // ============ BOARDS ============
  @Post()
  createBoard(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.createBoard(createBoardDto);
  }

  @Get()
  findAllBoards() {
    return this.boardsService.findAllBoards();
  }

  @Get(':id')
  findBoardById(@Param('id') id: string) {
    return this.boardsService.findBoardById(id);
  }

  // ============ COLUMNS ============
  @Post(':boardId/columns')
  createColumn(
    @Param('boardId') boardId: string,
    @Body() createColumnDto: CreateColumnDto,
  ) {
    return this.boardsService.createColumn(boardId, createColumnDto);
  }

  @Delete('columns/:columnId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteColumn(@Param('columnId') columnId: string) {
    return this.boardsService.deleteColumn(columnId);
  }

  // ============ TASKS ============
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
  deleteTask(@Param('taskId') taskId: string) {
    return this.boardsService.deleteTask(taskId);
  }
}
