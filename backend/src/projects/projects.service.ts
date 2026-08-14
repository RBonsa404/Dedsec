import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaService } from '../prisma-client';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { Role } from '../common/enums';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: Role) {
    if (userRole === 'ADMIN') {
      return this.prisma.project.findMany({
        include: {
          members: {
            select: {
              isManager: true,
              user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
          },
          _count: { select: { members: true, boards: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // PM/Member: only projects they belong to
    return this.prisma.project.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        members: {
          select: {
            isManager: true,
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
        },
        _count: { select: { members: true, boards: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, userRole: Role) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, role: true },
            },
          },
        },
        boards: {
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
        },
        milestones: { orderBy: { dueDate: 'asc' } },
        labels: true,
        _count: { select: { members: true, deliverables: true } },
      },
    });

    if (!project) throw new NotFoundException('Project not found');

    if (userRole === 'ADMIN') {
      return project;
    }

    // Check membership
    const isMember = project.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('You are not a member of this project');

    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        storageQuotaMb: dto.storageQuotaMb,
        members: {
          create: { userId, isManager: true },
        },
        boards: {
          create: {
            name: 'Main Board',
            columns: {
              create: [
                { name: 'À faire', position: 0, color: '#8888a0' },
                { name: 'En cours', position: 1, color: '#00d4ff' },
                { name: 'En révision', position: 2, color: '#ffaa00' },
                { name: 'Terminé', position: 3, color: '#00ff88' },
              ],
            },
          },
        },
        labels: {
          create: [
            { name: 'Bug', color: '#ff3366' },
            { name: 'Feature', color: '#00d4ff' },
            { name: 'Urgent', color: '#ff6600' },
            { name: 'Documentation', color: '#aa66ff' },
            { name: 'Design', color: '#ff66aa' },
          ],
        },
      },
      include: {
        members: true,
        boards: { include: { columns: true } },
        labels: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'PROJECT_CREATED',
        actorId: userId,
        details: JSON.stringify({ projectId: project.id, name: project.name }),
      },
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    await this.ensureManager(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: dto,
    });
  }

  async archive(id: string, userId: string) {
    await this.ensureManager(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
  }

  async delete(id: string, actorId: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    await this.prisma.project.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: {
        action: 'PROJECT_DELETED',
        actorId,
        details: JSON.stringify({ projectId: id, name: project.name }),
      },
    });
    return { message: 'Project deleted' };
  }

  async addMember(projectId: string, dto: AddMemberDto, userId: string) {
    await this.ensureManager(projectId, userId);

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Cannot add admin to projects');

    const existing = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: dto.userId, projectId } },
    });
    if (existing) throw new BadRequestException('User is already a member');

    await this.prisma.projectMember.create({
      data: { userId: dto.userId, projectId },
    });

    await this.prisma.activityLog.create({
      data: {
        action: `${user.firstName} ${user.lastName} added to project`,
        projectId,
        userId,
      },
    });

    return { message: 'Member added' };
  }

  async removeMember(projectId: string, memberId: string, userId: string) {
    await this.ensureManager(projectId, userId);
    const membership = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: memberId, projectId } },
    });
    if (!membership) throw new NotFoundException('Member not found in project');
    if (membership.isManager) throw new BadRequestException('Cannot remove the project manager');

    await this.prisma.projectMember.delete({
      where: { id: membership.id },
    });

    return { message: 'Member removed' };
  }

  async getMembers(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true, role: true },
        },
      },
    });
  }

  async getWorkload(projectId: string, userId: string) {
    await this.ensureManager(projectId, userId);

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            assignedTasks: {
              where: {
                column: { board: { projectId } },
                isArchived: false,
              },
              include: {
                column: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return members.map(m => ({
      user: { id: m.user.id, firstName: m.user.firstName, lastName: m.user.lastName, avatarUrl: m.user.avatarUrl },
      totalTasks: m.user.assignedTasks.length,
      overdue: m.user.assignedTasks.filter(t => t.dueDate && t.dueDate < new Date() && !t.completedAt).length,
      byColumn: m.user.assignedTasks.reduce((acc: Record<string, number>, t) => {
        acc[t.column.name] = (acc[t.column.name] || 0) + 1;
        return acc;
      }, {}),
    }));
  }

  async getActivityLog(projectId: string, userId: string) {
    await this.ensureManager(projectId, userId);
    return this.prisma.activityLog.findMany({
      where: { projectId },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getDeliverables(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { storageQuotaMb: true, storageUsedMb: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const deliverables = await this.prisma.deliverable.findMany({
      where: { projectId },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      storageQuotaMb: project.storageQuotaMb,
      storageUsedMb: project.storageUsedMb,
      deliverables,
    };
  }

  async createDeliverableWithFile(
    projectId: string,
    file: Express.Multer.File | undefined,
    body: any,
    userId: string,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const fileName = file ? file.originalname : (body.fileName || 'document.pdf');
    const fileSize = file ? file.size : (Number(body.fileSize) || 1024 * 100);
    const mimeType = file ? file.mimetype : (body.mimeType || 'application/octet-stream');
    const diskPath = file ? file.path : undefined;

    const fileSizeMb = fileSize / (1024 * 1024);
    if (project.storageUsedMb + fileSizeMb > project.storageQuotaMb) {
      throw new BadRequestException(`Quota de stockage dépassé (${project.storageQuotaMb}MB max)`);
    }

    const deliverable = await this.prisma.deliverable.create({
      data: {
        fileName,
        fileUrl: diskPath ? `/uploads/${path.basename(diskPath)}` : `/uploads/${projectId}/${fileName}`,
        fileSize,
        mimeType,
        type: body.type || 'DELIVERABLE',
        version: Number(body.version) || 1,
        projectId,
        uploaderId: userId,
      },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { storageUsedMb: { increment: fileSizeMb } },
    });

    return deliverable;
  }

  async getDeliverableFile(projectId: string, deliverableId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({
      where: { id: deliverableId },
    });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

    let filePath = '';
    if (deliverable.fileUrl.startsWith('/uploads/')) {
      const fileNameInUploads = path.basename(deliverable.fileUrl);
      filePath = path.resolve('./uploads', fileNameInUploads);
    } else {
      filePath = path.resolve(deliverable.fileUrl);
    }

    return {
      filePath,
      fileName: deliverable.fileName,
      mimeType: deliverable.mimeType,
    };
  }

  async deleteDeliverable(projectId: string, deliverableId: string, userId: string) {
    const deliverable = await this.prisma.deliverable.findUnique({ where: { id: deliverableId } });
    if (!deliverable) throw new NotFoundException('Deliverable not found');

    const fileSizeMb = deliverable.fileSize / (1024 * 1024);

    if (deliverable.fileUrl.startsWith('/uploads/')) {
      const fileNameInUploads = path.basename(deliverable.fileUrl);
      const filePath = path.resolve('./uploads', fileNameInUploads);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore
        }
      }
    }

    await this.prisma.deliverable.delete({ where: { id: deliverableId } });

    await this.prisma.project.update({
      where: { id: projectId },
      data: { storageUsedMb: { decrement: Math.max(0, fileSizeMb) } },
    });

    return { message: 'Deliverable removed' };
  }

  private async ensureManager(projectId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user && user.role === 'ADMIN') return;

    const membership = await this.prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!membership || !membership.isManager) {
      throw new ForbiddenException('Only the project manager can perform this action');
    }
  }
}
