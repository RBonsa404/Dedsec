import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma-client';
import { EmailService } from '../email/email.service';
interface LoginPayload {
    email: string;
    password: string;
}
export declare class AuthService {
    private prisma;
    private jwtService;
    private emailService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, emailService: EmailService);
    login(payload: LoginPayload): Promise<{
        mustChangePassword: boolean;
        tempToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            avatarUrl?: undefined;
            theme?: undefined;
        };
    } | {
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            avatarUrl: string | null;
            theme: string;
        };
        accessToken: string;
        refreshToken: string;
        mustChangePassword: boolean;
        tempToken?: undefined;
    }>;
    changePassword(userId?: string, oldPassword?: string, newPassword?: string, bearerToken?: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            avatarUrl: string | null;
            theme: string;
        };
        accessToken: string;
        refreshToken: string;
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
export {};
