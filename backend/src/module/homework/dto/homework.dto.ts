import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateHomeworkDto {
  @ApiProperty({
    example: 'Chapter 5 Exercises',
    description: 'Homework title',
  })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({
    example: 'Complete exercises 1-10 from Chapter 5',
    description: 'Description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID',
  })
  @IsUUID()
  classId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Subject UUID',
  })
  @IsUUID()
  subjectId: string;

  @ApiProperty({ example: '2026-05-15', description: 'Due date (YYYY-MM-DD)' })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether homework is published',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateHomeworkDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '2026-05-20' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class SubmitHomeworkDto {
  @ApiPropertyOptional({
    example: 'My completed work and answers...',
    description: 'Submission content',
  })
  @IsOptional()
  @IsString()
  content?: string;
}

export class GradeHomeworkDto {
  @ApiProperty({ example: 'A+', description: 'Grade' })
  @IsString()
  grade: string;

  @ApiPropertyOptional({ example: 'Excellent work!', description: 'Feedback' })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class QueryHomeworkDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Subject UUID',
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
