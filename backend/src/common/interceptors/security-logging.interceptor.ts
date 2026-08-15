import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SecurityLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('SecurityLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const timestamp = new Date().toISOString();

    // Log sensitive security events
    const sensitiveRoutes = ['/auth/login', '/auth/change-password', '/auth/forgot-password', '/auth/reset-password'];
    const isSensitive = sensitiveRoutes.some(route => url.includes(route));

    if (isSensitive) {
      this.logger.log(`[SECURITY] ${timestamp} | ${method} ${url} | IP: ${ip} | User-Agent: ${userAgent}`);
    }

    // Log authentication attempts
    if (url.includes('/auth/login')) {
      this.logger.log(`[AUTH_ATTEMPT] ${timestamp} | IP: ${ip} | Email: ${request.body?.email || 'unknown'}`);
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          if (isSensitive) {
            this.logger.log(`[SECURITY_SUCCESS] ${timestamp} | ${method} ${url} | IP: ${ip}`);
          }
        },
        error: (error) => {
          this.logger.error(`[SECURITY_ERROR] ${timestamp} | ${method} ${url} | IP: ${ip} | Error: ${error.message}`);
        },
      }),
    );
  }
}