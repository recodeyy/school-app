import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class GeneratePracticeQuizDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiPropertyOptional({ description: 'Chapter or topic name' })
  @IsOptional()
  @IsString()
  chapter?: string;

  @ApiPropertyOptional({
    description: 'Weak topics to focus on. If omitted, auto-detected from results.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  weakTopics?: string[];
}
