import { AbsenceStatus } from '../../common/enums';
export declare class CreateAbsenceDto {
    reason: string;
    startDate: string;
    endDate: string;
    justificationUrl?: string;
}
export declare class ReviewAbsenceDto {
    status: AbsenceStatus;
    reviewNote?: string;
}
