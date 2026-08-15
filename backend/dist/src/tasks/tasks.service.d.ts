import { PrismaService } from '../prisma-client';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
import { Role } from '../common/enums';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTaskDto, userId: string): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        _count: {
            comments: number;
            attachments: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    findById(id: string): Promise<{
        column: {
            board: {
                projectId: string;
            };
        } & {
            id: string;
            position: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            color: string | null;
            boardId: string;
        };
        assignee: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        milestone: {
            id: string;
            description: string | null;
            dueDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            projectId: string;
            isCompleted: boolean;
        } | null;
        comments: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            content: string;
            authorId: string;
        })[];
        checklists: ({
            items: {
                id: string;
                position: number;
                isCompleted: boolean;
                text: string;
                checklistId: string;
            }[];
        } & {
            id: string;
            title: string;
            createdAt: Date;
            taskId: string;
        })[];
        attachments: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            taskId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploaderId: string;
        })[];
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        dependsOn: ({
            dependsOn: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            taskId: string;
            dependsOnId: string;
        })[];
        dependedBy: ({
            task: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            taskId: string;
            dependsOnId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    update(id: string, dto: UpdateTaskDto, userId: string, userRole: Role): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
        checklists: ({
            items: {
                id: string;
                position: number;
                isCompleted: boolean;
                text: string;
                checklistId: string;
            }[];
        } & {
            id: string;
            title: string;
            createdAt: Date;
            taskId: string;
        })[];
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        _count: {
            comments: number;
            attachments: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    move(id: string, dto: MoveTaskDto, userId: string): Promise<{
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        _count: {
            comments: number;
            attachments: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    archive(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getMyTasks(userId: string, filters?: {
        projectId?: string;
        priority?: string;
        overdue?: boolean;
    }): Promise<({
        column: {
            board: {
                project: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                projectId: string;
            };
        } & {
            id: string;
            position: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            color: string | null;
            boardId: string;
        };
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        _count: {
            comments: number;
            checklists: number;
            attachments: number;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    })[]>;
    getTemplates(projectId: string): Promise<({
        checklists: ({
            items: {
                id: string;
                position: number;
                isCompleted: boolean;
                text: string;
                checklistId: string;
            }[];
        } & {
            id: string;
            title: string;
            createdAt: Date;
            taskId: string;
        })[];
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    })[]>;
    createFromTemplate(templateId: string, columnId: string, userId: string): Promise<{
        column: {
            board: {
                projectId: string;
            };
        } & {
            id: string;
            position: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            color: string | null;
            boardId: string;
        };
        assignee: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
        creator: {
            id: string;
            firstName: string;
            lastName: string;
        };
        milestone: {
            id: string;
            description: string | null;
            dueDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            projectId: string;
            isCompleted: boolean;
        } | null;
        comments: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taskId: string;
            content: string;
            authorId: string;
        })[];
        checklists: ({
            items: {
                id: string;
                position: number;
                isCompleted: boolean;
                text: string;
                checklistId: string;
            }[];
        } & {
            id: string;
            title: string;
            createdAt: Date;
            taskId: string;
        })[];
        attachments: ({
            uploader: {
                id: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            taskId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploaderId: string;
        })[];
        labels: ({
            label: {
                id: string;
                name: string;
                color: string;
                projectId: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        dependsOn: ({
            dependsOn: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            taskId: string;
            dependsOnId: string;
        })[];
        dependedBy: ({
            task: {
                id: string;
                title: string;
            };
        } & {
            id: string;
            taskId: string;
            dependsOnId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        position: number;
        priority: string;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isArchived: boolean;
        isTemplate: boolean;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
    }>;
    addComment(taskId: string, content: string, userId: string): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        content: string;
        authorId: string;
    }>;
    getComments(taskId: string): Promise<({
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        taskId: string;
        content: string;
        authorId: string;
    })[]>;
    addChecklist(taskId: string, title: string, userId: string, userRole: Role): Promise<{
        items: {
            id: string;
            position: number;
            isCompleted: boolean;
            text: string;
            checklistId: string;
        }[];
    } & {
        id: string;
        title: string;
        createdAt: Date;
        taskId: string;
    }>;
    addChecklistItem(checklistId: string, text: string, userId: string, userRole: Role): Promise<{
        id: string;
        position: number;
        isCompleted: boolean;
        text: string;
        checklistId: string;
    }>;
    toggleChecklistItem(itemId: string, userId: string, userRole: Role): Promise<{
        id: string;
        position: number;
        isCompleted: boolean;
        text: string;
        checklistId: string;
    }>;
    private ensureChecklistPermission;
    addLabel(taskId: string, labelId: string): Promise<{
        label: {
            id: string;
            name: string;
            color: string;
            projectId: string;
        };
    } & {
        id: string;
        taskId: string;
        labelId: string;
    }>;
    removeLabel(taskId: string, labelId: string): Promise<{
        message: string;
    }>;
    addDependency(taskId: string, dependsOnId: string): Promise<{
        id: string;
        taskId: string;
        dependsOnId: string;
    }>;
    removeDependency(taskId: string, dependsOnId: string): Promise<{
        message: string;
    }>;
    private ensureExists;
}
