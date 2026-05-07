import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export class GenerateLessonPlanDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Chapter or topic name' })
  @IsString()
  chapter!: string;

  @ApiProperty({ description: 'UUID of the class' })
  @IsUUID()
  classId!: string;

  @ApiPropertyOptional({
    description: 'Duration of the lesson in minutes',
    default: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  duration?: number;

  @ApiPropertyOptional({
    enum: Language,
    description: 'Output language',
    default: Language.ENGLISH,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}
