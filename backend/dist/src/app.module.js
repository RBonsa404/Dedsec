"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_client_1 = require("./prisma-client");
const email_module_1 = require("./email/email.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const projects_module_1 = require("./projects/projects.module");
const boards_module_1 = require("./boards/boards.module");
const tasks_module_1 = require("./tasks/tasks.module");
const notifications_module_1 = require("./notifications/notifications.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const absences_module_1 = require("./absences/absences.module");
const announcements_module_1 = require("./announcements/announcements.module");
const websockets_module_1 = require("./websockets/websockets.module");
const filters_1 = require("./common/filters");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_client_1.PrismaModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            projects_module_1.ProjectsModule,
            boards_module_1.BoardsModule,
            tasks_module_1.TasksModule,
            notifications_module_1.NotificationsModule,
            audit_log_module_1.AuditLogModule,
            absences_module_1.AbsencesModule,
            announcements_module_1.AnnouncementsModule,
            websockets_module_1.WebsocketsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: filters_1.GlobalExceptionFilter,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map