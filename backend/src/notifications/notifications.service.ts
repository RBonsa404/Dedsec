import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { NotificationType } from '../common/enums';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async create(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    link?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async notifyMany(userIds: string[], data: {
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
  }) {
    const notifications = userIds.map(userId => ({
      ...data,
      userId,
    }));
    return this.prisma.notification.createMany({ data: notifications });
  }
}
