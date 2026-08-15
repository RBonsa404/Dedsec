import { PrismaService } from '../prisma-client';
export declare class AnnouncementsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    create(title: string, content: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        isActive: boolean;
    }>;
    update(id: string, data: {
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
