import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { AuditAction } from '../common/enums';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { action?: AuditAction; actorId?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.actorId) where.actorId = filters.actorId;
    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = new Date(filters.from);
      if (filters.to) where.createdAt.lte = new Date(filters.to);
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
    const [
      totalUsers,
      activeUsers,
      superAdminCount,
      adminCount,
      pmCount,
      memberCount,
      totalProjects,
      activeProjects,
      totalTasks,
      totalAbsences,
      pendingAbsences,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
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
        SUPER_ADMIN: superAdminCount,
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
}
