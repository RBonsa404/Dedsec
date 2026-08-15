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
    create(action: AuditAction, actorId: string | null, details?: string, ipAddress?: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        details: string | null;
        ipAddress: string | null;
        actorId: string | null;
    }>;
}
