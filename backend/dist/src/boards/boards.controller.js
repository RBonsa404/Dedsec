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
exports.BoardsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../common/enums");
const boards_service_1 = require("./boards.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let BoardsController = class BoardsController {
    constructor(boardsService) {
        this.boardsService = boardsService;
    }
    async findByProject(projectId) {
        return this.boardsService.findByProject(projectId);
    }
    async findById(id) {
        return this.boardsService.findById(id);
    }
    async addColumn(id, dto) {
        return this.boardsService.addColumn(id, dto);
    }
    async updateColumn(colId, dto) {
        return this.boardsService.updateColumn(colId, dto);
    }
    async deleteColumn(colId) {
        return this.boardsService.deleteColumn(colId);
    }
    async reorderColumns(id, dto) {
        return this.boardsService.reorderColumns(id, dto.columnIds);
    }
};
exports.BoardsController = BoardsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get boards for project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "findByProject", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get board details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(':id/columns'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Add column to board' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateColumnDto]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "addColumn", null);
__decorate([
    (0, common_1.Patch)('columns/:colId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update column' }),
    __param(0, (0, common_1.Param)('colId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateColumnDto]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "updateColumn", null);
__decorate([
    (0, common_1.Delete)('columns/:colId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete column' }),
    __param(0, (0, common_1.Param)('colId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "deleteColumn", null);
__decorate([
    (0, common_1.Patch)(':id/columns/reorder'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder columns' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReorderColumnsDto]),
    __metadata("design:returntype", Promise)
], BoardsController.prototype, "reorderColumns", null);
exports.BoardsController = BoardsController = __decorate([
    (0, swagger_1.ApiTags)('Boards'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('projects/:projectId/boards'),
    __metadata("design:paramtypes", [boards_service_1.BoardsService])
], BoardsController);
//# sourceMappingURL=boards.controller.js.map