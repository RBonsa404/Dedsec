import { BoardsService } from './boards.service';
import { CreateColumnDto, UpdateColumnDto, ReorderColumnsDto } from './dto';
export declare class BoardsController {
    private boardsService;
    constructor(boardsService: BoardsService);
    findByProject(projectId: string): Promise<({
        columns: ({
            tasks: ({
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
                    labelId: string;
                    taskId: string;
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
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            color: string | null;
            boardId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
    })[]>;
    findById(id: string): Promise<{
        columns: ({
            tasks: ({
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
                    labelId: string;
                    taskId: string;
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
            })[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            position: number;
            color: string | null;
            boardId: string;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string;
    }>;
    addColumn(id: string, dto: CreateColumnDto): Promise<{
        tasks: {
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
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        position: number;
        color: string | null;
        boardId: string;
    }>;
    updateColumn(colId: string, dto: UpdateColumnDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
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
