export declare class CreateColumnDto {
    name: string;
    color?: string;
}
export declare class UpdateColumnDto {
    name?: string;
    color?: string;
}
export declare class ReorderColumnsDto {
    columnIds: string[];
}
