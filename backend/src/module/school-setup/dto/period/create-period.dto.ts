import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { WeekType } from '../../../../generated/prisma/enums.js';

export class CreatePeriodDto {
  @ApiProperty({ example: 'uuid-of-class' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ example: 'uuid-of-subject' })
  @IsUUID()
  subjectId!: string;

  @ApiProperty({
    example: 1,
    description: '0 = Sunday, 1 = Monday, ..., 6 = Saturday',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ example: '09:00' })
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'startTime must be HH:mm or HH:mm:ss',
  })
  startTime!: string;

  @ApiProperty({ example: '10:00' })
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'endTime must be HH:mm or HH:mm:ss',
  })
  endTime!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ required: false, enum: WeekType })
  @IsOptional()
  @IsEnum(WeekType)
  weekType?: WeekType;
}
