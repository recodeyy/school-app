import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class AnalyzeAttendanceRiskDto {
  @ApiPropertyOptional({ description: 'UUID of a specific student' })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ description: 'UUID of a class (for bulk analysis)' })
  @IsOptional()
  @IsUUID()
  classId?: string;
}
