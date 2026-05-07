import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  MARATHI = 'mr',
}

export enum MessageTone {
  FORMAL = 'formal',
  FRIENDLY = 'friendly',
  CONCERNED = 'concerned',
}

export enum ParentMessageIssue {
  ATTENDANCE = 'attendance',
  BEHAVIOR = 'behavior',
  FEES = 'fees',
  ACADEMIC = 'academic',
  HEALTH = 'health',
  GENERAL = 'general',
}

export class GenerateParentMessageDto {
  @ApiProperty({ description: 'UUID of the student' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({
    enum: ParentMessageIssue,
    description: 'Issue category',
  })
  @IsEnum(ParentMessageIssue)
  issue!: ParentMessageIssue;

  @ApiProperty({
    description: 'Specific details about the issue',
  })
  @IsString()
  details!: string;

  @ApiPropertyOptional({
    enum: Language,
    description: 'Output language',
    default: Language.ENGLISH,
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    enum: MessageTone,
    description: 'Tone of the message',
    default: MessageTone.FORMAL,
  })
  @IsOptional()
  @IsEnum(MessageTone)
  tone?: MessageTone;
}
