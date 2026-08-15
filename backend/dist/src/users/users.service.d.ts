import { PrismaService } from '../prisma-client';
import { EmailService } from '../email/email.service';
import { CreateUserDto, UpdateUserDto, UpdatePreferencesDto } from './dto';
import { Role } from '../common/enums';
export declare class UsersService {
    private prisma;
    private emailService;
    constructor(prisma: PrismaService, emailService: EmailService);
    findAll(currentUserId: string, currentUserRole: Role, filters?: {
        role?: Role;
        status?: string;
        search?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        avatarUrl: string | null;
        phone: string | null;
        createdAt: Date;
        lastLoginAt: Date | null;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
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
    create(dto: CreateUserDto, creatorId: string, creatorRole: Role): Promise<{
        tempPassword: string | undefined;
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
        createdAt: Date;
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
    updatePreferences(id: string, dto: UpdatePreferencesDto): Promise<{
        theme: string;
        notifyEmail: boolean;
        notifyTaskAssigned: boolean;
        notifyDueSoon: boolean;
        notifyComments: boolean;
        notifyMentions: boolean;
    }>;
    suspend(id: string, actorId: string, actorRole: Role): Promise<{
        message: string;
    }>;
    reactivate(id: string, actorId: string, actorRole: Role): Promise<{
        message: string;
    }>;
    delete(id: string, actorId: string, actorRole: Role): Promise<{
        message: string;
    }>;
    forceResetPassword(id: string, actorId: string, actorRole: Role): Promise<{
        message: string;
    }>;
    private ensureExists;
    private generateTempPassword;
}
