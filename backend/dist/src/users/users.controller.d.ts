import { Role } from '../common/enums';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto } from './dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(user: any, role?: Role, status?: string, search?: string): Promise<{
        role: string;
        status: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        phone: string | null;
        createdAt: Date;
        lastLoginAt: Date | null;
    }[]>;
    create(dto: CreateUserDto, user: any): Promise<{
        tempPassword: string;
        role: string;
        status: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        createdAt: Date;
    }>;
    getProfile(user: any): Promise<{
        role: string;
        status: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        bio: string | null;
        phone: string | null;
        theme: string;
        notifyEmail: boolean;
        notifyTaskAssigned: boolean;
        notifyDueSoon: boolean;
        notifyComments: boolean;
        notifyMentions: boolean;
        twoFactorEnabled: boolean;
        createdAt: Date;
        lastLoginAt: Date | null;
    }>;
    updateProfile(user: any, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        bio: string | null;
        phone: string | null;
    }>;
    updatePreferences(user: any, dto: UpdatePreferencesDto): Promise<{
        theme: string;
        notifyEmail: boolean;
        notifyTaskAssigned: boolean;
        notifyDueSoon: boolean;
        notifyComments: boolean;
        notifyMentions: boolean;
    }>;
    findById(id: string): Promise<{
        role: string;
        status: string;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        bio: string | null;
        phone: string | null;
        theme: string;
        notifyEmail: boolean;
        notifyTaskAssigned: boolean;
        notifyDueSoon: boolean;
        notifyComments: boolean;
        notifyMentions: boolean;
        twoFactorEnabled: boolean;
        createdAt: Date;
        lastLoginAt: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        bio: string | null;
        phone: string | null;
    }>;
    suspend(id: string, user: any): Promise<{
        message: string;
    }>;
    reactivate(id: string, user: any): Promise<{
        message: string;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
    forceResetPassword(id: string, user: any): Promise<{
        message: string;
    }>;
}
