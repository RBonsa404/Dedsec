import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Role } from '../common/enums';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto, CreateChecklistDto, CreateChecklistItemDto, CreateCommentDto, AddLabelDto, AddDependencyDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create a task (PM only)' })
  async create(@Body() dto: CreateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.create(dto, user.id);
  }

  @Get('my-tasks')
  @ApiOperation({ summary: 'Get my assigned tasks' })
  async getMyTasks(
    @CurrentUser() user: any,
    @Query('projectId') projectId?: string,
    @Query('priority') priority?: string,
    @Query('overdue') overdue?: boolean,
  ) {
    return this.tasksService.getMyTasks(user.id, { projectId, priority, overdue });
  }

  @Get('templates/:projectId')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Get task templates for project' })
  async getTemplates(@Param('projectId') projectId: string) {
    return this.tasksService.getTemplates(projectId);
  }

  @Post('from-template/:templateId')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create task from template' })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body('columnId') columnId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.createFromTemplate(templateId, columnId, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details' })
  async findById(@Param('id') id: string) {
    return this.tasksService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: any) {
    return this.tasksService.update(id, dto, user.id, user.role);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Move task (drag & drop)' })
  async move(@Param('id') id: string, @Body() dto: MoveTaskDto, @CurrentUser() user: any) {
    return this.tasksService.move(id, dto, user.id);
  }

  @Patch(':id/archive')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Archive task (PM only)' })
  async archive(@Param('id') id: string) {
    return this.tasksService.archive(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Delete task (PM only)' })
  async delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  // ─── Comments ───
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: any) {
    return this.tasksService.addComment(id, dto.content, user.id);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get task comments' })
  async getComments(@Param('id') id: string) {
    return this.tasksService.getComments(id);
  }

  // ─── Checklists ───
  @Post(':id/checklists')
  @ApiOperation({ summary: 'Add checklist to task (Assignee or PM only)' })
  async addChecklist(
    @Param('id') id: string,
    @Body() dto: CreateChecklistDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.addChecklist(id, dto.title, user.id, user.role);
  }

  @Post('checklists/:checklistId/items')
  @ApiOperation({ summary: 'Add item to checklist (Assignee or PM only)' })
  async addChecklistItem(
    @Param('checklistId') checklistId: string,
    @Body() dto: CreateChecklistItemDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.addChecklistItem(checklistId, dto.text, user.id, user.role);
  }

  @Patch('checklists/items/:itemId/toggle')
  @ApiOperation({ summary: 'Toggle checklist item (Assignee or PM only)' })
  async toggleChecklistItem(
    @Param('itemId') itemId: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.toggleChecklistItem(itemId, user.id, user.role);
  }

  // ─── Labels ───
  @Post(':id/labels')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Add label to task' })
  async addLabel(@Param('id') id: string, @Body() dto: AddLabelDto) {
    return this.tasksService.addLabel(id, dto.labelId);
  }

  @Delete(':id/labels/:labelId')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Remove label from task' })
  async removeLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
    return this.tasksService.removeLabel(id, labelId);
  }

  // ─── Dependencies ───
  @Post(':id/dependencies')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Add task dependency' })
  async addDependency(@Param('id') id: string, @Body() dto: AddDependencyDto) {
    return this.tasksService.addDependency(id, dto.dependsOnId);
  }

  @Delete(':id/dependencies/:depId')
  @UseGuards(RolesGuard)
  @Roles(Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Remove task dependency' })
  async removeDependency(@Param('id') id: string, @Param('depId') depId: string) {
    return this.tasksService.removeDependency(id, depId);
  }
}
