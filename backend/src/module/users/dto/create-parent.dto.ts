import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreateParentDto {
  @ApiProperty({ example: 'Mr. John Doe', description: 'Parent full name' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'john.parent@example.com',
    description: 'Parent email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Parent phone number',
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Phone must be a 10-digit number',
  })
  phone?: string;

  @ApiProperty({
    example: 'Parent@123',
    description: 'Initial password for the parent account',
  })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({
    example: 'Father',
    description: 'Relationship to the child',
  })
  @IsOptional()
  @IsString()
  relationship?: string;
}

export class ImportParentDto {
  @ApiProperty({ example: 'Mr. John Doe' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'john.parent@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Parent@123' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiPropertyOptional({ example: 'Mother' })
  @IsOptional()
  @IsString()
  relationship?: string;
}

export class BulkImportParentsDto {
  @ApiProperty({
    example:
      'name,email,password,phone,relationship\nMr. John Doe,john.parent@example.com,Parent@123,9876543210,Father',
    description: 'CSV text with header row and parent records',
  })
  @IsNotEmpty()
  csvData!: string;
}

export class MapParentToStudentsDto {
  @ApiProperty({
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    description: 'Array of student UUIDs to assign to the parent',
  })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  studentIds!: string[];
}
