import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { DashboardService } from './dashboard.service.js';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Admin Dashboard',
    description: 'Get quick stats and overview for administrators',
  })
  async getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('teacher')
  @Roles('TEACHER')
  @ApiOperation({
    summary: 'Teacher Dashboard',
    description:
      'Get today schedule, pending homework, and class info for teacher',
  })
  async getTeacherDashboard(@Request() req: any) {
    return this.dashboardService.getTeacherDashboard(req.user.id);
  }

  @Get('student')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Student Dashboard',
    description: 'Get homework, timetable, notices, and overview for student',
  })
  async getStudentDashboard(@Request() req: any) {
    return this.dashboardService.getStudentDashboard(req.user.id);
  }

  @Get('parent')
  @Roles('PARENT')
  @ApiOperation({
    summary: 'Parent Dashboard',
    description:
      'Get overview of all children (attendance, homework, fees, etc.)',
  })
  async getParentDashboard(@Request() req: any) {
    return this.dashboardService.getParentDashboard(req.user.id);
  }
}
