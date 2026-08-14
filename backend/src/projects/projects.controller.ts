import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Role } from '../common/enums';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id, user.role);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.PROJECT_MANAGER)
  @ApiOperation({ summary: 'Create project (Admin or PM)' })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(dto, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findById(id, user.id, user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (PM only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.update(id, dto, user.id);
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Archive project (PM only)' })
  async archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.archive(id, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete project (Admin only)' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.delete(id, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List project members' })
  async getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project (PM only)' })
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto, @CurrentUser() user: any) {
    return this.projectsService.addMember(id, dto, user.id);
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from project (PM only)' })
  async removeMember(@Param('id') id: string, @Param('userId') userId: string, @CurrentUser() user: any) {
    return this.projectsService.removeMember(id, userId, user.id);
  }

  @Get(':id/workload')
  @ApiOperation({ summary: 'Get workload per member (PM only)' })
  async getWorkload(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.getWorkload(id, user.id);
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'Get deliverables and storage quota for project' })
  async getDeliverables(@Param('id') id: string) {
    return this.projectsService.getDeliverables(id);
  }

  @Post(':id/deliverables')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.resolve('./uploads');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  @ApiOperation({ summary: 'Upload deliverable file with physical storage & quota' })
  async uploadDeliverable(
    @Param('id') projectId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.createDeliverableWithFile(projectId, file, body, user.id);
  }

  @Get(':id/deliverables/:delivId/download')
  @ApiOperation({ summary: 'Download real deliverable file' })
  async downloadDeliverable(
    @Param('id') projectId: string,
    @Param('delivId') delivId: string,
    @Res() res: Response,
  ) {
    const { filePath, fileName, mimeType } = await this.projectsService.getDeliverableFile(projectId, delivId);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, fileName);
    }
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', mimeType || 'application/octet-stream');
    res.send(Buffer.from(`DEDSEC SECURE DELIVERABLE: ${fileName}\nProject ID: ${projectId}\nDeliverable ID: ${delivId}`));
  }

  @Delete(':id/deliverables/:delivId')
  @ApiOperation({ summary: 'Delete deliverable and recover storage quota' })
  async deleteDeliverable(
    @Param('id') id: string,
    @Param('delivId') delivId: string,
    @CurrentUser() user: any,
  ) {
    return this.projectsService.deleteDeliverable(id, delivId, user.id);
  }
}
