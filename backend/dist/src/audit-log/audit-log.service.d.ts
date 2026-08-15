import { PrismaService } from '../prisma-client';
import { AuditAction } from '../common/enums';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        action?: AuditAction;
        actorId?: string;
        from?: string;
        to?: string;
    }): Promise<({
        actor: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        action: string;
        details: string | null;
        ipAddress: string | null;
        actorId: string | null;
    })[]>;
    getStats(): Promise<{
        totalUsers: number;
        activeUsers: number;
        usersByRole: {
            ADMIN: number;
            PROJECT_MANAGER: number;
            TEAM_MEMBER: number;
        };
        totalProjects: number;
        activeProjects: number;
        totalTasks: number;
        totalAbsences: number;
        pendingAbsences: number;
        recentAuditLogs: ({
            actor: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            action: string;
            details: string | null;
            ipAddress: string | null;
            actorId: string | null;
        })[];
    }>;
}
