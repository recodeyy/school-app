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
import { AttendanceService } from './attendance.service.js';
import { CreateAttendanceSessionDto, QueryAttendanceDto } from './dto/index.js';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('sessions')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Create attendance session',
    description:
      'Create a new attendance session (daily/period-wise) and mark attendance for students. Automatically notifies parents of absent/late students.',
  })
  @ApiCreatedResponse({
    description: 'Attendance session created with records',
  })
  async createSession(
    @Body() dto: CreateAttendanceSessionDto,
    @Request() req: any,
  ) {
    return this.attendanceService.createSession(dto, req.user.id);
  }

  @Get('sessions')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'List attendance sessions',
    description:
      'List attendance sessions with optional filtering by class and date range',
  })
  @ApiOkResponse({ description: 'Paginated list of attendance sessions' })
  async listSessions(@Query() query: QueryAttendanceDto) {
    return this.attendanceService.listSessions(query);
  }

  @Get('sessions/:id')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({ summary: 'Get attendance session details' })
  @ApiParam({ name: 'id', description: 'Session UUID' })
  @ApiOkResponse({ description: 'Session with all attendance records' })
  async getSession(@Param('id') id: string) {
    return this.attendanceService.getSession(id);
  }

  @Get('daily/:classId/:date')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Get daily attendance for a class',
    description:
      'Get all attendance sessions and records for a class on a specific date',
  })
  @ApiParam({ name: 'classId', description: 'Class UUID' })
  @ApiParam({
    name: 'date',
    description: 'Date (YYYY-MM-DD)',
    example: '2026-05-07',
  })
  @ApiOkResponse({ description: 'Daily attendance with all periods' })
  async getDailyAttendance(
    @Param('classId') classId: string,
    @Param('date') date: string,
  ) {
    return this.attendanceService.getDailyAttendance(classId, date);
  }

  @Get('student/:studentId')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get student attendance records',
    description:
      'Get attendance records for a specific student with optional date range',
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({
    description: 'Paginated attendance records for the student',
  })
  async getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query() query: QueryAttendanceDto,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, query);
  }

  @Get('student/:studentId/summary')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get student attendance summary',
    description:
      'Get attendance statistics (present, absent, late, excused, percentage) for a student',
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({
    description: 'Attendance summary with counts and percentage',
  })
  async getStudentSummary(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.getStudentAttendanceSummary(
      studentId,
      startDate,
      endDate,
    );
  }
}
