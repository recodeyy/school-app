import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum QuestionType {
  MCQ = 'mcq',
  SHORT = 'short',
  LONG = 'long',
  TRUE_FALSE = 'true_false',
  FILL_BLANK = 'fill_blank',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class GenerateQuizDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'Chapter or topic name' })
  @IsString()
  chapter!: string;

  @ApiProperty({ enum: Difficulty, description: 'Difficulty level' })
  @IsEnum(Difficulty)
  difficulty!: Difficulty;

  @ApiPropertyOptional({
    description: 'Number of questions',
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  questionCount?: number;

  @ApiPropertyOptional({
    description: 'Question types to include',
    enum: QuestionType,
    isArray: true,
    default: [QuestionType.MCQ],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(QuestionType, { each: true })
  types?: QuestionType[];

  @ApiPropertyOptional({
    description: 'Whether to include the answer key',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeAnswerKey?: boolean;
}
