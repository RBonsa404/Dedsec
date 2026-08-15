import { TaskPriority } from '../../common/enums';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    columnId: string;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    startDate?: string;
    estimatedHours?: number;
    milestoneId?: string;
    isTemplate?: boolean;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    dueDate?: string;
    startDate?: string;
    estimatedHours?: number;
    milestoneId?: string;
}
export declare class MoveTaskDto {
    columnId: string;
    position: number;
}
export declare class CreateChecklistDto {
    title: string;
}
export declare class CreateChecklistItemDto {
    text: string;
}
export declare class CreateCommentDto {
    content: string;
}
export declare class AddLabelDto {
    labelId: string;
}
export declare class AddDependencyDto {
    dependsOnId: string;
}
