import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma-client';
import { PasswordValidator } from '../common/utils/password.validator';
import * as bcrypt from 'bcrypt';
import * as uuid from 'uuid';

@Injectable()
export class PasswordResetRequestsService {
  constructor(private prisma: PrismaService) {}

  async createResetRequest(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return { message: 'Si cet email existe, un lien de réinitialisation sera envoyé' };
    }

    // Create a password reset request
    const resetToken = uuid.v4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.passwordResetRequest.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Log the request for audit
    await this.prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_REQUESTED',
        actorId: user.id,
        details: JSON.stringify({ email: user.email, token: resetToken }),
      },
    });

    return { 
      message: 'Demande de réinitialisation créée',
      token: resetToken, // In production, this would be sent via email
      userId: user.id 
    };
  }

  async getAllPendingRequests(actorId: string, actorRole: string) {
    // Only SUPER_ADMIN can see all pending requests
    if (actorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seul un SUPER_ADMIN peut voir les demandes de réinitialisation');
    }

    const requests = await this.prisma.passwordResetRequest.findMany({
      where: {
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  }

  async approveResetRequest(requestId: string, actorId: string, actorRole: string) {
    // Only SUPER_ADMIN can approve reset requests
    if (actorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seul un SUPER_ADMIN peut approuver les demandes de réinitialisation');
    }

    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Demande de réinitialisation non trouvée');
    }

    if (request.used) {
      throw new ForbiddenException('Cette demande a déjà été utilisée');
    }

    if (request.expiresAt < new Date()) {
      throw new ForbiddenException('Cette demande a expiré');
    }

    // Generate a temporary password
    const tempPassword = this.generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Update user password
    await this.prisma.user.update({
      where: { id: request.userId },
      data: {
        passwordHash,
        status: 'PENDING_PASSWORD_CHANGE',
      },
    });

    // Mark request as used
    await this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        used: true,
        processedBy: actorId,
        processedAt: new Date(),
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_APPROVED',
        actorId,
        details: JSON.stringify({ 
          requestId, 
          userId: request.userId, 
          email: request.user.email,
          tempPassword 
        }),
      },
    });

    return { 
      message: 'Réinitialisation approuvée avec succès',
      tempPassword,
      userId: request.userId 
    };
  }

  async rejectResetRequest(requestId: string, reason: string, actorId: string, actorRole: string) {
    // Only SUPER_ADMIN can reject reset requests
    if (actorRole !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Seul un SUPER_ADMIN peut rejeter les demandes de réinitialisation');
    }

    const request = await this.prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Demande de réinitialisation non trouvée');
    }

    if (request.used) {
      throw new ForbiddenException('Cette demande a déjà été traitée');
    }

    // Mark request as used (rejected)
    await this.prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        used: true,
        processedBy: actorId,
        processedAt: new Date(),
      },
    });

    // Log the action
    await this.prisma.auditLog.create({
      data: {
        action: 'PASSWORD_RESET_REJECTED',
        actorId,
        details: JSON.stringify({ 
          requestId, 
          userId: request.userId, 
          email: request.user.email,
          reason 
        }),
      },
    });

    return { message: 'Demande de réinitialisation rejetée' };
  }

  private generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}