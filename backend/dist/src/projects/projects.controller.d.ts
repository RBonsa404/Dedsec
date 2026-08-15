import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    findAll(user: any): Promise<({
        _count: {
            members: number;
            boards: number;
        };
        members: {
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
            isManager: boolean;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    })[]>;
    create(dto: CreateProjectDto, user: any): Promise<{
        members: {
            id: string;
            userId: string;
            projectId: string;
            isManager: boolean;
            joinedAt: Date;
        }[];
        boards: ({
            columns: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                position: number;
                color: string | null;
                boardId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            projectId: string;
        })[];
        labels: {
            id: string;
            name: string;
            projectId: string;
            color: string;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    findById(id: string, user: any): Promise<{
        _count: {
            deliverables: number;
            members: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                role: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            userId: string;
            projectId: string;
            isManager: boolean;
            joinedAt: Date;
        })[];
        boards: ({
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
        })[];
        milestones: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string | null;
            projectId: string;
            dueDate: Date | null;
            isCompleted: boolean;
        }[];
        labels: {
            id: string;
            name: string;
            projectId: string;
            color: string;
        }[];
    } & {
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProjectDto, user: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    archive(id: string, user: any): Promise<{
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        description: string | null;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    delete(id: string, user: any): Promise<{
        message: string;
    }>;
    getMembers(id: string): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        userId: string;
        projectId: string;
        isManager: boolean;
        joinedAt: Date;
    })[]>;
    addMember(id: string, dto: AddMemberDto, user: any): Promise<{
        message: string;
    }>;
    removeMember(id: string, userId: string, user: any): Promise<{
        message: string;
    }>;
    getWorkload(id: string, user: any): Promise<{
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        totalTasks: number;
        overdue: number;
        byColumn: Record<string, number>;
    }[]>;
    getDeliverables(id: string): Promise<{
        storageQuotaMb: number;
        storageUsedMb: number;
        deliverables: ({
            uploader: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            projectId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            type: string;
            version: number;
            uploaderId: string;
        })[];
    }>;
    uploadDeliverable(projectId: string, file: Express.Multer.File, body: any, user: any): Promise<{
        uploader: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        projectId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        type: string;
        version: number;
        uploaderId: string;
    }>;
    downloadDeliverable(projectId: string, delivId: string, res: Response): Promise<void>;
    deleteDeliverable(id: string, delivId: string, user: any): Promise<{
        message: string;
    }>;
}
