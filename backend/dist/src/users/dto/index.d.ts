import { Role } from '../../common/enums';
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone?: string;
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatarUrl?: string;
}
export declare class UpdatePreferencesDto {
    theme?: string;
    notifyEmail?: boolean;
    notifyTaskAssigned?: boolean;
    notifyDueSoon?: boolean;
    notifyComments?: boolean;
    notifyMentions?: boolean;
}
