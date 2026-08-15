import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
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
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
