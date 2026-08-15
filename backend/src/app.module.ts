import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma-client';
import { EmailModule } from './email/email.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { BoardsModule } from './boards/boards.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { AbsencesModule } from './absences/absences.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { SchedulerModule } from './common/scheduler.module';
import { CustomThrottlerModule } from './common/throttler.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { PasswordChangeGuard } from './common/guards/password-change.guard';
import { SecurityLoggingInterceptor } from './common/interceptors/security-logging.interceptor';
import { GlobalExceptionFilter } from './common/filters';

import { AppController } from './app.controller';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    BoardsModule,
    TasksModule,
    NotificationsModule,
    AuditLogModule,
    AbsencesModule,
    AnnouncementsModule,
    WebsocketsModule,
    SchedulerModule,
    CustomThrottlerModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    PasswordChangeGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [PasswordChangeGuard, CustomThrottlerModule],
})
export class AppModule {}
