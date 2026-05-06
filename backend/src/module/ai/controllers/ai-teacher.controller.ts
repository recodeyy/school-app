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
import { GenerateHomeworkDto } from '../dto/homework.dto.js';
import { GenerateLessonPlanDto } from '../dto/lesson-plan.dto.js';
import { GenerateQuestionPaperDto } from '../dto/question-paper.dto.js';
import { GenerateQuizDto } from '../dto/quiz.dto.js';
import { GenerateReportCardRemarksDto } from '../dto/report-card-remarks.dto.js';
import { HomeworkGeneratorService } from '../services/homework-generator.service.js';
import { LessonPlanService } from '../services/lesson-plan.service.js';
import { QuestionPaperService } from '../services/question-paper.service.js';
import { QuizGeneratorService } from '../services/quiz-generator.service.js';
import { ReportCardRemarksService } from '../services/report-card-remarks.service.js';

@ApiTags('ai-teacher')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai/teacher')
export class AiTeacherController {
  constructor(
    private readonly homeworkService: HomeworkGeneratorService,
    private readonly quizService: QuizGeneratorService,
    private readonly lessonPlanService: LessonPlanService,
    private readonly questionPaperService: QuestionPaperService,
    private readonly reportCardRemarksService: ReportCardRemarksService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Homework Generator                                                 */
  /* ------------------------------------------------------------------ */
  @Post('homework')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate homework assignment using AI',
    description:
      'Creates a class-wise homework from subject, chapter, difficulty, and language.',
  })
  @ApiBody({ type: GenerateHomeworkDto })
  @ApiOkResponse({ description: 'Generated homework assignment in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateHomework(
    @Body() dto: GenerateHomeworkDto,
    @Request() req: any,
  ) {
    return this.homeworkService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Quiz Generator                                                     */
  /* ------------------------------------------------------------------ */
  @Post('quiz')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate quiz using AI',
    description:
      'Creates MCQs, short answers, answer keys at specified difficulty levels.',
  })
  @ApiBody({ type: GenerateQuizDto })
  @ApiOkResponse({ description: 'Generated quiz in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateQuiz(@Body() dto: GenerateQuizDto, @Request() req: any) {
    return this.quizService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Lesson Plan Generator                                              */
  /* ------------------------------------------------------------------ */
  @Post('lesson-plan')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate lesson plan using AI',
    description:
      'Creates a detailed lesson plan with objectives, activities, explanation flow, and homework.',
  })
  @ApiBody({ type: GenerateLessonPlanDto })
  @ApiOkResponse({ description: 'Generated lesson plan in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateLessonPlan(
    @Body() dto: GenerateLessonPlanDto,
    @Request() req: any,
  ) {
    return this.lessonPlanService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Question Paper Generator                                           */
  /* ------------------------------------------------------------------ */
  @Post('question-paper')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate exam question paper using AI',
    description:
      'Creates an exam paper with marks distribution, sections, and optional answer key.',
  })
  @ApiBody({ type: GenerateQuestionPaperDto })
  @ApiOkResponse({ description: 'Generated question paper in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateQuestionPaper(
    @Body() dto: GenerateQuestionPaperDto,
    @Request() req: any,
  ) {
    return this.questionPaperService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Report Card Remarks                                                */
  /* ------------------------------------------------------------------ */
  @Post('report-card-remarks')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate report card remarks using AI',
    description:
      'Generates remarks from real attendance, marks, and behavior data for a student.',
  })
  @ApiBody({ type: GenerateReportCardRemarksDto })
  @ApiOkResponse({ description: 'Generated report card remarks in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateReportCardRemarks(
    @Body() dto: GenerateReportCardRemarksDto,
    @Request() req: any,
  ) {
    return this.reportCardRemarksService.generate(
      dto,
      req.user.sub,
      req.user.role,
    );
  }
}
