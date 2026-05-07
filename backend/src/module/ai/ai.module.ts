import {  Module , HttpException, HttpStatus } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

// Core AI infrastructure
import { AiCreditService } from './core/ai-credit.service.js';
import { AiProviderService } from './core/ai-provider.service.js';
import { AiSafetyService } from './core/ai-safety.service.js';

// Controllers
import { AiAdminController } from './controllers/ai-admin.controller.js';
import { AiAnalyticsController } from './controllers/ai-analytics.controller.js';
import { AiStudentController } from './controllers/ai-student.controller.js';
import { AiTeacherController } from './controllers/ai-teacher.controller.js';

// Feature services
import { AttendanceRiskService } from './services/attendance-risk.service.js';
import { ChapterSummaryService } from './services/chapter-summary.service.js';
import { DoubtSolverService } from './services/doubt-solver.service.js';
import { FlashcardService } from './services/flashcard.service.js';
import { HomeworkGeneratorService } from './services/homework-generator.service.js';
import { LessonPlanService } from './services/lesson-plan.service.js';
import { NoticeGeneratorService } from './services/notice-generator.service.js';
import { ParentMessageService } from './services/parent-message.service.js';
import { PracticeQuizService } from './services/practice-quiz.service.js';
import { ProgressSummaryService } from './services/progress-summary.service.js';
import { QuestionPaperService } from './services/question-paper.service.js';
import { QuizGeneratorService } from './services/quiz-generator.service.js';
import { ReportCardRemarksService } from './services/report-card-remarks.service.js';
import { WeakSubjectService } from './services/weak-subject.service.js';

@Module({
  providers: [
    // Core infrastructure
    AiProviderService,
    AiSafetyService,
    AiCreditService,
    PrismaService,
    RolesGuard,

    // Teacher features
    HomeworkGeneratorService,
    QuizGeneratorService,
    LessonPlanService,
    QuestionPaperService,
    ReportCardRemarksService,

    // Admin features
    NoticeGeneratorService,
    ParentMessageService,

    // Student features
    DoubtSolverService,
    ChapterSummaryService,
    FlashcardService,
    PracticeQuizService,

    // Analytics features
    ProgressSummaryService,
    AttendanceRiskService,
    WeakSubjectService,
  ],
  controllers: [
    AiTeacherController,
    AiAdminController,
    AiStudentController,
    AiAnalyticsController,
  ],
  exports: [AiProviderService, AiSafetyService, AiCreditService],
})
export class AiModule {}
