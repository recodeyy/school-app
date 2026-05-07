import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Page number (starting at 1)',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20', description: 'Items per page' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function parsePagination(dto: PaginationDto): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = dto.page ? Math.max(1, parseInt(dto.page)) : 1;
  const limit = dto.limit
    ? Math.min(100, Math.max(1, parseInt(dto.limit)))
    : 20;
  return { page, limit, skip: (page - 1) * limit };
}
