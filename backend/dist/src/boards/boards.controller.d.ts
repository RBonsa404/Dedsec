import { BoardsService } from './boards.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
export declare class BoardsController {
    private boardsService;
    constructor(boardsService: BoardsService);
    findByProject(projectId: string): Promise<({
        columns: ({
            tasks: ({
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
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: number;
            color: string | null;
            boardId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        projectId: string;
    })[]>;
    findById(id: string): Promise<{
        columns: ({
            tasks: ({
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
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            position: number;
            color: string | null;
            boardId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        projectId: string;
    }>;
    addColumn(id: string, dto: CreateColumnDto): Promise<{
        tasks: {
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
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: number;
        color: string | null;
        boardId: string;
    }>;
    updateColumn(colId: string, dto: UpdateColumnDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: number;
        color: string | null;
        boardId: string;
    }>;
    deleteColumn(colId: string): Promise<{
        message: string;
    }>;
    reorderColumns(id: string, dto: ReorderColumnsDto): Promise<{
        message: string;
    }>;
}
