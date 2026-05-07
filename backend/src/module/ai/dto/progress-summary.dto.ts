import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GenerateProgressSummaryDto {
  @ApiProperty({ description: 'UUID of the student' })
  @IsUUID()
  studentId!: string;
}
