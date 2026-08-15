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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_client_1 = require("../prisma-client");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const column = await this.prisma.column.findUnique({
            where: { id: dto.columnId },
            include: { board: true },
        });
        if (!column)
            throw new common_1.NotFoundException('Column not found');
        const maxPos = await this.prisma.task.aggregate({
            where: { columnId: dto.columnId },
            _max: { position: true },
        });
        const position = (maxPos._max.position ?? -1) + 1;
        const task = await this.prisma.task.create({
            data: {
                title: dto.title,
                description: dto.description,
                columnId: dto.columnId,
                priority: dto.priority || 'MEDIUM',
                assigneeId: dto.assigneeId,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                estimatedHours: dto.estimatedHours,
                milestoneId: dto.milestoneId,
                isTemplate: dto.isTemplate || false,
                position,
                creatorId: userId,
            },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                labels: { include: { label: true } },
                _count: { select: { comments: true, attachments: true } },
            },
        });
        if (dto.assigneeId && dto.assigneeId !== userId) {
            await this.prisma.notification.create({
                data: {
                    type: 'TASK_ASSIGNED',
                    title: 'Nouvelle tâche assignée',
                    message: `Vous avez été assigné à la tâche : "${task.title}"`,
                    userId: dto.assigneeId,
                    link: `/projects/${column.board.projectId}/board`,
                },
            });
        }
        return task;
    }
    async findById(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
                creator: { select: { id: true, firstName: true, lastName: true } },
                labels: { include: { label: true } },
                checklists: {
                    include: { items: { orderBy: { position: 'asc' } } },
                },
                comments: {
                    include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                attachments: {
                    include: { uploader: { select: { id: true, firstName: true, lastName: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                milestone: true,
                dependsOn: {
                    include: { dependsOn: { select: { id: true, title: true } } },
                },
                dependedBy: {
                    include: { task: { select: { id: true, title: true } } },
                },
                column: {
                    include: { board: { select: { projectId: true } } },
                },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task;
    }
    async update(id, dto, userId, userRole) {
        const task = await this.ensureExists(id);
        if (dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId) {
            if (userRole === 'TEAM_MEMBER') {
                throw new common_1.ForbiddenException('Action interdite : Un membre opérateur ne peut pas modifier la personne allouée à une tâche.');
            }
        }
        const data = { ...dto };
        if (dto.dueDate)
            data.dueDate = new Date(dto.dueDate);
        if (dto.startDate)
            data.startDate = new Date(dto.startDate);
        return this.prisma.task.update({
            where: { id },
            data,
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                labels: { include: { label: true } },
                checklists: { include: { items: true } },
                _count: { select: { comments: true, attachments: true } },
            },
        });
    }
    async move(id, dto, userId) {
        const task = await this.ensureExists(id);
        const oldColumnId = task.columnId;
        await this.prisma.task.updateMany({
            where: { columnId: oldColumnId, position: { gt: task.position } },
            data: { position: { decrement: 1 } },
        });
        await this.prisma.task.updateMany({
            where: { columnId: dto.columnId, position: { gte: dto.position } },
            data: { position: { increment: 1 } },
        });
        const targetColumn = await this.prisma.column.findUnique({ where: { id: dto.columnId } });
        const isCompleted = targetColumn?.name.toLowerCase().includes('terminé') || targetColumn?.name.toLowerCase().includes('done');
        const updated = await this.prisma.task.update({
            where: { id },
            data: {
                columnId: dto.columnId,
                position: dto.position,
                completedAt: isCompleted ? new Date() : (oldColumnId !== dto.columnId ? null : undefined),
            },
            include: {
                assignee: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                labels: { include: { label: true } },
                _count: { select: { comments: true, attachments: true } },
            },
        });
        return updated;
    }
    async archive(id) {
        await this.ensureExists(id);
        return this.prisma.task.update({
            where: { id },
            data: { isArchived: true },
        });
    }
    async delete(id) {
        await this.ensureExists(id);
        await this.prisma.task.delete({ where: { id } });
        return { message: 'Task deleted' };
    }
    async getMyTasks(userId, filters) {
        const where = { assigneeId: userId, isArchived: false, isTemplate: false };
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.overdue) {
            where.dueDate = { lt: new Date() };
            where.completedAt = null;
        }
        return this.prisma.task.findMany({
            where,
            include: {
                column: {
                    include: { board: { include: { project: { select: { id: true, name: true } } } } },
                },
                labels: { include: { label: true } },
                _count: { select: { comments: true, attachments: true, checklists: true } },
            },
            orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        });
    }
    async getTemplates(projectId) {
        return this.prisma.task.findMany({
            where: {
                isTemplate: true,
                column: { board: { projectId } },
            },
            include: {
                labels: { include: { label: true } },
                checklists: { include: { items: true } },
            },
        });
    }
    async createFromTemplate(templateId, columnId, userId) {
        const template = await this.prisma.task.findUnique({
            where: { id: templateId },
            include: {
                labels: true,
                checklists: { include: { items: true } },
            },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        const maxPos = await this.prisma.task.aggregate({
            where: { columnId },
            _max: { position: true },
        });
        const task = await this.prisma.task.create({
            data: {
                title: template.title,
                description: template.description,
                priority: template.priority,
                columnId,
                creatorId: userId,
                position: (maxPos._max.position ?? -1) + 1,
                estimatedHours: template.estimatedHours,
            },
        });
        for (const cl of template.checklists) {
            await this.prisma.checklist.create({
                data: {
                    title: cl.title,
                    taskId: task.id,
                    items: {
                        create: cl.items.map(item => ({
                            text: item.text,
                            position: item.position,
                        })),
                    },
                },
            });
        }
        for (const tl of template.labels) {
            await this.prisma.taskLabel.create({
                data: { taskId: task.id, labelId: tl.labelId },
            });
        }
        return this.findById(task.id);
    }
    async addComment(taskId, content, userId) {
        await this.ensureExists(taskId);
        return this.prisma.comment.create({
            data: { content, taskId, authorId: userId },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
        });
    }
    async getComments(taskId) {
        return this.prisma.comment.findMany({
            where: { taskId },
            include: {
                author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addChecklist(taskId, title, userId, userRole) {
        await this.ensureChecklistPermission(taskId, userId, userRole);
        return this.prisma.checklist.create({
            data: { title, taskId },
            include: { items: true },
        });
    }
    async addChecklistItem(checklistId, text, userId, userRole) {
        const checklist = await this.prisma.checklist.findUnique({
            where: { id: checklistId },
        });
        if (!checklist)
            throw new common_1.NotFoundException('Checklist not found');
        await this.ensureChecklistPermission(checklist.taskId, userId, userRole);
        const maxPos = await this.prisma.checklistItem.aggregate({
            where: { checklistId },
            _max: { position: true },
        });
        return this.prisma.checklistItem.create({
            data: {
                text,
                checklistId,
                position: (maxPos._max.position ?? -1) + 1,
            },
        });
    }
    async toggleChecklistItem(itemId, userId, userRole) {
        const item = await this.prisma.checklistItem.findUnique({
            where: { id: itemId },
            include: { checklist: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Checklist item not found');
        await this.ensureChecklistPermission(item.checklist.taskId, userId, userRole);
        return this.prisma.checklistItem.update({
            where: { id: itemId },
            data: { isCompleted: !item.isCompleted },
        });
    }
    async ensureChecklistPermission(taskId, userId, userRole) {
        if (userRole === 'ADMIN')
            return;
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
            include: {
                column: {
                    include: {
                        board: {
                            include: {
                                project: {
                                    include: {
                                        members: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.assigneeId === userId) {
            return;
        }
        const projectMembers = task.column?.board?.project?.members || [];
        const isManagerOfProject = projectMembers.some((m) => m.userId === userId && m.isManager === true);
        if (isManagerOfProject || userRole === 'PROJECT_MANAGER') {
            return;
        }
        throw new common_1.ForbiddenException('Action interdite : Seule la personne allouée à la tâche et le chef de projet peuvent ajouter ou cocher des sous-listes.');
    }
    async addLabel(taskId, labelId) {
        return this.prisma.taskLabel.create({
            data: { taskId, labelId },
            include: { label: true },
        });
    }
    async removeLabel(taskId, labelId) {
        await this.prisma.taskLabel.deleteMany({
            where: { taskId, labelId },
        });
        return { message: 'Label removed' };
    }
    async addDependency(taskId, dependsOnId) {
        return this.prisma.taskDependency.create({
            data: { taskId, dependsOnId },
        });
    }
    async removeDependency(taskId, dependsOnId) {
        await this.prisma.taskDependency.deleteMany({
            where: { taskId, dependsOnId },
        });
        return { message: 'Dependency removed' };
    }
    async ensureExists(id) {
        const task = await this.prisma.task.findUnique({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map