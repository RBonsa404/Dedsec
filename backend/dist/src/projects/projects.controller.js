"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path = require("path");
const fs = require("fs");
const enums_1 = require("../common/enums");
const projects_service_1 = require("./projects.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let ProjectsController = class ProjectsController {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async findAll(user) {
        return this.projectsService.findAll(user.id, user.role);
    }
    async create(dto, user) {
        return this.projectsService.create(dto, user.id);
    }
    async findById(id, user) {
        return this.projectsService.findById(id, user.id, user.role);
    }
    async update(id, dto, user) {
        return this.projectsService.update(id, dto, user.id);
    }
    async archive(id, user) {
        return this.projectsService.archive(id, user.id);
    }
    async delete(id, user) {
        return this.projectsService.delete(id, user.id);
    }
    async getMembers(id) {
        return this.projectsService.getMembers(id);
    }
    async addMember(id, dto, user) {
        return this.projectsService.addMember(id, dto, user.id);
    }
    async removeMember(id, userId, user) {
        return this.projectsService.removeMember(id, userId, user.id);
    }
    async getWorkload(id, user) {
        return this.projectsService.getWorkload(id, user.id);
    }
    async getDeliverables(id) {
        return this.projectsService.getDeliverables(id);
    }
    async uploadDeliverable(projectId, file, body, user) {
        return this.projectsService.createDeliverableWithFile(projectId, file, body, user.id);
    }
    async downloadDeliverable(projectId, delivId, res) {
        const { filePath, fileName, mimeType } = await this.projectsService.getDeliverableFile(projectId, delivId);
        if (fs.existsSync(filePath)) {
            return res.download(filePath, fileName);
        }
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', mimeType || 'application/octet-stream');
        res.send(Buffer.from(`DEDSEC SECURE DELIVERABLE: ${fileName}\nProject ID: ${projectId}\nDeliverable ID: ${delivId}`));
    }
    async deleteDeliverable(id, delivId, user) {
        return this.projectsService.deleteDeliverable(id, delivId, user.id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List projects' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create project (Admin or PM)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, swagger_1.ApiOperation)({ summary: 'Archive project (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Delete project (Admin only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'List project members' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getMembers", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to project (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddMemberDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from project (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':id/workload'),
    (0, swagger_1.ApiOperation)({ summary: 'Get workload per member (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getWorkload", null);
__decorate([
    (0, common_1.Get)(':id/deliverables'),
    (0, swagger_1.ApiOperation)({ summary: 'Get deliverables and storage quota for project' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getDeliverables", null);
__decorate([
    (0, common_1.Post)(':id/deliverables'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const uploadPath = path.resolve('./uploads');
                if (!fs.existsSync(uploadPath))
                    fs.mkdirSync(uploadPath, { recursive: true });
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = path.extname(file.originalname);
                cb(null, `${uniqueSuffix}${ext}`);
            },
        }),
        limits: { fileSize: 100 * 1024 * 1024 },
    })),
    (0, swagger_1.ApiOperation)({ summary: 'Upload deliverable file with physical storage & quota' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadDeliverable", null);
__decorate([
    (0, common_1.Get)(':id/deliverables/:delivId/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download real deliverable file' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('delivId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "downloadDeliverable", null);
__decorate([
    (0, common_1.Delete)(':id/deliverables/:delivId'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete deliverable and recover storage quota' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('delivId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteDeliverable", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map