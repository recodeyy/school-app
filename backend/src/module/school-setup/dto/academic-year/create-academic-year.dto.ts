import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025-2026' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: String, format: 'date', example: '2025-04-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ type: String, format: 'date', example: '2026-03-31' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
