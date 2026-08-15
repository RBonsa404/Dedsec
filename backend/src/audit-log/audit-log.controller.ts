import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role, AuditAction } from '../common/enums';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get live admin system statistics and telemetry' })
  async getStats() {
    return this.auditLogService.getStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get audit logs (Admin only)' })
  async findAll(
    @Query('action') action?: AuditAction,
    @Query('actorId') actorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.auditLogService.findAll({ action, actorId, from, to });
  }
}
