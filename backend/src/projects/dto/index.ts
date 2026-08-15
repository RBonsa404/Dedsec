import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Project Alpha' })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'A top-secret project' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Storage quota must be an integer' })
  @Min(50, { message: 'Storage quota must be at least 50MB' })
  storageQuotaMb?: number;
}

export class UpdateProjectDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;
}
