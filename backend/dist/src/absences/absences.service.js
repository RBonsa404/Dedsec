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
exports.AbsencesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_1 = require("../prisma-client");
let AbsencesService = class AbsencesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        return this.prisma.absenceRequest.create({
            data: {
                reason: dto.reason,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                justificationUrl: dto.justificationUrl,
                requesterId: userId,
            },
        });
    }
    async findByRequester(userId) {
        return this.prisma.absenceRequest.findMany({
            where: { requesterId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findPendingForManager(managerId, userRole) {
        if (userRole === 'ADMIN') {
            return this.prisma.absenceRequest.findMany({
                where: { status: 'PENDING' },
                include: {
                    requester: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        const managedProjects = await this.prisma.projectMember.findMany({
            where: { userId: managerId, isManager: true },
            select: { projectId: true },
        });
        const projectIds = managedProjects.map(p => p.projectId);
        const members = await this.prisma.projectMember.findMany({
            where: { projectId: { in: projectIds }, userId: { not: managerId } },
            select: { userId: true },
        });
        const memberIds = [...new Set(members.map(m => m.userId))];
        return this.prisma.absenceRequest.findMany({
            where: { requesterId: { in: memberIds }, status: 'PENDING' },
            include: {
                requester: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async review(id, dto, reviewerId) {
        const absence = await this.prisma.absenceRequest.findUnique({ where: { id } });
        if (!absence)
            throw new common_1.NotFoundException('Absence request not found');
        return this.prisma.absenceRequest.update({
            where: { id },
            data: {
                status: dto.status,
                reviewNote: dto.reviewNote,
                reviewerId,
                reviewedAt: new Date(),
            },
        });
    }
};
exports.AbsencesService = AbsencesService;
exports.AbsencesService = AbsencesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_1.PrismaService])
], AbsencesService);
//# sourceMappingURL=absences.service.js.map