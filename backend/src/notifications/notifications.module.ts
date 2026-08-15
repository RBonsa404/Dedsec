import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationAutomationService } from './notification-automation.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationAutomationService],
  exports: [NotificationsService, NotificationAutomationService],
})
export class NotificationsModule {}
