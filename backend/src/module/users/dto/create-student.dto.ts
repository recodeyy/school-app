import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe', description: 'Student full name' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Student email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Student phone number',
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone?: string;

  @ApiProperty({
    example: 'Student@123',
    description: 'Initial password for the account',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID to assign the student to',
  })
  @IsNotEmpty()
  @IsUUID()
  classId!: string;

  @ApiPropertyOptional({
    example: 'A-01',
    description: 'Roll number in the class',
  })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({ example: 'ADM001', description: 'Admission number' })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiPropertyOptional({
    example: '2008-05-15',
    description: 'Date of birth (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dob?: string;
}

export class ImportStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Student@123' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({
    example: '10-A',
    description: 'Class name as it appears in the system',
  })
  @IsNotEmpty()
  @IsString()
  className!: string;

  @ApiPropertyOptional({ example: 'A-01' })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({ example: 'ADM001' })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiPropertyOptional({ example: '2008-05-15' })
  @IsOptional()
  @IsString()
  dob?: string;
}

export class BulkImportStudentsDto {
  @ApiProperty({
    example:
      'name,email,password,className,phone,rollNumber,admissionNumber,dob\nJohn Doe,john.doe@example.com,Student@123,10-A,9876543210,A-01,ADM001,2008-05-15',
    description: 'CSV text with header row and student records',
  })
  @IsNotEmpty()
  csvData!: string;
}
