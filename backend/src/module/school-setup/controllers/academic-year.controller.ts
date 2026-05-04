import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateAcademicYearDto } from '../dto/academic-year/create-academic-year.dto.js';
import { UpdateAcademicYearDto } from '../dto/academic-year/update-academic-year.dto.js';
import type { AcademicYear } from '../school-setup.service.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/academic-years')
export class AcademicYearController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  @ApiOperation({ summary: 'Create academic year' })
  async create(@Body() dto: CreateAcademicYearDto): Promise<AcademicYear> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    return this.svc.createAcademicYear({
      name: dto.name,
      startDate: start,
      endDate: end,
      isActive: dto.isActive,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List academic years' })
  @Get()
  async list(): Promise<AcademicYear[]> {
    return this.svc.listAcademicYears();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<AcademicYear> {
    return this.svc.getAcademicYear(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ): Promise<AcademicYear> {
    const payload: any = {};
    if (dto.name !== undefined) payload.name = dto.name;
    if ((dto as any).startDate !== undefined)
      payload.startDate = new Date((dto as any).startDate);
    if ((dto as any).endDate !== undefined)
      payload.endDate = new Date((dto as any).endDate);
    if ((dto as any).isActive !== undefined)
      payload.isActive = (dto as any).isActive;
    return this.svc.updateAcademicYear(id, payload);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<AcademicYear> {
    return this.svc.deleteAcademicYear(id);
  }
}
