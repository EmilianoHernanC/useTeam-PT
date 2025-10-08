import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
})

//configuracion y creacion de emmits para la interaccion en tiempo real con websocket
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  notifyBoardCreated(board: any) {
    this.server.emit('board:created', board);
  }

  notifyBoardUpdated(boardId: string, board: any) {
    this.server.emit('board:updated', { boardId, board });
  }

  notifyColumnCreated(boardId: string, column: any) {
    this.server.emit('column:created', { boardId, column });
  }

  notifyColumnDeleted(boardId: string, columnId: string) {
    this.server.emit('column:deleted', { boardId, columnId });
  }

  notifyTaskCreated(boardId: string, columnId: string, task: any) {
    this.server.emit('task:created', { boardId, columnId, task });
  }

  notifyTaskUpdated(boardId: string, task: any) {
    this.server.emit('task:updated', { boardId, task });
  }

  notifyTaskMoved(boardId: string, task: any) {
    this.server.emit('task:moved', { boardId, task });
  }

  notifyTaskDeleted(boardId: string, columnId: string, taskId: string) {
    this.server.emit('task:deleted', { boardId, columnId, taskId });
  }
}
