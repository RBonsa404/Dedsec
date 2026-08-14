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

  async create(action: AuditAction, actorId: string | null, details?: string, ipAddress?: string) {
    return this.prisma.auditLog.create({
      data: { action, actorId, details, ipAddress },
    });
  }
}
