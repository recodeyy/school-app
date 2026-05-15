import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  LeadSource,
  LeadStatus,
  ApplicationStatus,
} from '../../generated/prisma/client.js';

export class CreateSchoolProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brochureUrl?: string;
}

export class CreateAdmissionLeadDto {
  @ApiProperty()
  @IsString()
  childName: string;

  @ApiProperty()
  @IsString()
  parentName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsString()
  classRequested: string;

  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  source?: LeadSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  preferredVisitTime?: string;
}

export class UpdateLeadStatusDto {
  @ApiProperty({ enum: LeadStatus })
  @IsEnum(LeadStatus)
  status: LeadStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignLeadDto {
  @ApiProperty()
  @IsString()
  counselorId: string;
}

export class CreateLeadFollowUpDto {
  @ApiProperty()
  @IsString()
  actionType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isReminder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reminderDate?: string;
}

export class CreateAdmissionApplicationDto {
  @ApiProperty()
  @IsString()
  leadId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiProperty()
  @IsBoolean()
  declaration: boolean;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
