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
import { HomeworkService } from './homework.service.js';
import {
  CreateHomeworkDto,
  GradeHomeworkDto,
  QueryHomeworkDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/index.js';

@ApiTags('Homework')
@ApiBearerAuth()
@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @Post()
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Create homework',
    description:
      'Teacher creates a new homework assignment for a class/subject. Notifications sent to students and parents.',
  })
  @ApiCreatedResponse({ description: 'Homework created successfully' })
  async create(@Body() dto: CreateHomeworkDto, @Request() req: any) {
    return this.homeworkService.create(dto, req.user.id);
  }

  @Patch(':id')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL')
  @ApiOperation({
    summary: 'Update homework',
    description: 'Teacher updates their homework assignment',
  })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiOkResponse({ description: 'Homework updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHomeworkDto,
    @Request() req: any,
  ) {
    return this.homeworkService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('TEACHER', 'ADMIN', 'PRINCIPAL')
  @ApiOperation({ summary: 'Delete homework' })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiOkResponse({ description: 'Homework deleted' })
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.homeworkService.delete(id, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'List homework',
    description:
      'List published homework with optional class/subject filtering',
  })
  @ApiOkResponse({ description: 'Paginated list of homework' })
  async list(@Query() query: QueryHomeworkDto) {
    return this.homeworkService.list(query);
  }

  @Get('teacher')
  @Roles('TEACHER')
  @ApiOperation({
    summary: 'List homework created by current teacher',
    description: 'Teacher views all homework they created',
  })
  @ApiOkResponse({ description: "Paginated list of teacher's homework" })
  async listByTeacher(@Query() query: QueryHomeworkDto, @Request() req: any) {
    return this.homeworkService.listByTeacher(req.user.id, query);
  }

  @Get('student/:studentId')
  @Roles('STUDENT', 'PARENT', 'ADMIN', 'PRINCIPAL', 'TEACHER')
  @ApiOperation({
    summary: 'Get homework for a student',
    description:
      "Get homework assigned to a student's class with submission status",
  })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: 'Homework with submission status' })
  async getForStudent(
    @Param('studentId') studentId: string,
    @Query() query: QueryHomeworkDto,
  ) {
    return this.homeworkService.getForStudent(studentId, query);
  }

  @Get(':id')
  @Roles('ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT')
  @ApiOperation({
    summary: 'Get homework details',
    description: 'Get homework with all submissions',
  })
  @ApiParam({ name: 'id', description: 'Homework UUID' })
  @ApiOkResponse({ description: 'Homework details with submissions' })
  async getById(@Param('id') id: string) {
    return this.homeworkService.getById(id);
  }

  @Post(':homeworkId/submit')
  @Roles('STUDENT')
  @ApiOperation({
    summary: 'Submit homework',
    description:
      'Student submits their homework. Late submissions are automatically flagged.',
  })
  @ApiParam({ name: 'homeworkId', description: 'Homework UUID' })
  @ApiCreatedResponse({ description: 'Homework submitted' })
  async submit(
    @Param('homeworkId') homeworkId: string,
    @Body() dto: SubmitHomeworkDto,
    @Request() req: any,
  ) {
    return this.homeworkService.submit(homeworkId, req.user.id, dto);
  }

  @Post(':homeworkId/grade/:studentId')
  @Roles('TEACHER')
  @ApiOperation({
    summary: 'Grade homework submission',
    description:
      "Teacher grades a student's homework submission. Student is notified.",
  })
  @ApiParam({ name: 'homeworkId', description: 'Homework UUID' })
  @ApiParam({ name: 'studentId', description: 'Student user UUID' })
  @ApiOkResponse({ description: 'Homework graded' })
  async grade(
    @Param('homeworkId') homeworkId: string,
    @Param('studentId') studentId: string,
    @Body() dto: GradeHomeworkDto,
    @Request() req: any,
  ) {
    return this.homeworkService.grade(homeworkId, studentId, dto, req.user.id);
  }
}
