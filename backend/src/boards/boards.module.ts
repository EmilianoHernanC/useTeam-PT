import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardsGateway } from './boards.gateway';
import { Board, BoardSchema } from './schemas/board.schema';
import { Column, ColumnSchema } from './schemas/column.schema';
import { Task, TaskSchema } from './schemas/task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Board.name, schema: BoardSchema },
      { name: Column.name, schema: ColumnSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsGateway],
  exports: [BoardsService],
})
export class BoardsModule {}
