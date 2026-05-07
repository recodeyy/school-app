import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryTimetableDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Class UUID',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiPropertyOptional({
    example: '1',
    description: 'Day of week (0=Sun, 1=Mon, ..., 6=Sat)',
  })
  @IsOptional()
  @IsString()
  dayOfWeek?: string;
}
