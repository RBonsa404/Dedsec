import { AbsencesService } from './absences.service';
import { CreateAbsenceDto, ReviewAbsenceDto } from './dto';
export declare class AbsencesController {
    private absencesService;
    constructor(absencesService: AbsencesService);
    create(dto: CreateAbsenceDto, user: any): Promise<{
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
    getMyRequests(user: any): Promise<{
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
    getPending(user: any): Promise<({
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
    review(id: string, dto: ReviewAbsenceDto, user: any): Promise<{
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
