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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_1 = require("../prisma-client");
let AuditLogService = class AuditLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.action)
            where.action = filters.action;
        if (filters?.actorId)
            where.actorId = filters.actorId;
        if (filters?.from || filters?.to) {
            where.createdAt = {};
            if (filters.from)
                where.createdAt.gte = new Date(filters.from);
            if (filters.to)
                where.createdAt.lte = new Date(filters.to);
        }
        return this.prisma.auditLog.findMany({
            where,
            include: {
                actor: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });
    }
    async getStats() {
        const [totalUsers, activeUsers, adminCount, pmCount, memberCount, totalProjects, activeProjects, totalTasks, totalAbsences, pendingAbsences, recentAuditLogs,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.user.count({ where: { role: 'PROJECT_MANAGER' } }),
            this.prisma.user.count({ where: { role: 'TEAM_MEMBER' } }),
            this.prisma.project.count(),
            this.prisma.project.count({ where: { status: 'ACTIVE' } }),
            this.prisma.task.count(),
            this.prisma.absenceRequest.count(),
            this.prisma.absenceRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.auditLog.findMany({
                take: 30,
                orderBy: { createdAt: 'desc' },
                include: {
                    actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
                },
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            usersByRole: {
                ADMIN: adminCount,
                PROJECT_MANAGER: pmCount,
                TEAM_MEMBER: memberCount,
            },
            totalProjects,
            activeProjects,
            totalTasks,
            totalAbsences,
            pendingAbsences,
            recentAuditLogs,
        };
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map