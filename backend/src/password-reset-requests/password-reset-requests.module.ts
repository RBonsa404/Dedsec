import { Module } from '@nestjs/common';
import { PasswordResetRequestsService } from './password-reset-requests.service';
import { PasswordResetRequestsController } from './password-reset-requests.controller';
import { PrismaModule } from '../prisma-client';

@Module({
  imports: [PrismaModule],
  controllers: [PasswordResetRequestsController],
  providers: [PasswordResetRequestsService],
  exports: [PasswordResetRequestsService],
})
export class PasswordResetRequestsModule {}