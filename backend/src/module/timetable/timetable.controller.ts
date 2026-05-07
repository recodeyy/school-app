import {
  Controller,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { TimetableService } from './timetable.service.js';

@ApiTags('Timetable')
@ApiBearerAuth()
@Controller('timetable')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('class/:classId')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get class timetable',
    description: 'Get full-week or day-specific timetable for a class',
  })
  @ApiParam({ name: 'classId', description: 'Class UUID' })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Day of week (0=Sun, 6=Sat)',
  })
  @ApiOkResponse({ description: 'Class timetable grouped by day' })
  async getClassTimetable(
    @Param('classId') classId: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    const dow = dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined;
    return this.timetableService.getClassTimetable(classId, dow);
  }

  @Get('teacher/me')
  @Roles('TEACHER')
  @ApiOperation({
    summary: "Get current teacher's schedule",
    description:
      "Get the authenticated teacher's full teaching schedule across all classes",
  })
  @ApiQuery({
    name: 'dayOfWeek',
    required: false,
    description: 'Day of week (0=Sun, 6=Sat)',
  })
  @ApiOkResponse({ description: 'Teacher schedule grouped by day' })
  async getMySchedule(
    @Request() req: any,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    const dow = dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined;
    return this.timetableService.getTeacherSchedule(req.user.id, dow);
  }

  @Get('teacher/:teacherId')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Get teacher schedule',
    description: "Get a specific teacher's schedule",
  })
  @ApiParam({ name: 'teacherId', description: 'Teacher user UUID' })
  @ApiQuery({ name: 'dayOfWeek', required: false })
  @ApiOkResponse({ description: 'Teacher schedule' })
  async getTeacherSchedule(
    @Param('teacherId') teacherId: string,
    @Query('dayOfWeek') dayOfWeek?: string,
  ) {
    const dow = dayOfWeek !== undefined ? parseInt(dayOfWeek) : undefined;
    return this.timetableService.getTeacherSchedule(teacherId, dow);
  }

  @Get('student/:studentId/today')
  @Roles('STUDENT', 'PARENT', 'ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: "Get student's today schedule",
    description: "Get today's timetable for a student based on their class",
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: "Today's schedule" })
  async getStudentToday(@Param('studentId') studentId: string) {
    return this.timetableService.getStudentTodaySchedule(studentId);
  }
}
