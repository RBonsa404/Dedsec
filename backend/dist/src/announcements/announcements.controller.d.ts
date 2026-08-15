import { AnnouncementsService } from './announcements.service';
export declare class AnnouncementsController {
    private announcementsService;
    constructor(announcementsService: AnnouncementsService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        isActive: boolean;
    }[]>;
    findAllAdmin(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        isActive: boolean;
    }[]>;
    create(body: {
        title: string;
        content: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        isActive: boolean;
    }>;
    update(id: string, body: {
        title?: string;
        content?: string;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        isActive: boolean;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
