import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMeta } from './pagination.dto.js';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  pagination?: PaginationMeta;
}

export function successResponse<T>(
  data: T,
  pagination?: PaginationMeta,
): ApiResponseDto<T> {
  return { success: true, data, pagination };
}

export function messageResponse(message: string): ApiResponseDto<null> {
  return { success: true, message };
}
