import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum ExamTypeEnum {
  UNIT = 'UNIT',
  MIDTERM = 'MIDTERM',
  FINAL = 'FINAL',
  PRACTICAL = 'PRACTICAL',
  ASSIGNMENT = 'ASSIGNMENT',
}

export class CreateExamDto {
  @ApiProperty({ example: 'Mid-Term Exam 2026', description: 'Exam name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID',
  })
  @IsUUID()
  classId: string;

  @ApiProperty({ enum: ExamTypeEnum, example: 'MIDTERM' })
  @IsEnum(ExamTypeEnum)
  type: string;

  @ApiProperty({ example: 100, description: 'Total marks for the exam' })
  @IsNumber()
  totalMarks: number;

  @ApiProperty({ example: '2026-05-15', description: 'Exam date (YYYY-MM-DD)' })
  @IsDateString()
  examDate: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether results are published',
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class MarkEntryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student UUID',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Subject UUID',
  })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ example: 85.5, description: 'Marks obtained' })
  @IsNumber()
  marksObtained: number;

  @ApiPropertyOptional({ example: 'A', description: 'Grade' })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiPropertyOptional({ example: 'Good performance', description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UploadMarksDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Exam UUID',
  })
  @IsUUID()
  examId: string;

  @ApiProperty({ type: [MarkEntryDto], description: 'Array of mark entries' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkEntryDto)
  marks: MarkEntryDto[];
}

export class PublishResultsDto {
  @ApiProperty({ example: true, description: 'Set publish status' })
  @IsBoolean()
  isPublished: boolean;
}

export class QueryResultsDto {
  @ApiPropertyOptional({ description: 'Exam UUID' })
  @IsOptional()
  @IsUUID()
  examId?: string;

  @ApiPropertyOptional({ description: 'Student UUID' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'Class UUID' })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
