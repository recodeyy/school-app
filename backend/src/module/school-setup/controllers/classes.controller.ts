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
import type { SchoolClass } from '../../../generated/prisma/client.js';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { CreateClassDto } from '../dto/class/create-class.dto.js';
import { UpdateClassDto } from '../dto/class/update-class.dto.js';
import { SchoolSetupService } from '../school-setup.service.js';

@ApiTags('school-setup')
@Controller('setup/classes')
export class ClassesController {
  constructor(private readonly svc: SchoolSetupService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Post()
  @ApiOperation({ summary: 'Create a class' })
  async create(@Body() dto: CreateClassDto): Promise<SchoolClass> {
    return this.svc.createClass(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List classes' })
  @Get()
  async list(): Promise<SchoolClass[]> {
    return this.svc.listClasses();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  async get(@Param('id') id: string): Promise<SchoolClass> {
    return this.svc.getClass(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ): Promise<SchoolClass> {
    return this.svc.updateClass(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('ADMIN', 'SUPER_ADMIN', 'PRINCIPAL')
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<SchoolClass> {
    return this.svc.deleteClass(id);
  }
}
