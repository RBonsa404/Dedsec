import { PrismaService } from '../prisma-client';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto } from './dto';
import { Role } from '../common/enums';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, userRole: Role): Promise<({
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
        description: string | null;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    })[]>;
    findById(id: string, userId: string, userRole: Role): Promise<{
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
                    description: string | null;
                    priority: string;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
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
        })[];
        milestones: {
            description: string | null;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
            dueDate: Date | null;
            isCompleted: boolean;
        }[];
        labels: {
            name: string;
            id: string;
            projectId: string;
            color: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    create(dto: CreateProjectDto, userId: string): Promise<{
        members: {
            id: string;
            userId: string;
            projectId: string;
            isManager: boolean;
            joinedAt: Date;
        }[];
        boards: ({
            columns: {
                name: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                position: number;
                color: string | null;
                boardId: string;
            }[];
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string;
        })[];
        labels: {
            name: string;
            id: string;
            projectId: string;
            color: string;
        }[];
    } & {
        description: string | null;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    update(id: string, dto: UpdateProjectDto, userId: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    archive(id: string, userId: string): Promise<{
        description: string | null;
        name: string;
        id: string;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        storageQuotaMb: number;
        storageUsedMb: number;
        archivedAt: Date | null;
    }>;
    delete(id: string, actorId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, dto: AddMemberDto, userId: string): Promise<{
        message: string;
    }>;
    removeMember(projectId: string, memberId: string, userId: string): Promise<{
        message: string;
    }>;
    getMembers(projectId: string): Promise<({
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
    getWorkload(projectId: string, userId: string): Promise<{
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
    getActivityLog(projectId: string, userId: string): Promise<({
        user: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        projectId: string;
        action: string;
        details: string | null;
    })[]>;
    getDeliverables(projectId: string): Promise<{
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
            version: number;
            id: string;
            createdAt: Date;
            type: string;
            projectId: string;
            fileName: string;
            fileUrl: string;
            fileSize: number;
            mimeType: string;
            uploaderId: string;
        })[];
    }>;
    createDeliverableWithFile(projectId: string, file: Express.Multer.File | undefined, body: any, userId: string): Promise<{
        uploader: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        version: number;
        id: string;
        createdAt: Date;
        type: string;
        projectId: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploaderId: string;
    }>;
    getDeliverableFile(projectId: string, deliverableId: string): Promise<{
        filePath: string;
        fileName: string;
        mimeType: string;
    }>;
    deleteDeliverable(projectId: string, deliverableId: string, userId: string): Promise<{
        message: string;
    }>;
    private ensureManager;
}
