import {
  Body,
  Controller,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { MarksService } from './marks.service.js';
import {
  CreateExamDto,
  PublishResultsDto,
  QueryResultsDto,
  UploadMarksDto,
} from './dto/index.js';

@ApiTags('Marks & Results')
@ApiBearerAuth()
@Controller('marks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarksController {
  constructor(private readonly marksService: MarksService) {}

  @Post('exams')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Create an exam',
    description: 'Create a new exam entry for a class',
  })
  @ApiCreatedResponse({ description: 'Exam created' })
  async createExam(@Body() dto: CreateExamDto) {
    return this.marksService.createExam(dto);
  }

  @Get('exams')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'List exams',
    description: 'List exams with optional class filter',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Filter by class UUID',
  })
  @ApiOkResponse({ description: 'List of exams' })
  async listExams(@Query('classId') classId?: string) {
    return this.marksService.listExams(classId);
  }

  @Get('exams/:id')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({ summary: 'Get exam details with results' })
  @ApiParam({ name: 'id', description: 'Exam UUID' })
  @ApiOkResponse({ description: 'Exam details with all results' })
  async getExam(@Param('id') id: string) {
    return this.marksService.getExam(id);
  }

  @Post('upload')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Upload marks (bulk)',
    description:
      'Upload marks for multiple students in an exam. Uses upsert so existing marks are updated.',
  })
  @ApiCreatedResponse({ description: 'Marks uploaded' })
  async uploadMarks(@Body() dto: UploadMarksDto, @Request() req: any) {
    return this.marksService.uploadMarks(dto, req.user.id);
  }

  @Patch('exams/:examId/publish')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Publish/unpublish exam results',
    description:
      'Toggle result visibility. Publishing sends notifications to students and parents.',
  })
  @ApiParam({ name: 'examId', description: 'Exam UUID' })
  @ApiOkResponse({ description: 'Publish status updated' })
  async publishResults(
    @Param('examId') examId: string,
    @Body() dto: PublishResultsDto,
  ) {
    return this.marksService.publishResults(examId, dto.isPublished);
  }

  @Get('student/:studentId')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get student results',
    description: 'Get published results for a specific student',
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: 'Paginated student results' })
  async getStudentResults(
    @Param('studentId') studentId: string,
    @Query() query: QueryResultsDto,
  ) {
    return this.marksService.getStudentResults(studentId, query);
  }

  @Get('class/:classId')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Get class results',
    description: 'Get all results for a class with optional exam filter',
  })
  @ApiParam({ name: 'classId', description: 'Class UUID' })
  @ApiQuery({
    name: 'examId',
    required: false,
    description: 'Filter by exam UUID',
  })
  @ApiOkResponse({ description: 'Class results' })
  async getClassResults(
    @Param('classId') classId: string,
    @Query('examId') examId?: string,
  ) {
    return this.marksService.getClassResults(classId, examId);
  }
}
