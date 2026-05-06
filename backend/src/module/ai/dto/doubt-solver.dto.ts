import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AskDoubtDto {
  @ApiProperty({ description: 'The question or doubt the student has' })
  @IsString()
  question!: string;

  @ApiPropertyOptional({ description: 'UUID of the subject (optional context)' })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Chapter name for context' })
  @IsOptional()
  @IsString()
  chapter?: string;
}
