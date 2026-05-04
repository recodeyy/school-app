import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Subject } from '../../../generated/prisma/client.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateSubjectDto } from '../dto/subject/create-subject.dto.js';
import { UpdateSubjectDto } from '../dto/subject/update-subject.dto.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/subjects')
export class SubjectsController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post()
  @ApiOperation({ summary: 'Create subject' })
  async create(@Body() dto: CreateSubjectDto): Promise<Subject> {
    return this.svc.createSubject(dto as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'classId', required: false })
  @ApiOperation({ summary: 'List subjects, optionally filter by classId' })
  @Get()
  async list(@Query('classId') classId?: string): Promise<Subject[]> {
    return this.svc.listSubjects(classId as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<Subject> {
    return this.svc.getSubject(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ): Promise<Subject> {
    return this.svc.updateSubject(id, dto as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Subject> {
    return this.svc.deleteSubject(id);
  }
}
