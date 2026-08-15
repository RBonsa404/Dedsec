"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const uuid_1 = require("uuid");
const prisma_client_1 = require("../prisma-client");
const email_service_1 = require("../email/email.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.logger = new common_1.Logger('AuthService');
    }
    async login(payload) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException('Your account has been suspended. Contact an administrator.');
        }
        const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        if (user.status === 'PENDING_PASSWORD_CHANGE') {
            const tempToken = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role, mustChangePassword: true }, { expiresIn: '30m' });
            return {
                mustChangePassword: true,
                tempToken,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
            };
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            mustChangePassword: false,
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatarUrl: user.avatarUrl,
                theme: user.theme,
            },
        };
    }
    async changePassword(userId, oldPassword, newPassword, bearerToken) {
        if (!newPassword || newPassword.length < 8) {
            throw new common_1.BadRequestException('New password must be at least 8 characters');
        }
        let targetUserId = userId;
        if (bearerToken) {
            try {
                const decoded = this.jwtService.verify(bearerToken);
                targetUserId = decoded.sub;
            }
            catch (err) {
                throw new common_1.UnauthorizedException('Invalid or expired authentication/temp token');
            }
        }
        if (!targetUserId) {
            throw new common_1.BadRequestException('User identification is required');
        }
        const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        if (oldPassword) {
            const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!isValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                passwordHash,
                status: 'ACTIVE',
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return {
            message: 'Password changed successfully',
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                avatarUrl: user.avatarUrl,
                theme: user.theme,
            },
        };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return { message: 'If this email exists, a reset link has been sent.' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });
        await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
        return { message: 'If this email exists, a reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gt: new Date() },
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        if (newPassword.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters');
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetToken: null,
                resetTokenExpiry: null,
                status: 'ACTIVE',
            },
        });
        return { message: 'Password reset successfully' };
    }
    async refreshTokens(refreshToken) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        const tokens = await this.generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
        return tokens;
    }
    async logout(refreshToken) {
        try {
            await this.prisma.refreshToken.deleteMany({
                where: { token: refreshToken },
            });
        }
        catch {
        }
        return { message: 'Logged out successfully' };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        });
        const refreshToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId,
                expiresAt,
            },
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_client_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map