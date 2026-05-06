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
import { GenerateChapterSummaryDto } from '../dto/chapter-summary.dto.js';
import { AskDoubtDto } from '../dto/doubt-solver.dto.js';
import { GenerateFlashcardsDto } from '../dto/flashcard.dto.js';
import { GeneratePracticeQuizDto } from '../dto/practice-quiz.dto.js';
import { ChapterSummaryService } from '../services/chapter-summary.service.js';
import { DoubtSolverService } from '../services/doubt-solver.service.js';
import { FlashcardService } from '../services/flashcard.service.js';
import { PracticeQuizService } from '../services/practice-quiz.service.js';

@ApiTags('ai-student')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai/student')
export class AiStudentController {
  constructor(
    private readonly doubtSolverService: DoubtSolverService,
    private readonly chapterSummaryService: ChapterSummaryService,
    private readonly flashcardService: FlashcardService,
    private readonly practiceQuizService: PracticeQuizService,
  ) {}

  /* ------------------------------------------------------------------ */
  /*  Doubt Solver                                                       */
  /* ------------------------------------------------------------------ */
  @Post('doubt')
  @Roles('STUDENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Ask a doubt — AI explains at class level',
    description:
      'Student asks a question and gets an age-appropriate, guided explanation. AI does not give direct exam answers.',
  })
  @ApiBody({ type: AskDoubtDto })
  @ApiOkResponse({ description: 'AI explanation with examples and related topics' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async askDoubt(@Body() dto: AskDoubtDto, @Request() req: any) {
    return this.doubtSolverService.solve(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Chapter Summary                                                    */
  /* ------------------------------------------------------------------ */
  @Post('chapter-summary')
  @Roles('STUDENT', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate chapter summary and revision notes',
    description: 'Creates a concise summary with key points, definitions, and mnemonics.',
  })
  @ApiBody({ type: GenerateChapterSummaryDto })
  @ApiOkResponse({ description: 'Chapter summary in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateChapterSummary(
    @Body() dto: GenerateChapterSummaryDto,
    @Request() req: any,
  ) {
    return this.chapterSummaryService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Flashcards                                                         */
  /* ------------------------------------------------------------------ */
  @Post('flashcards')
  @Roles('STUDENT', 'TEACHER', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate revision flashcards',
    description: 'Quick revision cards with front (question) and back (answer) from subject/chapter.',
  })
  @ApiBody({ type: GenerateFlashcardsDto })
  @ApiOkResponse({ description: 'Flashcards in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generateFlashcards(
    @Body() dto: GenerateFlashcardsDto,
    @Request() req: any,
  ) {
    return this.flashcardService.generate(dto, req.user.sub, req.user.role);
  }

  /* ------------------------------------------------------------------ */
  /*  Practice Quiz                                                      */
  /* ------------------------------------------------------------------ */
  @Post('practice-quiz')
  @Roles('STUDENT', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Generate a personalized practice quiz',
    description:
      'Creates a quiz focusing on weak topics (auto-detected from results or manually specified).',
  })
  @ApiBody({ type: GeneratePracticeQuizDto })
  @ApiOkResponse({ description: 'Practice quiz with explanations in JSON' })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiTooManyRequestsResponse({ description: 'AI usage limit exceeded' })
  async generatePracticeQuiz(
    @Body() dto: GeneratePracticeQuizDto,
    @Request() req: any,
  ) {
    return this.practiceQuizService.generate(dto, req.user.sub, req.user.role);
  }
}
