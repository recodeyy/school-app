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

export class CreateNoticeDto {
  @ApiProperty({ example: 'Annual Sports Day', description: 'Notice title' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiProperty({
    example: 'Annual Sports Day will be held on 20th May...',
    description: 'Notice content',
  })
  @IsString()
  @MinLength(5)
  content: string;

  @ApiProperty({
    example: ['STUDENT', 'PARENT', 'TEACHER'],
    description: 'Target roles who should see this notice',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  targetRoles: string[];

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID (optional, for class-specific notices)',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({ example: true, description: 'Pin notice to top' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00Z',
    description: 'Expiry date',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateNoticeDto {
  @ApiPropertyOptional({ example: 'Updated Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class QueryNoticeDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
