import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ required: false, example: 'MATH' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 'uuid-of-class' })
  @IsUUID()
  classId!: string;

  @ApiProperty({ required: false, example: 'uuid-of-teacher' })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
