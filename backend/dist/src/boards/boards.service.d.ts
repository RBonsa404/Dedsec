import { PrismaService } from '../prisma-client';
import { CreateColumnDto, UpdateColumnDto } from './dto';
export declare class BoardsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    addColumn(boardId: string, dto: CreateColumnDto): Promise<{
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
    updateColumn(columnId: string, dto: UpdateColumnDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        position: number;
        color: string | null;
        boardId: string;
    }>;
    deleteColumn(columnId: string): Promise<{
        message: string;
    }>;
    reorderColumns(boardId: string, columnIds: string[]): Promise<{
        message: string;
    }>;
}
