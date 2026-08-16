import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
import { Role } from '../common/enums';
import { NotificationAutomationService } from '../notifications/notification-automation.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private notificationAutomation: NotificationAutomationService,
  ) {}

  async create(dto: CreateTaskDto, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: dto.columnId },
      include: { board: true },
    });
    if (!column) throw new NotFoundException('Column not found');

    // Get max position in column
    const maxPos = await this.prisma.task.aggregate({
      where: { columnId: dto.columnId },
      _max: { position: true },
    });

    const position = (maxPos._max.position ?? -1) + 1;

    try {
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

      // Notify assignee if assigned
      if (dto.assigneeId && dto.assigneeId !== userId) {
        await this.notificationAutomation.handleTaskAssigned(task.id, dto.assigneeId, userId);
      }

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async findById(id: string) {
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

    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, userId: string, userRole: Role) {
    const task = await this.ensureExists(id);

    // SECURITY RULE 1: Un membre ne peut pas modifier la personne allouée à une tâche
    if (dto.assigneeId !== undefined && dto.assigneeId !== task.assigneeId) {
      if (userRole === 'TEAM_MEMBER') {
        throw new ForbiddenException('Action interdite : Un membre opérateur ne peut pas modifier la personne allouée à une tâche.');
      }
    }

    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    if (dto.startDate) data.startDate = new Date(dto.startDate);

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

  async move(id: string, dto: MoveTaskDto, userId: string) {
    const task = await this.ensureExists(id);
    const oldColumnId = task.columnId;

    // Update positions in old column
    await this.prisma.task.updateMany({
      where: { columnId: oldColumnId, position: { gt: task.position } },
      data: { position: { decrement: 1 } },
    });

    // Make space in new column
    await this.prisma.task.updateMany({
      where: { columnId: dto.columnId, position: { gte: dto.position } },
      data: { position: { increment: 1 } },
    });

    // Check if moved to a "completed" column
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

  async archive(id: string) {
    await this.ensureExists(id);
    return this.prisma.task.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async delete(id: string) {
    await this.ensureExists(id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Task deleted' };
  }

  async getMyTasks(userId: string, filters?: { projectId?: string; priority?: string; overdue?: boolean }) {
    const where: any = { assigneeId: userId, isArchived: false, isTemplate: false };
    if (filters?.priority) where.priority = filters.priority;
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

  async getTemplates(projectId: string) {
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

  async createFromTemplate(templateId: string, columnId: string, userId: string) {
    const template = await this.prisma.task.findUnique({
      where: { id: templateId },
      include: {
        labels: true,
        checklists: { include: { items: true } },
      },
    });
    if (!template) throw new NotFoundException('Template not found');

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

    // Copy checklists
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

    // Copy labels
    for (const tl of template.labels) {
      await this.prisma.taskLabel.create({
        data: { taskId: task.id, labelId: tl.labelId },
      });
    }

    return this.findById(task.id);
  }

  // ─── Comments ───────────────────────────────
  async addComment(taskId: string, content: string, userId: string) {
    await this.ensureExists(taskId);
    return this.prisma.comment.create({
      data: { content, taskId, authorId: userId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
  }

  async getComments(taskId: string) {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Checklists ─────────────────────────────
  // SECURITY RULE 2: Seule la personne allouée à la tâche et le chef peuvent check ou rajouter une sous-liste
  async addChecklist(taskId: string, title: string, userId: string, userRole: Role) {
    await this.ensureChecklistPermission(taskId, userId, userRole);
    return this.prisma.checklist.create({
      data: { title, taskId },
      include: { items: true },
    });
  }

  async addChecklistItem(checklistId: string, text: string, userId: string, userRole: Role) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });
    if (!checklist) throw new NotFoundException('Checklist not found');

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

  async toggleChecklistItem(itemId: string, userId: string, userRole: Role) {
    const item = await this.prisma.checklistItem.findUnique({
      where: { id: itemId },
      include: { checklist: true },
    });
    if (!item) throw new NotFoundException('Checklist item not found');

    await this.ensureChecklistPermission(item.checklist.taskId, userId, userRole);

    return this.prisma.checklistItem.update({
      where: { id: itemId },
      data: { isCompleted: !item.isCompleted },
    });
  }

  private async ensureChecklistPermission(taskId: string, userId: string, userRole: Role) {
    if (userRole === 'ADMIN') return; // Super admin always has clearance

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
    if (!task) throw new NotFoundException('Task not found');

    // 1. Is the current user the person allocated to the task?
    if (task.assigneeId === userId) {
      return; // Allocated user is allowed!
    }

    // 2. Is the current user the Project Manager of this project?
    const projectMembers = task.column?.board?.project?.members || [];
    const isManagerOfProject = projectMembers.some(
      (m) => m.userId === userId && m.isManager === true,
    );

    if (isManagerOfProject || userRole === 'PROJECT_MANAGER') {
      return; // Manager is allowed!
    }

    throw new ForbiddenException(
      'Action interdite : Seule la personne allouée à la tâche et le chef de projet peuvent ajouter ou cocher des sous-listes.',
    );
  }

  // ─── Labels ─────────────────────────────────
  async addLabel(taskId: string, labelId: string) {
    return this.prisma.taskLabel.create({
      data: { taskId, labelId },
      include: { label: true },
    });
  }

  async removeLabel(taskId: string, labelId: string) {
    await this.prisma.taskLabel.deleteMany({
      where: { taskId, labelId },
    });
    return { message: 'Label removed' };
  }

  // ─── Dependencies ──────────────────────────
  async addDependency(taskId: string, dependsOnId: string) {
    return this.prisma.taskDependency.create({
      data: { taskId, dependsOnId },
    });
  }

  async removeDependency(taskId: string, dependsOnId: string) {
    await this.prisma.taskDependency.deleteMany({
      where: { taskId, dependsOnId },
    });
    return { message: 'Dependency removed' };
  }

  private async ensureExists(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }
}
