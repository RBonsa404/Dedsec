import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto, CreateChecklistDto, CreateChecklistItemDto, CreateCommentDto, AddLabelDto, AddDependencyDto } from './dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, user: any): Promise<{
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
    getMyTasks(user: any, projectId?: string, priority?: string, overdue?: boolean): Promise<({
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
    createFromTemplate(templateId: string, columnId: string, user: any): Promise<{
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
    update(id: string, dto: UpdateTaskDto, user: any): Promise<{
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
    move(id: string, dto: MoveTaskDto, user: any): Promise<{
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
    addComment(id: string, dto: CreateCommentDto, user: any): Promise<{
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
    getComments(id: string): Promise<({
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
    addChecklist(id: string, dto: CreateChecklistDto, user: any): Promise<{
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
    addChecklistItem(checklistId: string, dto: CreateChecklistItemDto, user: any): Promise<{
        id: string;
        position: number;
        isCompleted: boolean;
        text: string;
        checklistId: string;
    }>;
    toggleChecklistItem(itemId: string, user: any): Promise<{
        id: string;
        position: number;
        isCompleted: boolean;
        text: string;
        checklistId: string;
    }>;
    addLabel(id: string, dto: AddLabelDto): Promise<{
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
    removeLabel(id: string, labelId: string): Promise<{
        message: string;
    }>;
    addDependency(id: string, dto: AddDependencyDto): Promise<{
        id: string;
        taskId: string;
        dependsOnId: string;
    }>;
    removeDependency(id: string, depId: string): Promise<{
        message: string;
    }>;
}
