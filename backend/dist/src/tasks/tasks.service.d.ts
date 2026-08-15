import { PrismaService } from '../prisma-client';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './dto';
import { Role } from '../common/enums';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateTaskDto, userId: string): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    findById(id: string): Promise<{
        column: {
            board: {
                projectId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: number;
            color: string | null;
            boardId: string;
        };
        milestone: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
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
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
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
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploaderId: string;
            taskId: string;
        })[];
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
        checklists: ({
            items: {
                id: string;
                position: number;
                text: string;
                isCompleted: boolean;
                checklistId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            title: string;
            taskId: string;
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
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    update(id: string, dto: UpdateTaskDto, userId: string, userRole: Role): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
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
                text: string;
                isCompleted: boolean;
                checklistId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            title: string;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    move(id: string, dto: MoveTaskDto, userId: string): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        assignee: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    archive(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
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
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: number;
            color: string | null;
            boardId: string;
        };
        _count: {
            comments: number;
            attachments: number;
            checklists: number;
        };
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    })[]>;
    getTemplates(projectId: string): Promise<({
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
        checklists: ({
            items: {
                id: string;
                position: number;
                text: string;
                isCompleted: boolean;
                checklistId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            title: string;
            taskId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    })[]>;
    createFromTemplate(templateId: string, columnId: string, userId: string): Promise<{
        column: {
            board: {
                projectId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: number;
            color: string | null;
            boardId: string;
        };
        milestone: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
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
        labels: ({
            label: {
                id: string;
                name: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
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
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploaderId: string;
            taskId: string;
        })[];
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
        checklists: ({
            items: {
                id: string;
                position: number;
                text: string;
                isCompleted: boolean;
                checklistId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            title: string;
            taskId: string;
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
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        title: string;
        priority: string;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
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
            text: string;
            isCompleted: boolean;
            checklistId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        taskId: string;
    }>;
    addChecklistItem(checklistId: string, text: string, userId: string, userRole: Role): Promise<{
        id: string;
        position: number;
        text: string;
        isCompleted: boolean;
        checklistId: string;
    }>;
    toggleChecklistItem(itemId: string, userId: string, userRole: Role): Promise<{
        id: string;
        position: number;
        text: string;
        isCompleted: boolean;
        checklistId: string;
    }>;
    private ensureChecklistPermission;
    addLabel(taskId: string, labelId: string): Promise<{
        label: {
            id: string;
            name: string;
            projectId: string;
            color: string;
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
