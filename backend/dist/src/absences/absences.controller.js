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
exports.AbsencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const enums_1 = require("../common/enums");
const absences_service_1 = require("./absences.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
let AbsencesController = class AbsencesController {
    constructor(absencesService) {
        this.absencesService = absencesService;
    }
    async create(dto, user) {
        return this.absencesService.create(dto, user.id);
    }
    async getMyRequests(user) {
        return this.absencesService.findByRequester(user.id);
    }
    async getPending(user) {
        return this.absencesService.findPendingForManager(user.id, user.role);
    }
    async review(id, dto, user) {
        return this.absencesService.review(id, dto, user.id);
    }
};
exports.AbsencesController = AbsencesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit absence request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAbsenceDto, Object]),
    __metadata("design:returntype", Promise)
], AbsencesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my absence requests' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbsencesController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending absence requests (Admin & PM)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbsencesController.prototype, "getPending", null);
__decorate([
    (0, common_1.Patch)(':id/review'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(enums_1.Role.ADMIN, enums_1.Role.PROJECT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Review absence request (Admin & PM)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReviewAbsenceDto, Object]),
    __metadata("design:returntype", Promise)
], AbsencesController.prototype, "review", null);
exports.AbsencesController = AbsencesController = __decorate([
    (0, swagger_1.ApiTags)('Absences'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('absences'),
    __metadata("design:paramtypes", [absences_service_1.AbsencesService])
], AbsencesController);
//# sourceMappingURL=absences.controller.js.map