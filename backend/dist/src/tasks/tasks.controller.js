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
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../common/enums");
const tasks_service_1 = require("./tasks.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let TasksController = class TasksController {
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(dto, user) {
        return this.tasksService.create(dto, user.id);
    }
    async getMyTasks(user, projectId, priority, overdue) {
        return this.tasksService.getMyTasks(user.id, { projectId, priority, overdue });
    }
    async getTemplates(projectId) {
        return this.tasksService.getTemplates(projectId);
    }
    async createFromTemplate(templateId, columnId, user) {
        return this.tasksService.createFromTemplate(templateId, columnId, user.id);
    }
    async findById(id) {
        return this.tasksService.findById(id);
    }
    async update(id, dto, user) {
        return this.tasksService.update(id, dto, user.id, user.role);
    }
    async move(id, dto, user) {
        return this.tasksService.move(id, dto, user.id);
    }
    async archive(id) {
        return this.tasksService.archive(id);
    }
    async delete(id) {
        return this.tasksService.delete(id);
    }
    async addComment(id, dto, user) {
        return this.tasksService.addComment(id, dto.content, user.id);
    }
    async getComments(id) {
        return this.tasksService.getComments(id);
    }
    async addChecklist(id, dto, user) {
        return this.tasksService.addChecklist(id, dto.title, user.id, user.role);
    }
    async addChecklistItem(checklistId, dto, user) {
        return this.tasksService.addChecklistItem(checklistId, dto.text, user.id, user.role);
    }
    async toggleChecklistItem(itemId, user) {
        return this.tasksService.toggleChecklistItem(itemId, user.id, user.role);
    }
    async addLabel(id, dto) {
        return this.tasksService.addLabel(id, dto.labelId);
    }
    async removeLabel(id, labelId) {
        return this.tasksService.removeLabel(id, labelId);
    }
    async addDependency(id, dto) {
        return this.tasksService.addDependency(id, dto.dependsOnId);
    }
    async removeDependency(id, depId) {
        return this.tasksService.removeDependency(id, depId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a task (PM only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-tasks'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my assigned tasks' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Query)('priority')),
    __param(3, (0, common_1.Query)('overdue')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getMyTasks", null);
__decorate([
    (0, common_1.Get)('templates/:projectId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get task templates for project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Post)('from-template/:templateId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create task from template' }),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Body)('columnId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "createFromTemplate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get task details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/move'),
    (0, swagger_1.ApiOperation)({ summary: 'Move task (drag & drop)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.MoveTaskDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "move", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Archive task (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete task (PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Add comment to task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    (0, swagger_1.ApiOperation)({ summary: 'Get task comments' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/checklists'),
    (0, swagger_1.ApiOperation)({ summary: 'Add checklist to task (Assignee or PM only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateChecklistDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addChecklist", null);
__decorate([
    (0, common_1.Post)('checklists/:checklistId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to checklist (Assignee or PM only)' }),
    __param(0, (0, common_1.Param)('checklistId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateChecklistItemDto, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addChecklistItem", null);
__decorate([
    (0, common_1.Patch)('checklists/items/:itemId/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle checklist item (Assignee or PM only)' }),
    __param(0, (0, common_1.Param)('itemId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "toggleChecklistItem", null);
__decorate([
    (0, common_1.Post)(':id/labels'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add label to task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddLabelDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addLabel", null);
__decorate([
    (0, common_1.Delete)(':id/labels/:labelId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Remove label from task' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('labelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "removeLabel", null);
__decorate([
    (0, common_1.Post)(':id/dependencies'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add task dependency' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddDependencyDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "addDependency", null);
__decorate([
    (0, common_1.Delete)(':id/dependencies/:depId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Remove task dependency' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('depId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "removeDependency", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('Tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map