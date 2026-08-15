import { AuditAction } from '../common/enums';
import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private auditLogService;
    constructor(auditLogService: AuditLogService);
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
    findAll(action?: AuditAction, actorId?: string, from?: string, to?: string): Promise<({
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
}
