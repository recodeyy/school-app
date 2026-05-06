import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { StaffRole } from '../../../generated/prisma/client.js';

export class CreateStaffDto {
  @ApiProperty({
    example: 'Mr. Robert Johnson',
    description: 'Staff member full name',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'robert.johnson@example.com',
    description: 'Staff email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Staff phone number',
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone?: string;

  @ApiProperty({
    example: 'Staff@123',
    description: 'Initial password for the staff account',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'STAFF001', description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    example: 'Office Manager',
    description: 'Staff designation',
  })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({
    example: 'Administration',
    description: 'Staff department',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: StaffRole.ADMIN,
    enum: StaffRole,
    description: 'Optional staff role (ADMIN, TEACHER, ADMISSION_COUNSELOR)',
  })
  @IsOptional()
  @IsEnum(StaffRole)
  role?: StaffRole;
}

export class ImportStaffDto {
  @ApiProperty({ example: 'Mr. Robert Johnson' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'robert.johnson@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Staff@123' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'STAFF001' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({ example: 'Office Manager' })
  @IsOptional()
  @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Administration' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    example: 'ADMIN',
    description: 'Optional staff role (ADMIN, TEACHER, ADMISSION_COUNSELOR)',
  })
  @IsOptional()
  @IsString()
  role?: string;
}

export class BulkImportStaffDto {
  @ApiProperty({
    example:
      'name,email,password,phone,employeeId,designation,department,role\nMr. Robert Johnson,robert.johnson@example.com,Staff@123,9876543210,STAFF001,Office Manager,Administration,ADMIN',
    description: 'CSV text with header row and staff records',
  })
  @IsNotEmpty()
  csvData!: string;
}
