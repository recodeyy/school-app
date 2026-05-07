import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export enum NoticeTone {
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
}

export enum NoticeAudience {
  PARENTS = 'parents',
  STUDENTS = 'students',
  STAFF = 'staff',
  ALL = 'all',
}

export class GenerateNoticeDto {
  @ApiProperty({ description: 'Topic or subject of the notice' })
  @IsString()
  topic!: string;

  @ApiProperty({
    enum: NoticeAudience,
    description: 'Target audience',
  })
  @IsEnum(NoticeAudience)
  audience!: NoticeAudience;

  @ApiProperty({ enum: Language, description: 'Output language' })
  @IsEnum(Language)
  language!: Language;

  @ApiPropertyOptional({
    enum: NoticeTone,
    description: 'Tone of the notice',
    default: NoticeTone.FORMAL,
  })
  @IsOptional()
  @IsEnum(NoticeTone)
  tone?: NoticeTone;

  @ApiPropertyOptional({
    description: 'Key points to include in the notice',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyPoints?: string[];
}
