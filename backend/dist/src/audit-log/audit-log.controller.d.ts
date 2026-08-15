import { AuditAction } from '../common/enums';
import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private auditLogService;
    constructor(auditLogService: AuditLogService);
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
