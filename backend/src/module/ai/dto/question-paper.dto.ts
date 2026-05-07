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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export class SectionConfigDto {
  @ApiProperty({ description: 'Section name, e.g. "Section A"' })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Question type: mcq, short, long, fill_blank, true_false',
  })
  @IsString()
  questionType!: string;

  @ApiProperty({ description: 'Number of questions in this section' })
  @IsInt()
  @Min(1)
  @Max(50)
  count!: number;

  @ApiProperty({ description: 'Marks per question in this section' })
  @IsInt()
  @Min(1)
  @Max(20)
  marksPerQuestion!: number;
}

export class GenerateQuestionPaperDto {
  @ApiProperty({ description: 'UUID of the subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ description: 'UUID of the class' })
  @IsUUID()
  classId!: string;

  @ApiProperty({
    description: 'Exam type: unit, midterm, final, practical',
  })
  @IsString()
  examType!: string;

  @ApiProperty({ description: 'Total marks for the paper' })
  @IsInt()
  @Min(10)
  @Max(200)
  totalMarks!: number;

  @ApiProperty({
    description: 'List of chapters/topics to cover',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  chapters!: string[];

  @ApiProperty({
    description: 'Section configuration for the paper',
    type: [SectionConfigDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionConfigDto)
  sectionConfig!: SectionConfigDto[];

  @ApiPropertyOptional({
    enum: Language,
    description: 'Output language',
    default: Language.ENGLISH,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description: 'Whether to include an answer key',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeAnswerKey?: boolean;
}
