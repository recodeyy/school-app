import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QueryNotificationsDto {
  @ApiPropertyOptional({
    example: 'HOMEWORK_ASSIGNED',
    description: 'Filter by notification type',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 'false',
    description: 'Filter by read status',
  })
  @IsOptional()
  @IsString()
  isRead?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
