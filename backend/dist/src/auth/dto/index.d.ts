export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ChangePasswordDto {
    userId?: string;
    oldPassword?: string;
    newPassword: string;
    tempToken?: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
