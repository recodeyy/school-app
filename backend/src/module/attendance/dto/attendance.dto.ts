import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum AttendanceStatusEnum {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export class AttendanceRecordEntryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student user UUID',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatusEnum, example: 'PRESENT' })
  @IsEnum(AttendanceStatusEnum)
  status: string;

  @ApiPropertyOptional({
    example: 'Late by 5 mins',
    description: 'Optional note',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateAttendanceSessionDto {
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

  @ApiProperty({
    example: '2026-05-07',
    description: 'Attendance date (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '09:00', description: 'Period start time (HH:mm)' })
  @IsString()
  startTime: string;

  @ApiProperty({
    type: [AttendanceRecordEntryDto],
    description: 'Attendance entries for each student',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordEntryDto)
  records: AttendanceRecordEntryDto[];
}

export class QueryAttendanceDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Student UUID',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    example: '2026-05-01',
    description: 'Start date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-31',
    description: 'End date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '1', description: 'Page number' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20', description: 'Items per page' })
  @IsOptional()
  @IsString()
  limit?: string;
}
