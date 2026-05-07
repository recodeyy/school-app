import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import { QuestionType, type GenerateQuizDto } from '../dto/quiz.dto.js';

const MODULE_NAME = 'quiz';

@Injectable()
export class QuizGeneratorService {
  private readonly logger = new Logger(QuizGeneratorService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(dto: GenerateQuizDto, userId: string, userRole: string) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
      include: { schoolClass: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    const questionCount = dto.questionCount ?? 10;
    const types = dto.types ?? [QuestionType.MCQ];
    const includeAnswerKey = dto.includeAnswerKey !== false;

    const typeLabels: Record<string, string> = {
      mcq: 'Multiple Choice Questions (4 options, one correct)',
      short: 'Short Answer Questions (2-3 lines)',
      long: 'Long Answer Questions (detailed answer)',
      true_false: 'True/False Questions',
      fill_blank: 'Fill in the Blank Questions',
    };
    const typeInstructions = types
      .map((t) => typeLabels[t] || t)
      .join('\n- ');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate a quiz for subject "${subject.name}" (class "${subject.schoolClass.name}"), chapter/topic "${dto.chapter}".

Difficulty: ${dto.difficulty}
Total questions: ${questionCount}
Question types to include:
- ${typeInstructions}

${includeAnswerKey ? 'Include an answer key for each question.' : 'Do NOT include answers.'}

Respond ONLY in valid JSON with this exact structure:
{
  "title": "string — quiz title",
  "subject": "${subject.name}",
  "chapter": "${dto.chapter}",
  "difficulty": "${dto.difficulty}",
  "questions": [
    {
      "number": 1,
      "type": "mcq | short | long | true_false | fill_blank",
      "text": "string — the question text",
      "options": ["A", "B", "C", "D"] | null,
      "correctAnswer": "string — correct answer" | null,
      "marks": 2
    }
  ],
  "totalMarks": 20
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

    if (isFlagged) {
      return { error: content };
    }

    try {
      return JSON.parse(content);
    } catch {
      this.logger.warn('AI returned non-JSON for quiz, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
