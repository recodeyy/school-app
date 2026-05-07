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
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateSectionDto } from '../dto/section/create-section.dto.js';
import { UpdateSectionDto } from '../dto/section/update-section.dto.js';
import type { Section } from '../school-setup.service.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/sections')
export class SectionsController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  @ApiOperation({ summary: 'Create section' })
  async create(@Body() dto: CreateSectionDto): Promise<Section> {
    return this.svc.createSection(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'classId', required: false })
  @ApiOperation({ summary: 'List sections, optionally filter by classId' })
  @Get()
  async list(@Query('classId') classId?: string): Promise<Section[]> {
    return this.svc.listSections(classId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<Section> {
    return this.svc.getSection(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
  ): Promise<Section> {
    return this.svc.updateSection(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Section> {
    return this.svc.deleteSection(id);
  }
}
