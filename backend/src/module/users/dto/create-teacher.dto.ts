import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTeacherDto {
  @ApiProperty({
    example: 'Dr. Rajesh Kumar',
    description: 'Teacher full name',
  })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'rajesh.kumar@example.com',
    description: 'Teacher email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Teacher phone number',
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone?: string;

  @ApiProperty({
    example: 'Teacher@123',
    description: 'Initial password for the teacher account',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'EMP001', description: 'Employee ID' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    example: ['Mathematics', 'Physics'],
    description: 'Subjects taught',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    example: 'Senior Teacher',
    description: 'Teacher designation',
  })
  @IsOptional()
  @IsString()
  designation?: string;
}

export class ImportTeacherDto {
  @ApiProperty({ example: 'Dr. Rajesh Kumar' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'rajesh.kumar@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Teacher@123' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'EMP001' })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional({
    example: 'Mathematics|Physics',
    description: 'Comma or pipe separated subjects',
  })
  @IsOptional()
  @IsString()
  subjects?: string;

  @ApiPropertyOptional({ example: 'Senior Teacher' })
  @IsOptional()
  @IsString()
  designation?: string;
}

export class BulkImportTeachersDto {
  @ApiProperty({
    example:
      'name,email,password,phone,employeeId,subjects,designation\nDr. Rajesh Kumar,rajesh.kumar@example.com,Teacher@123,9876543210,EMP001,Mathematics|Physics,Senior Teacher',
    description: 'CSV text with header row and teacher records',
  })
  @IsNotEmpty()
  csvData!: string;
}
