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
import type { TimetableSlot } from '../../../generated/prisma/client.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreatePeriodDto } from '../dto/period/create-period.dto.js';
import { UpdatePeriodDto } from '../dto/period/update-period.dto.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/periods')
export class PeriodsController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Post()
  @ApiOperation({ summary: 'Create period (timetable slot)' })
  async create(@Body() dto: CreatePeriodDto): Promise<TimetableSlot> {
    return this.svc.createPeriod(dto as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'classId', required: false })
  @ApiOperation({ summary: 'List periods, optionally filter by classId' })
  @Get()
  async list(@Query('classId') classId?: string): Promise<TimetableSlot[]> {
    return this.svc.listPeriods(classId as any);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<TimetableSlot> {
    return this.svc.getPeriod(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'TEACHER')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePeriodDto,
  ): Promise<TimetableSlot> {
    return this.svc.updatePeriod(id, dto as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<TimetableSlot> {
    return this.svc.deletePeriod(id);
  }
}
