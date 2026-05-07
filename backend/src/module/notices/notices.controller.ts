import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { NoticesService } from './notices.service.js';
import {
  CreateNoticeDto,
  QueryNoticeDto,
  UpdateNoticeDto,
} from './dto/index.js';

@ApiTags('Notices')
@ApiBearerAuth()
@Controller('notices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @Post()
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Create a notice',
    description:
      'Create a new notice/announcement targeting specific roles. Notifications are sent automatically.',
  })
  @ApiCreatedResponse({ description: 'Notice created' })
  async create(@Body() dto: CreateNoticeDto, @Request() req: any) {
    return this.noticesService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({ summary: 'Update a notice' })
  @ApiParam({ name: 'id', description: 'Notice UUID' })
  @ApiOkResponse({ description: 'Notice updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateNoticeDto) {
    return this.noticesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete a notice' })
  @ApiParam({ name: 'id', description: 'Notice UUID' })
  @ApiOkResponse({ description: 'Notice deleted' })
  async delete(@Param('id') id: string) {
    return this.noticesService.delete(id);
  }

  @Get()
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'List notices for current user',
    description: "List active notices targeted at the current user's role",
  })
  @ApiOkResponse({ description: 'Paginated list of notices' })
  async list(@Query() query: QueryNoticeDto, @Request() req: any) {
    return this.noticesService.list(req.user.role, query);
  }

  @Get('all')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'List all notices (admin)',
    description: 'List all notices regardless of target roles or expiry',
  })
  @ApiOkResponse({ description: 'All notices' })
  async listAll(@Query() query: QueryNoticeDto) {
    return this.noticesService.listAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get notice details' })
  @ApiParam({ name: 'id', description: 'Notice UUID' })
  @ApiOkResponse({ description: 'Notice details' })
  async getById(@Param('id') id: string) {
    return this.noticesService.getById(id);
  }
}
