"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverableType = exports.AuditAction = exports.NotificationType = exports.AbsenceStatus = exports.TaskPriority = exports.ProjectStatus = exports.AccountStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["PROJECT_MANAGER"] = "PROJECT_MANAGER";
    Role["TEAM_MEMBER"] = "TEAM_MEMBER";
})(Role || (exports.Role = Role = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "ACTIVE";
    AccountStatus["SUSPENDED"] = "SUSPENDED";
    AccountStatus["PENDING_PASSWORD_CHANGE"] = "PENDING_PASSWORD_CHANGE";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["ACTIVE"] = "ACTIVE";
    ProjectStatus["ARCHIVED"] = "ARCHIVED";
    ProjectStatus["COMPLETED"] = "COMPLETED";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "LOW";
    TaskPriority["MEDIUM"] = "MEDIUM";
    TaskPriority["HIGH"] = "HIGH";
    TaskPriority["URGENT"] = "URGENT";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var AbsenceStatus;
(function (AbsenceStatus) {
    AbsenceStatus["PENDING"] = "PENDING";
    AbsenceStatus["APPROVED"] = "APPROVED";
    AbsenceStatus["REJECTED"] = "REJECTED";
})(AbsenceStatus || (exports.AbsenceStatus = AbsenceStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["TASK_ASSIGNED"] = "TASK_ASSIGNED";
    NotificationType["TASK_DUE_SOON"] = "TASK_DUE_SOON";
    NotificationType["TASK_OVERDUE"] = "TASK_OVERDUE";
    NotificationType["COMMENT_ADDED"] = "COMMENT_ADDED";
    NotificationType["MENTION"] = "MENTION";
    NotificationType["ABSENCE_REQUEST"] = "ABSENCE_REQUEST";
    NotificationType["ABSENCE_RESPONSE"] = "ABSENCE_RESPONSE";
    NotificationType["ANNOUNCEMENT"] = "ANNOUNCEMENT";
    NotificationType["PROJECT_INVITATION"] = "PROJECT_INVITATION";
    NotificationType["MILESTONE_REACHED"] = "MILESTONE_REACHED";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_CREATED"] = "USER_CREATED";
    AuditAction["USER_SUSPENDED"] = "USER_SUSPENDED";
    AuditAction["USER_REACTIVATED"] = "USER_REACTIVATED";
    AuditAction["USER_DELETED"] = "USER_DELETED";
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["USER_LOGOUT"] = "USER_LOGOUT";
    AuditAction["USER_PASSWORD_RESET"] = "USER_PASSWORD_RESET";
    AuditAction["PROJECT_CREATED"] = "PROJECT_CREATED";
    AuditAction["PROJECT_ARCHIVED"] = "PROJECT_ARCHIVED";
    AuditAction["PROJECT_DELETED"] = "PROJECT_DELETED";
    AuditAction["TASK_CREATED"] = "TASK_CREATED";
    AuditAction["TASK_UPDATED"] = "TASK_UPDATED";
    AuditAction["TASK_DELETED"] = "TASK_DELETED";
    AuditAction["MEMBER_ADDED"] = "MEMBER_ADDED";
    AuditAction["MEMBER_REMOVED"] = "MEMBER_REMOVED";
    AuditAction["ABSENCE_SUBMITTED"] = "ABSENCE_SUBMITTED";
    AuditAction["ABSENCE_APPROVED"] = "ABSENCE_APPROVED";
    AuditAction["ABSENCE_REJECTED"] = "ABSENCE_REJECTED";
    AuditAction["ANNOUNCEMENT_CREATED"] = "ANNOUNCEMENT_CREATED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var DeliverableType;
(function (DeliverableType) {
    DeliverableType["DELIVERABLE"] = "DELIVERABLE";
    DeliverableType["REPORT"] = "REPORT";
})(DeliverableType || (exports.DeliverableType = DeliverableType = {}));
//# sourceMappingURL=enums.js.map