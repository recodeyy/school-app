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

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export class GenerateHomeworkDto {
  @ApiProperty({ description: 'UUID of the class' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Chapter or topic name' })
  @IsString()
  chapter!: string;

  @ApiProperty({ enum: Difficulty, description: 'Difficulty level' })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiProperty({ enum: Language, description: 'Output language' })
  @IsEnum(Language)
  language!: Language;

  @ApiPropertyOptional({
    description: 'Number of questions to generate',
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  questionCount?: number;
}
