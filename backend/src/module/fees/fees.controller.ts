import {
  Body,
  Controller,
  Get,
  Param,
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
import { FeesService } from './fees.service.js';
import { CreateFeeDto, QueryFeesDto, RecordPaymentDto } from './dto/index.js';

@ApiTags('Fees')
@ApiBearerAuth()
@Controller('fees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post()
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Create a fee',
    description:
      'Create a new fee entry for a student. Student and parent are notified.',
  })
  @ApiCreatedResponse({ description: 'Fee created' })
  async create(@Body() dto: CreateFeeDto) {
    return this.feesService.create(dto);
  }

  @Post(':feeId/payments')
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Record a payment',
    description:
      'Record a payment against a fee. Fee status updates automatically.',
  })
  @ApiParam({ name: 'feeId', description: 'Fee UUID' })
  @ApiCreatedResponse({ description: 'Payment recorded' })
  async recordPayment(
    @Param('feeId') feeId: string,
    @Body() dto: RecordPaymentDto,
    @Request() req: any,
  ) {
    return this.feesService.recordPayment(feeId, dto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'List fees',
    description: 'List fees with optional student and status filtering',
  })
  @ApiOkResponse({ description: 'Paginated list of fees' })
  async list(@Query() query: QueryFeesDto) {
    return this.feesService.list(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'PRINCIPAL', 'PARENT', 'STUDENT')
  @ApiOperation({ summary: 'Get fee details with payment history' })
  @ApiParam({ name: 'id', description: 'Fee UUID' })
  @ApiOkResponse({ description: 'Fee details with payments' })
  async getById(@Param('id') id: string) {
    return this.feesService.getById(id);
  }

  @Get('student/:studentId')
  @Roles('ADMIN', 'PRINCIPAL', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get student fees',
    description: 'List all fees for a specific student',
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: 'Student fees' })
  async getStudentFees(
    @Param('studentId') studentId: string,
    @Query() query: QueryFeesDto,
  ) {
    return this.feesService.list({ ...query, studentId });
  }

  @Get('student/:studentId/summary')
  @Roles('ADMIN', 'PRINCIPAL', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get student fee summary',
    description:
      'Get fee statistics for a student (total, paid, pending, overdue)',
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: 'Fee summary' })
  async getStudentFeeSummary(@Param('studentId') studentId: string) {
    return this.feesService.getStudentFeeSummary(studentId);
  }
}
