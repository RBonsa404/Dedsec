import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PasswordResetRequestsService } from './password-reset-requests.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Password Reset Requests')
@ApiBearerAuth()
@Controller('password-reset-requests')
export class PasswordResetRequestsController {
  constructor(private passwordResetRequestsService: PasswordResetRequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a password reset request' })
  async createRequest(@Body('email') email: string) {
    return this.passwordResetRequestsService.createResetRequest(email);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all pending password reset requests (SUPER_ADMIN only)' })
  async getPendingRequests(@CurrentUser() user: any) {
    return this.passwordResetRequestsService.getAllPendingRequests(user.id, user.role);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Approve a password reset request (SUPER_ADMIN only)' })
  async approveRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.passwordResetRequestsService.approveResetRequest(id, user.id, user.role);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject a password reset request (SUPER_ADMIN only)' })
  async rejectRequest(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any
  ) {
    return this.passwordResetRequestsService.rejectResetRequest(id, reason, user.id, user.role);
  }
}