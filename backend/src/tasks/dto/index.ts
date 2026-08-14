import { IsNotEmpty, IsString, IsOptional, IsEnum, IsInt, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../common/enums';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login page' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUUID()
  columnId: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiPropertyOptional({ description: 'Create as template' })
  @IsOptional()
  isTemplate?: boolean;
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  milestoneId?: string;
}

export class MoveTaskDto {
  @ApiProperty({ description: 'Target column ID' })
  @IsUUID()
  columnId: string;

  @ApiProperty({ description: 'New position in column' })
  @IsInt()
  @Min(0)
  position: number;
}

export class CreateChecklistDto {
  @ApiProperty({ example: 'Implementation steps' })
  @IsString()
  @IsNotEmpty()
  title: string;
}

export class CreateChecklistItemDto {
  @ApiProperty({ example: 'Set up database' })
  @IsString()
  @IsNotEmpty()
  text: string;
}

export class CreateCommentDto {
  @ApiProperty({ example: 'Looking good, but needs more tests' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class AddLabelDto {
  @ApiProperty()
  @IsUUID()
  labelId: string;
}

export class AddDependencyDto {
  @ApiProperty({ description: 'ID of the task this task depends on' })
  @IsUUID()
  dependsOnId: string;
}
