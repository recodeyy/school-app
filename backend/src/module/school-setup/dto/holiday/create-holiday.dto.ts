import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({ example: 'Independence Day' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: String, format: 'date', example: '2025-08-15' })
  @IsDateString()
  @Type(() => Date)
  date!: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}
