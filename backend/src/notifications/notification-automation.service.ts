import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { EmailService } from '../email/email.service';
import { NotificationType } from '../common/enums';

@Injectable()
export class NotificationAutomationService {
  private readonly logger = new Logger('NotificationAutomationService');

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async handleTaskAssigned(taskId: string, assigneeId: string, assignerId: string): Promise<void> {
    try {
      const [task, assignee, assigner] = await Promise.all([
        this.prisma.task.findUnique({
          where: { id: taskId },
          include: { column: { include: { board: { include: { project: true } } } } },
        }),
        this.prisma.user.findUnique({ where: { id: assigneeId } }),
        this.prisma.user.findUnique({ where: { id: assignerId } }),
      ]);

      if (!task || !assignee || !assigner) {
        this.logger.warn(`Task assignment notification failed: missing data`);
        return;
      }

      const projectName = task.column?.board?.project?.name || 'Projet inconnu';

      // Create in-app notification
      await this.prisma.notification.create({
        data: {
          type: NotificationType.TASK_ASSIGNED,
          title: 'Nouvelle tâche assignée',
          message: `${assigner.firstName} ${assigner.lastName} vous a assigné la tâche "${task.title}"`,
          userId: assigneeId,
          link: `/my-tasks`,
        },
      });

      // Send email notification
      await this.emailService.sendTaskAssignedEmail(
        assignee.email,
        assignee.firstName,
        task.title,
        projectName,
        `${assigner.firstName} ${assigner.lastName}`,
      );

      this.logger.log(`Task assigned notification sent to ${assignee.email}`);
    } catch (error) {
      this.logger.error(`Failed to send task assigned notification`, error);
    }
  }

