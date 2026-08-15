import { AuthService } from './auth.service';
import { LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
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
    changePassword(dto: ChangePasswordDto, authHeader?: string): Promise<{
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
}
