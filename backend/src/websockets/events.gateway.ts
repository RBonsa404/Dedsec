import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('EventsGateway');
  private userSockets: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove from all user mappings
    for (const [userId, sockets] of this.userSockets.entries()) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('auth')
  handleAuth(@ConnectedSocket() client: Socket, @MessageBody() data: { userId: string }) {
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    this.userSockets.get(data.userId)!.add(client.id);
    this.logger.log(`User ${data.userId} authenticated on socket ${client.id}`);
  }

  @SubscribeMessage('join:project')
  handleJoinProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    client.join(`project:${data.projectId}`);
    this.logger.log(`Socket ${client.id} joined project:${data.projectId}`);
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(@ConnectedSocket() client: Socket, @MessageBody() data: { projectId: string }) {
    client.leave(`project:${data.projectId}`);
  }

  // ─── Server-side emit methods (called from services) ───

  emitBoardUpdate(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('board:updated', data);
  }

  emitTaskMoved(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:moved', data);
  }

  emitTaskUpdated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:updated', data);
  }

  emitCommentAdded(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('comment:added', data);
  }

  emitNotification(userId: string, data: any) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('notification:new', data);
      }
    }
  }

  emitAnnouncement(data: any) {
    this.server.emit('announcement:new', data);
  }
}
