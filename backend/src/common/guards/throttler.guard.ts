import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected errorMessage = 'Trop de tentatives, veuillez réessayer plus tard';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Skip throttling for login endpoint completely
    if (request.url.includes('/auth/login')) {
      return true;
    }
    
    // Skip throttling for super admin and admin users
    if (request.user && (request.user.role === 'SUPER_ADMIN' || request.user.role === 'ADMIN')) {
      return true;
    }
    
    return super.canActivate(context);
  }
}