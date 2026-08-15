import { PrismaService } from '../prisma-client';
import { CreateAbsenceDto, ReviewAbsenceDto } from './dto';
export declare class AbsencesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAbsenceDto, userId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        startDate: Date;
        reason: string;
        endDate: Date;
        justificationUrl: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        requesterId: string;
        reviewerId: string | null;
    }>;
    findByRequester(userId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        startDate: Date;
        reason: string;
        endDate: Date;
        justificationUrl: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        requesterId: string;
        reviewerId: string | null;
    }[]>;
    findPendingForManager(managerId: string, userRole?: string): Promise<({
        requester: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        status: string;
        createdAt: Date;
        startDate: Date;
        reason: string;
        endDate: Date;
        justificationUrl: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        requesterId: string;
        reviewerId: string | null;
    })[]>;
    review(id: string, dto: ReviewAbsenceDto, reviewerId: string): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        startDate: Date;
        reason: string;
        endDate: Date;
        justificationUrl: string | null;
        reviewNote: string | null;
        reviewedAt: Date | null;
        requesterId: string;
        reviewerId: string | null;
    }>;
}
