import { IsNotEmpty, IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbsenceStatus } from '../../common/enums';

export class CreateAbsenceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  justificationUrl?: string;
}

export class ReviewAbsenceDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(AbsenceStatus)
  status: AbsenceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
