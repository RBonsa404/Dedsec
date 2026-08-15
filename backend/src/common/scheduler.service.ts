import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma-client';
import { NotificationType } from './enums';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger('SchedulerService');

  constructor(
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleTaskDueSoon() {
    this.logger.log('Running daily task due soon check...');
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

      this.logger.log(`Daily task due soon check completed: ${tasksDueSoon.length} tasks notified`);
    } catch (error) {
      this.logger.error('Failed to run task due soon check', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyTaskCheck() {
    this.logger.log('Running hourly task overdue check...');
    try {
      const now = new Date();
      const overdueTasks = await this.prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          assigneeId: { not: null },
          completedAt: null,
        },
        include: { assignee: true },
      });

      for (const task of overdueTasks) {
        if (!task.assigneeId) continue;

        await this.prisma.notification.create({
          data: {
            type: NotificationType.TASK_OVERDUE,
            title: 'Tâche en retard',
            message: `La tâche "${task.title}" est en retard`,
            userId: task.assigneeId,
            link: `/my-tasks`,
          },
        });

        this.logger.log(`Overdue notification sent for task ${task.id}`);
      }

      this.logger.log(`Hourly task check completed: ${overdueTasks.length} overdue tasks notified`);
    } catch (error) {
      this.logger.error('Failed to run hourly task check', error);
    }
  }
}