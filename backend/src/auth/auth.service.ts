import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma-client';
import { EmailService } from '../email/email.service';
import { AccountStatus } from '../common/enums';
import { PasswordValidator } from '../common/utils/password.validator';

interface LoginPayload {
  email: string;
  password: string;
}

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async login(payload: LoginPayload) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenException('Your account has been suspended. Contact an administrator.');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Check if first login (must change password)
    // SUPER_ADMIN is exempt from forced password change
    if (user.status === 'PENDING_PASSWORD_CHANGE' && user.role !== 'SUPER_ADMIN') {
      const tempToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role, mustChangePassword: true },
        { expiresIn: '30m' },
      );
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

    // Generate tokens
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

  async changePassword(userId?: string, oldPassword?: string, newPassword?: string, bearerToken?: string) {
    // Validate new password strength
    if (!newPassword) {
      throw new BadRequestException('New password is required');
    }

    let targetUserId = userId;

    if (bearerToken) {
      try {
        const decoded = this.jwtService.verify(bearerToken);
        targetUserId = decoded.sub;
      } catch (err) {
        throw new UnauthorizedException('Invalid or expired authentication/temp token');
      }
    }

    if (!targetUserId) {
      throw new BadRequestException('User identification is required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Simplified password validation for all users
    PasswordValidator.validateOrThrow(newPassword);

    // If oldPassword provided, verify it (unless authenticated via tempToken with mustChangePassword)
    if (oldPassword) {
      const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isValid) {
        throw new BadRequestException('Current password is incorrect');
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

    // Generate fresh tokens after password change
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

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Simplified password validation for all users
    PasswordValidator.validateOrThrow(newPassword);

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

  async refreshTokens(refreshToken: string) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
    );

    return tokens;
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    } catch {
      // Token may already be deleted
    }
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: TokenPayload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = uuidv4();
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

  async testEmail() {
    this.logger.log('Testing email service...');
    try {
      await this.emailService.sendWelcomeEmail(
        'test@example.com',
        'Test User',
        'TestPassword123'
      );
      return { 
        success: true, 
        message: 'Email test initiated. Check logs for details.' 
      };
    } catch (error) {
      this.logger.error('Email test failed', error);
      return { 
        success: false, 
        message: 'Email test failed. Check logs for details.',
        error: error.message 
      };
    }
  }
}
