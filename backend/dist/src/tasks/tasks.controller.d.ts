import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto, CreateChecklistDto, CreateChecklistItemDto, CreateCommentDto, AddLabelDto, AddDependencyDto } from './dto';
export declare class TasksController {
    private tasksService;
    constructor(tasksService: TasksService);
    create(dto: CreateTaskDto, user: any): Promise<{
        _count: {
            attachments: number;
            comments: number;
        };
        labels: ({
            label: {
                name: string;
                id: string;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    getMyTasks(user: any, projectId?: string, priority?: string, overdue?: boolean): Promise<({
        column: {
            board: {
                project: {
                    name: string;
                    id: string;
                };
            } & {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                projectId: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            color: string | null;
            boardId: string;
        };
        _count: {
            attachments: number;
            comments: number;
            checklists: number;
        };
        labels: ({
            label: {
                name: string;
                id: string;
                projectId: string;
                color: string;
            };
        } & {
            id: string;
            taskId: string;
            labelId: string;
        })[];
    } & {
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
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
                name: string;
                id: string;
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
                text: string;
                id: string;
                position: number;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    })[]>;
    createFromTemplate(templateId: string, columnId: string, user: any): Promise<{
        column: {
            board: {
                projectId: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            color: string | null;
            boardId: string;
        };
        milestone: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
            isCompleted: boolean;
        } | null;
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
                name: string;
                id: string;
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
                text: string;
                id: string;
                position: number;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
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
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            color: string | null;
            boardId: string;
        };
        milestone: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
            isCompleted: boolean;
        } | null;
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
                name: string;
                id: string;
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
                text: string;
                id: string;
                position: number;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    update(id: string, dto: UpdateTaskDto, user: any): Promise<{
        _count: {
            attachments: number;
            comments: number;
        };
        labels: ({
            label: {
                name: string;
                id: string;
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
                text: string;
                id: string;
                position: number;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
        startDate: Date | null;
        estimatedHours: number | null;
        isTemplate: boolean;
        columnId: string;
        assigneeId: string | null;
        creatorId: string;
        milestoneId: string | null;
        completedAt: Date | null;
    }>;
    move(id: string, dto: MoveTaskDto, user: any): Promise<{
        _count: {
            attachments: number;
            comments: number;
        };
        labels: ({
            label: {
                name: string;
                id: string;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
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
        priority: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        title: string;
        position: number;
        isArchived: boolean;
        dueDate: Date | null;
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
            text: string;
            id: string;
            position: number;
            isCompleted: boolean;
            checklistId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        title: string;
        taskId: string;
    }>;
    addChecklistItem(checklistId: string, dto: CreateChecklistItemDto, user: any): Promise<{
        text: string;
        id: string;
        position: number;
        isCompleted: boolean;
        checklistId: string;
    }>;
    toggleChecklistItem(itemId: string, user: any): Promise<{
        text: string;
        id: string;
        position: number;
        isCompleted: boolean;
        checklistId: string;
    }>;
    addLabel(id: string, dto: AddLabelDto): Promise<{
        label: {
            name: string;
            id: string;
            projectId: string;
            color: string;
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
