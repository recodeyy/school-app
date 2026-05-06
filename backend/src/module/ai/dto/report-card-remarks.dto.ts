import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class GenerateReportCardRemarksDto {
  @ApiProperty({ description: 'UUID of the student' })
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional({
    description:
      'UUID of a specific exam to focus on. If omitted, uses all available results.',
  })
  @IsOptional()
  @IsUUID()
  examId?: string;
}
