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
import { CreateHolidayDto } from '../dto/holiday/create-holiday.dto.js';
import { UpdateHolidayDto } from '../dto/holiday/update-holiday.dto.js';
import type { Holiday } from '../school-setup.service.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/holidays')
export class HolidaysController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  @ApiOperation({ summary: 'Create holiday' })
  async create(@Body() dto: CreateHolidayDto): Promise<Holiday> {
    return this.svc.createHoliday({
      name: dto.name,
      date: dto.date,
      description: dto.description,
      isRecurring: dto.isRecurring,
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List holidays' })
  @Get()
  async list(): Promise<Holiday[]> {
    return this.svc.listHolidays();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<Holiday> {
    return this.svc.getHoliday(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ): Promise<Holiday> {
    return this.svc.updateHoliday(id, dto as any);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Holiday> {
    return this.svc.deleteHoliday(id);
  }
}
