import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: any, unreadOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        title: string;
        message: string;
        isRead: boolean;
        link: string | null;
    }[]>;
    getUnreadCount(user: any): Promise<{
        count: number;
    }>;
    markAsRead(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
