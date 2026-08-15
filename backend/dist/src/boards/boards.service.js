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
exports.BoardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_1 = require("../prisma-client");
let BoardsService = class BoardsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByProject(projectId) {
        return this.prisma.board.findMany({
            where: { projectId },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        tasks: {
                            where: { isArchived: false },
                            orderBy: { position: 'asc' },
                            include: {
                                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                                labels: { include: { label: true } },
                                checklists: { include: { items: true } },
                                _count: { select: { comments: true, attachments: true } },
                            },
                        },
                    },
                },
            },
        });
    }
    async findById(id) {
        const board = await this.prisma.board.findUnique({
            where: { id },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        tasks: {
                            where: { isArchived: false },
                            orderBy: { position: 'asc' },
                            include: {
                                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                                labels: { include: { label: true } },
                                checklists: { include: { items: true } },
                                _count: { select: { comments: true, attachments: true } },
                            },
                        },
                    },
                },
            },
        });
        if (!board)
            throw new common_1.NotFoundException('Board not found');
        return board;
    }
    async addColumn(boardId, dto) {
        const maxPos = await this.prisma.column.aggregate({
            where: { boardId },
            _max: { position: true },
        });
        return this.prisma.column.create({
            data: {
                name: dto.name,
                color: dto.color,
                boardId,
                position: (maxPos._max.position ?? -1) + 1,
            },
            include: { tasks: true },
        });
    }
    async updateColumn(columnId, dto) {
        return this.prisma.column.update({
            where: { id: columnId },
            data: dto,
        });
    }
    async deleteColumn(columnId) {
        const taskCount = await this.prisma.task.count({ where: { columnId } });
        if (taskCount > 0) {
            const col = await this.prisma.column.findUnique({ where: { id: columnId } });
            if (col) {
                const firstCol = await this.prisma.column.findFirst({
                    where: { boardId: col.boardId, id: { not: columnId } },
                    orderBy: { position: 'asc' },
                });
                if (firstCol) {
                    await this.prisma.task.updateMany({
                        where: { columnId },
                        data: { columnId: firstCol.id },
                    });
                }
            }
        }
        await this.prisma.column.delete({ where: { id: columnId } });
        return { message: 'Column deleted' };
    }
    async reorderColumns(boardId, columnIds) {
        const updates = columnIds.map((id, index) => this.prisma.column.update({ where: { id }, data: { position: index } }));
        await this.prisma.$transaction(updates);
        return { message: 'Columns reordered' };
    }
};
exports.BoardsService = BoardsService;
exports.BoardsService = BoardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_1.PrismaService])
], BoardsService);
//# sourceMappingURL=boards.service.js.map