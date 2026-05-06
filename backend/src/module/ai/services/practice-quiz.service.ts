import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GeneratePracticeQuizDto } from '../dto/practice-quiz.dto.js';

const MODULE_NAME = 'practice_quiz';

@Injectable()
export class PracticeQuizService {
  private readonly logger = new Logger(PracticeQuizService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GeneratePracticeQuizDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
      include: { schoolClass: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    // Auto-detect weak topics from results if not provided
    let weakTopics = dto.weakTopics ?? [];
    if (weakTopics.length === 0) {
      const results = await this.prisma.result.findMany({
        where: { studentId: userId, subjectId: dto.subjectId },
        include: { exam: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Simple heuristic: if marks < 50% of total, flag the exam topic
      const weakExams = results.filter(
        (r) =>
          Number(r.marksObtained) < Number(r.exam.totalMarks) * 0.5,
      );
      if (weakExams.length > 0) {
        weakTopics = weakExams.map((r) => r.exam.name);
      }
    }

    const topicContext =
      weakTopics.length > 0
        ? `Focus on these weak topics: ${weakTopics.join(', ')}`
        : dto.chapter
          ? `Focus on chapter: ${dto.chapter}`
          : 'Cover the most important topics from the subject';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, true, subject.schoolClass.name),
      },
      {
        role: 'user',
        content: `Generate a personalized practice quiz for:
- Subject: "${subject.name}"
- Class: "${subject.schoolClass.name}"
- ${topicContext}

Generate 10 questions with a mix of MCQ and short answer. Include explanations for each answer.

Respond ONLY in valid JSON:
{
  "subject": "${subject.name}",
  "focusAreas": ${JSON.stringify(weakTopics.length > 0 ? weakTopics : [dto.chapter ?? subject.name])},
  "questions": [
    {
      "number": 1,
      "type": "mcq | short_answer",
      "text": "string — question text",
      "options": ["A", "B", "C", "D"] | null,
      "correctAnswer": "string",
      "explanation": "string — why this is correct"
    }
  ]
}`,
      },
    ];

    const response = await this.aiProvider.chat(messages, {
      module: MODULE_NAME,
      jsonMode: true,
    });

    const { content, isFlagged } = await this.aiSafety.processResponse(
      response,
      userId,
      MODULE_NAME,
    );

    if (isFlagged) return { error: content };

    try {
      return JSON.parse(content);
    } catch {
      this.logger.warn('AI returned non-JSON for practice quiz');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
