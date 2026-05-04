import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Grade 10' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ required: false, example: '2025-2026' })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiProperty({ required: false, example: 'uuid-of-academic-year' })
  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @ApiProperty({ required: false, example: 'uuid-of-teacher' })
  @IsOptional()
  @IsUUID()
  classTeacherId?: string;
}
