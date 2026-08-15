import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma-client';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Allow if no user (public routes)
    if (!user) {
      return true;
    }

    // Allow password change and auth endpoints
    const isPasswordChangeEndpoint = request.url.includes('/change-password') ||
                                    request.url.includes('/reset-password') ||
                                    request.url.includes('/forgot-password') ||
                                    request.url.includes('/auth');

    if (isPasswordChangeEndpoint) {
      return true;
    }

    // Check if user needs to change password
    try {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { status: true }
      });

      if (!dbUser) {
        throw new ForbiddenException('User not found');
      }

      if (dbUser.status === 'PENDING_PASSWORD_CHANGE') {
        throw new ForbiddenException({
          message: 'Vous devez changer votre mot de passe avant de continuer',
          requirePasswordChange: true,
          redirectTo: '/change-password'
        });
      }
    } catch (error) {
      // If database query fails, allow the request to avoid blocking legitimate users
      console.error('Password change guard error:', error);
    }

    return true;
  }
}