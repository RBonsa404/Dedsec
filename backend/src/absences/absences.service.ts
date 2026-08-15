import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { CreateAbsenceDto, ReviewAbsenceDto } from './dto';
import { NotificationAutomationService } from '../notifications/notification-automation.service';

@Injectable()
export class AbsencesService {
  constructor(
    private prisma: PrismaService,
    private notificationAutomation: NotificationAutomationService,
  ) {}

  async create(dto: CreateAbsenceDto, userId: string) {
    const absence = await this.prisma.absenceRequest.create({
      data: {
        reason: dto.reason,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        justificationUrl: dto.justificationUrl,
        requesterId: userId,
      },
    });

    // Send absence request notification
    await this.notificationAutomation.handleAbsenceRequested(absence.id, userId);

    return absence;
  }

  async findByRequester(userId: string) {
    return this.prisma.absenceRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPendingForManager(managerId: string, userRole?: string) {
    if (userRole === 'ADMIN') {
      return this.prisma.absenceRequest.findMany({
        where: { status: 'PENDING' },
        include: {
          requester: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Find all team members in projects managed by this user
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

  async review(id: string, dto: ReviewAbsenceDto, reviewerId: string) {
    const absence = await this.prisma.absenceRequest.findUnique({ where: { id } });
    if (!absence) throw new NotFoundException('Absence request not found');

    const updatedAbsence = await this.prisma.absenceRequest.update({
      where: { id },
      data: {
        status: dto.status,
        reviewNote: dto.reviewNote,
        reviewerId,
        reviewedAt: new Date(),
      },
    });

    // Send notification if approved
    if (dto.status === 'APPROVED') {
      await this.notificationAutomation.handleAbsenceApproved(id, reviewerId);
    }

    return updatedAbsence;
  }
}
