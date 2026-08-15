import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private userSockets;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuth(client: Socket, data: {
        userId: string;
    }): void;
    handleJoinProject(client: Socket, data: {
        projectId: string;
    }): void;
    handleLeaveProject(client: Socket, data: {
        projectId: string;
    }): void;
    emitBoardUpdate(projectId: string, data: any): void;
    emitTaskMoved(projectId: string, data: any): void;
    emitTaskUpdated(projectId: string, data: any): void;
    emitCommentAdded(projectId: string, data: any): void;
    emitNotification(userId: string, data: any): void;
    emitAnnouncement(data: any): void;
}