  async handleTaskUpdated(taskId: string, updaterId: string, updateType: string): Promise<void> {
    try {
      const [task, updater] = await Promise.all([
        this.prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true },
        }),
        this.prisma.user.findUnique({ where: { id: updaterId } }),
      ]);

      if (!task || !updater) {
        this.logger.warn(`Task update notification failed: missing data`);
        return;
      }

      if (!task.assigneeId || task.assigneeId === updaterId) {
        return; // Don't notify if no assignee or updater is the assignee
      }

      const assignee = await this.prisma.user.findUnique({ where: { id: task.assigneeId } });
      if (!assignee) return;

      // Create in-app notification
      await this.prisma.notification.create({
        data: {
          type: NotificationType.TASK_UPDATED,
          title: 'Tâche mise à jour',
          message: `${updater.firstName} ${updater.lastName} a mis à jour la tâche "${task.title}"`,
          userId: task.assigneeId,
          link: `/my-tasks`,
        },
      });

      // Send email notification
      await this.emailService.sendTaskUpdatedEmail(
        assignee.email,
        assignee.firstName,
        task.title,
        updateType,
        `${updater.firstName} ${updater.lastName}`,
      );

      this.logger.log(`Task update notification sent to ${assignee.email}`);
    } catch (error) {
      this.logger.error(`Failed to send task update notification`, error);
    }
  }

  async handleProjectInvited(projectId: string, userId: string, inviterId: string): Promise<void> {
    try {
      const [project, user, inviter] = await Promise.all([
        this.prisma.project.findUnique({ where: { id: projectId } }),
        this.prisma.user.findUnique({ where: { id: userId } }),
        this.prisma.user.findUnique({ where: { id: inviterId } }),
      ]);

      if (!project || !user || !inviter) {
        this.logger.warn(`Project invitation notification failed: missing data`);
        return;
      }

      // Create in-app notification
      await this.prisma.notification.create({
        data: {
          type: NotificationType.PROJECT_INVITED,
          title: 'Invitation à un projet',
          message: `${inviter.firstName} ${inviter.lastName} vous a invité à rejoindre le projet "${project.name}"`,
          userId,
          link: `/projects`,
        },
      });

      // Send email notification
      await this.emailService.sendProjectInvitedEmail(
        user.email,
        user.firstName,
        project.name,
        `${inviter.firstName} ${inviter.lastName}`,
      );

      this.logger.log(`Project invitation notification sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send project invitation notification`, error);
    }
  }

  async handleAbsenceRequested(absenceId: string, requesterId: string): Promise<void> {
    try {
      const [absenceRequest, requester] = await Promise.all([
        this.prisma.absenceRequest.findUnique({ where: { id: absenceId } }),
        this.prisma.user.findUnique({ where: { id: requesterId } }),
      ]);

      if (!absenceRequest || !requester) {
        this.logger.warn(`Absence request notification failed: missing data`);
        return;
      }

      // Notify admins and project managers
      const approvers = await this.prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'PROJECT_MANAGER'] },
          status: 'ACTIVE',
        },
      });

      for (const approver of approvers) {
        await this.prisma.notification.create({
          data: {
            type: NotificationType.ABSENCE_REQUESTED,
            title: 'Demande de congé',
            message: `${requester.firstName} ${requester.lastName} a soumis une demande de congé`,
            userId: approver.id,
            link: `/absences`,
          },
        });

        await this.emailService.sendAbsenceRequestEmail(
          approver.email,
          approver.firstName,
          `${requester.firstName} ${requester.lastName}`,
          absenceRequest.startDate.toISOString().split('T')[0],
          absenceRequest.endDate.toISOString().split('T')[0],
          absenceRequest.reason || 'Non spécifié',
        );
      }

      this.logger.log(`Absence request notifications sent to ${approvers.length} approvers`);
    } catch (error) {
      this.logger.error(`Failed to send absence request notifications`, error);
    }
  }

  async handleAbsenceApproved(absenceId: string, approverId: string): Promise<void> {
    try {
      const [absenceRequest, approver] = await Promise.all([
        this.prisma.absenceRequest.findUnique({ where: { id: absenceId } }),
        this.prisma.user.findUnique({ where: { id: approverId } }),
      ]);

      if (!absenceRequest || !approver) {
        this.logger.warn(`Absence approval notification failed: missing data`);
        return;
      }

      const requester = await this.prisma.user.findUnique({ where: { id: absenceRequest.requesterId } });
      if (!requester) return;

      // Create in-app notification
      await this.prisma.notification.create({
        data: {
          type: NotificationType.ABSENCE_APPROVED,
          title: 'Congé approuvé',
          message: `Votre demande de congé a été approuvée par ${approver.firstName} ${approver.lastName}`,
          userId: requester.id,
          link: `/absences`,
        },
      });

      // Send email notification
      await this.emailService.sendAbsenceApprovedEmail(
        requester.email,
        requester.firstName,
        absenceRequest.startDate.toISOString().split('T')[0],
        absenceRequest.endDate.toISOString().split('T')[0],
      );

      this.logger.log(`Absence approval notification sent to ${requester.email}`);
    } catch (error) {
      this.logger.error(`Failed to send absence approval notification`, error);
    }
  }

  async handleAnnouncementCreated(announcementId: string, authorId: string): Promise<void> {
    try {
      const [announcement, author] = await Promise.all([
        this.prisma.announcement.findUnique({ where: { id: announcementId } }),
        this.prisma.user.findUnique({ where: { id: authorId } }),
      ]);

      if (!announcement || !author) {
        this.logger.warn(`Announcement notification failed: missing data`);
        return;
      }

      // Notify all active users
      const users = await this.prisma.user.findMany({
        where: { status: 'ACTIVE', id: { not: authorId } },
      });

      for (const user of users) {
        await this.prisma.notification.create({
          data: {
            type: NotificationType.ANNOUNCEMENT,
            title: announcement.title,
            message: `${author.firstName} ${author.lastName} a publié une nouvelle annonce`,
            userId: user.id,
            link: `/announcements`,
          },
        });

        await this.emailService.sendAnnouncementEmail(
          user.email,
          user.firstName,
          announcement.title,
          announcement.content || '',
          `${author.firstName} ${author.lastName}`,
        );
      }

      this.logger.log(`Announcement notifications sent to ${users.length} users`);
    } catch (error) {
      this.logger.error(`Failed to send announcement notifications`, error);
    }
  }

  async handleTaskDueSoon(): Promise<void> {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const tasksDueSoon = await this.prisma.task.findMany({
        where: {
          dueDate: { lte: tomorrow },
          assigneeId: { not: null },
          completedAt: null,
        },
        include: { assignee: true, column: { include: { board: { include: { project: true } } } } },
      });

      for (const task of tasksDueSoon) {
        if (!task.assigneeId) continue;

        await this.prisma.notification.create({
          data: {
            type: NotificationType.TASK_DUE_SOON,
            title: 'Tâche à échéance proche',
            message: `La tâche "${task.title}" arrive à échéance bientôt`,
            userId: task.assigneeId,
            link: `/my-tasks`,
          },
        });

        this.logger.log(`Due soon notification sent for task ${task.id}`);
      }

      this.logger.log(`Sent ${tasksDueSoon.length} due soon notifications`);
    } catch (error) {
      this.logger.error(`Failed to send due soon notifications`, error);
    }
  }
}