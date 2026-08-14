import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '../common/enums';
import { BoardsService } from './boards.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  @ApiOperation({ summary: 'Get boards for project' })
  async findByProject(@Param('projectId') projectId: string) {
    return this.boardsService.findByProject(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get board details' })
  async findById(@Param('id') id: string) {
    return this.boardsService.findById(id);
  }

  @Post(':id/columns')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Add column to board' })
  async addColumn(@Param('id') id: string, @Body() dto: CreateColumnDto) {
    return this.boardsService.addColumn(id, dto);
  }

  @Patch('columns/:colId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Update column' })
  async updateColumn(@Param('colId') colId: string, @Body() dto: UpdateColumnDto) {
    return this.boardsService.updateColumn(colId, dto);
  }

  @Delete('columns/:colId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Delete column' })
  async deleteColumn(@Param('colId') colId: string) {
    return this.boardsService.deleteColumn(colId);
  }

  @Patch(':id/columns/reorder')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Reorder columns' })
  async reorderColumns(@Param('id') id: string, @Body() dto: ReorderColumnsDto) {
    return this.boardsService.reorderColumns(id, dto.columnIds);
  }
}
