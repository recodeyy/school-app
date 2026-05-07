import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

enum FeeStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

export class CreateFeeDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student UUID',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'Tuition Fee - May 2026', description: 'Fee title' })
  @IsString()
  @MinLength(2)
  title: string;

  @ApiPropertyOptional({ example: 'Monthly tuition fee' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 5000, description: 'Fee amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: '2026-05-31', description: 'Due date (YYYY-MM-DD)' })
  @IsDateString()
  dueDate: string;
}

export class RecordPaymentDto {
  @ApiProperty({ example: 2500, description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ example: 'ONLINE', description: 'Payment method' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'TXN123456', description: 'Transaction ID' })
  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class QueryFeesDto {
  @ApiPropertyOptional({ description: 'Student UUID' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: FeeStatusEnum, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(FeeStatusEnum)
  status?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
