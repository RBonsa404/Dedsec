"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let EventsGateway = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger('EventsGateway');
        this.userSockets = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        for (const [userId, sockets] of this.userSockets.entries()) {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.userSockets.delete(userId);
            }
        }
    }
    handleAuth(client, data) {
        if (!this.userSockets.has(data.userId)) {
            this.userSockets.set(data.userId, new Set());
        }
        this.userSockets.get(data.userId).add(client.id);
        this.logger.log(`User ${data.userId} authenticated on socket ${client.id}`);
    }
    handleJoinProject(client, data) {
        client.join(`project:${data.projectId}`);
        this.logger.log(`Socket ${client.id} joined project:${data.projectId}`);
    }
    handleLeaveProject(client, data) {
        client.leave(`project:${data.projectId}`);
    }
    emitBoardUpdate(projectId, data) {
        this.server.to(`project:${projectId}`).emit('board:updated', data);
    }
    emitTaskMoved(projectId, data) {
        this.server.to(`project:${projectId}`).emit('task:moved', data);
    }
    emitTaskUpdated(projectId, data) {
        this.server.to(`project:${projectId}`).emit('task:updated', data);
    }
    emitCommentAdded(projectId, data) {
        this.server.to(`project:${projectId}`).emit('comment:added', data);
    }
    emitNotification(userId, data) {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            for (const socketId of sockets) {
                this.server.to(socketId).emit('notification:new', data);
            }
        }
    }
    emitAnnouncement(data) {
        this.server.emit('announcement:new', data);
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('auth'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleAuth", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join:project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleJoinProject", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave:project'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleLeaveProject", null);
exports.EventsGateway = EventsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
        },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map