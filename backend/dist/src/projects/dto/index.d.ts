export declare class CreateProjectDto {
    name: string;
    description?: string;
    storageQuotaMb?: number;
}
export declare class UpdateProjectDto {
    name?: string;
    description?: string;
}
export declare class AddMemberDto {
    userId: string;
}
