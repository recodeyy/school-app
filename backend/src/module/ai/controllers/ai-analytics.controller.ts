import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../auth/guards/roles.guard.js';
import { AnalyzeAttendanceRiskDto } from '../dto/attendance-risk.dto.js';
import { GenerateProgressSummaryDto } from '../dto/progress-summary.dto.js';
import { DetectWeakSubjectsDto } from '../dto/weak-subject.dto.js';
import { AttendanceRiskService } from '../services/attendance-risk.service.js';
import { ProgressSummaryService } from '../services/progress-summary.service.js';
import { WeakSubjectService } from '../services/weak-subject.service.js';

@ApiTags('ai-analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai/analytics')
export class AiAnalyticsController {
  constructor(
    private readonly progressSummaryService: ProgressSummaryService,
    private readonly attendanceRiskService: AttendanceRiskService,
    private readonly weakSubjectService: WeakSubjectService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Student Progress Summary                                           */
  /* ------------------------------------------------------------------ */
  @Post('progress-summary')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'PARENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate student progress summary',
    description:
      'Parent-friendly explanation of marks and attendance trends based on real data.',
  })
  @ApiBody({ type: GenerateProgressSummaryDto })
  @ApiOkResponse({ description: 'Progress summary in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateProgressSummary(
    @Body() dto: GenerateProgressSummaryDto,
    @Request() req: any,
  ) {
    return this.progressSummaryService.generate(
      dto,
      req.user.id,
      req.user.role,
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Attendance Risk Explanation                                        */
  /* ------------------------------------------------------------------ */
  @Post('attendance-risk')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'PARENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Analyze attendance risk',
    description:
      'Identifies low attendance patterns and suggests actions for a student or class.',
  })
  @ApiBody({ type: AnalyzeAttendanceRiskDto })
  @ApiOkResponse({ description: 'Attendance risk analysis in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async analyzeAttendanceRisk(
    @Body() dto: AnalyzeAttendanceRiskDto,
    @Request() req: any,
  ) {
    return this.attendanceRiskService.analyze(
      dto,
      req.user.id,
      req.user.role,
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Weak Subject Detection                                             */
  /* ------------------------------------------------------------------ */
  @Post('weak-subjects')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'PARENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Detect weak subjects',
    description:
      'Analyzes marks/homework data to flag weak subjects/topics with recommendations.',
  })
  @ApiBody({ type: DetectWeakSubjectsDto })
  @ApiOkResponse({ description: 'Weak subject analysis in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async detectWeakSubjects(
    @Body() dto: DetectWeakSubjectsDto,
    @Request() req: any,
  ) {
    return this.weakSubjectService.detect(dto, req.user.id, req.user.role);
  }
}
