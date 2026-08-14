import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '../common/enums';
import { AbsencesService } from './absences.service';
import { CreateAbsenceDto, ReviewAbsenceDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Absences')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('absences')
export class AbsencesController {
  constructor(private absencesService: AbsencesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit absence request' })
  async create(@Body() dto: CreateAbsenceDto, @CurrentUser() user: any) {
    return this.absencesService.create(dto, user.id);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Get my absence requests' })
  async getMyRequests(@CurrentUser() user: any) {
    return this.absencesService.findByRequester(user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get pending absence requests (Admin & PM)' })
  async getPending(@CurrentUser() user: any) {
    return this.absencesService.findPendingForManager(user.id, user.role);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Review absence request (Admin & PM)' })
  async review(@Param('id') id: string, @Body() dto: ReviewAbsenceDto, @CurrentUser() user: any) {
    return this.absencesService.review(id, dto, user.id);
  }
}
