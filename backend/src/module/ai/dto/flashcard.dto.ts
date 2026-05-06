import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GenerateFlashcardsDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Chapter or topic name' })
  @IsString()
  chapter!: string;

  @ApiPropertyOptional({ description: 'Number of flashcards to generate', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(30)
  count?: number;
}
