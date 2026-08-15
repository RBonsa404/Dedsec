import { PrismaService } from '../prisma-client';
import { NotificationType } from '../common/enums';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByUser(userId: string, unreadOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: string;
        message: string;
        isRead: boolean;
        link: string | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    create(data: {
        type: NotificationType;
        title: string;
        message: string;
        userId: string;
        link?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: string;
        message: string;
        isRead: boolean;
        link: string | null;
    }>;
    notifyMany(userIds: string[], data: {
        type: NotificationType;
        title: string;
        message: string;
        link?: string;
    }): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
