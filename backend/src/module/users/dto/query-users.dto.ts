import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../../../generated/prisma/client.js';

export class QueryUsersDto {
  @ApiPropertyOptional({
    example: 'STUDENT',
    enum: UserRole,
    description: 'Filter by user role',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter students by class UUID',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search by name or email (case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Page number (starting at 1)',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({
    example: '20',
    description: 'Items per page',
  })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class StudentProfileResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440111',
    description: 'Class UUID',
  })
  classId!: string;

  @ApiPropertyOptional({ example: 'A-01', description: 'Roll number' })
  rollNumber?: string;

  @ApiPropertyOptional({ example: 'ADM001', description: 'Admission number' })
  admissionNumber?: string;

  @ApiPropertyOptional({ example: '2008-05-15', description: 'Date of birth' })
  dob?: Date;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440222',
    description: 'Guardian user UUID',
  })
  guardianId?: string;
}

export class TeacherProfileResponseDto {
  @ApiPropertyOptional({ example: 'EMP001', description: 'Employee ID' })
  employeeId?: string;

  @ApiProperty({
    example: ['Mathematics', 'Physics'],
    description: 'Subjects taught',
    type: [String],
  })
  subjects!: string[];

  @ApiPropertyOptional({
    example: 'Senior Teacher',
    description: 'Designation',
  })
  designation?: string;
}

export class UserResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'User UUID',
  })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address',
  })
  email!: string;

  @ApiPropertyOptional({ example: '9876543210', description: 'Phone number' })
  phone?: string;

  @ApiProperty({ example: 'STUDENT', enum: UserRole, description: 'User role' })
  role!: UserRole;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/avatar.png',
    description: 'Avatar URL',
  })
  avatarUrl?: string;

  @ApiProperty({ example: true, description: 'Whether the account is active' })
  isActive!: boolean;

  @ApiProperty({
    example: '2026-05-04T14:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    example: '2026-05-04T14:10:00.000Z',
    description: 'Last login timestamp',
  })
  lastLoginAt?: Date;

  @ApiPropertyOptional({
    example: {
      classId: '550e8400-e29b-41d4-a716-446655440111',
      rollNumber: 'A-01',
      admissionNumber: 'ADM001',
      dob: '2008-05-15',
      guardianId: '550e8400-e29b-41d4-a716-446655440222',
    },
    type: StudentProfileResponseDto,
  })
  studentProfile?: StudentProfileResponseDto;

  @ApiPropertyOptional({
    example: {
      employeeId: 'EMP001',
      subjects: ['Mathematics', 'Physics'],
      designation: 'Senior Teacher',
    },
    type: TeacherProfileResponseDto,
  })
  teacherProfile?: TeacherProfileResponseDto;
}

export class ImportErrorDto {
  @ApiProperty({
    example: 3,
    description: 'CSV row number (starting from header row)',
  })
  rowNumber!: number;

  @ApiProperty({
    example: 'duplicate@example.com',
    description: 'Email from the failed row',
  })
  email!: string;

  @ApiProperty({
    example: 'User with email duplicate@example.com already exists',
    description: 'Error message for the row',
  })
  error!: string;
}

export class ImportResultDto {
  @ApiProperty({
    example: 95,
    description: 'Number of successfully created users',
  })
  success!: number;

  @ApiProperty({ example: 5, description: 'Number of failed rows' })
  failed!: number;

  @ApiPropertyOptional({
    type: [ImportErrorDto],
    example: [
      {
        rowNumber: 3,
        email: 'duplicate@example.com',
        error: 'User with email duplicate@example.com already exists',
      },
    ],
    description: 'Row-level import errors',
  })
  errors?: ImportErrorDto[];

  @ApiPropertyOptional({
    type: [UserResponseDto],
    description: 'Successfully created users',
  })
  createdUsers?: UserResponseDto[];
}
