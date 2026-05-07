import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export class GenerateChapterSummaryDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Chapter or topic name' })
  @IsString()
  chapter!: string;

  @ApiPropertyOptional({ enum: Language, description: 'Output language', default: Language.ENGLISH })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}
