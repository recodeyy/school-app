import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateHomeworkDto } from '../dto/homework.dto.js';

const MODULE_NAME = 'homework';

@Injectable()
export class HomeworkGeneratorService {
  private readonly logger = new Logger(HomeworkGeneratorService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(dto: GenerateHomeworkDto, userId: string, userRole: string) {
    // Enforce usage limits
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    // Fetch class and subject names from DB
    const [schoolClass, subject] = await Promise.all([
      this.prisma.schoolClass.findUnique({ where: { id: dto.classId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
    ]);

    if (!schoolClass) throw new NotFoundException('Class not found');
    if (!subject) throw new NotFoundException('Subject not found');

    const questionCount = dto.questionCount ?? 5;

    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
    };
    const language = langMap[dto.language] || 'English';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate a homework assignment for class "${schoolClass.name}", subject "${subject.name}", chapter/topic "${dto.chapter}".

Difficulty: ${dto.difficulty}
Number of questions: ${questionCount}
Language: ${language}

Respond ONLY in valid JSON with this exact structure:
{
  "title": "string — homework title",
  "instructions": "string — instructions for students",
  "questions": [
    {
      "number": 1,
      "type": "short_answer | long_answer | mcq | fill_blank | true_false",
      "text": "string — the question",
      "marks": 2
    }
  ],
  "suggestedDueDate": "string — e.g. '3 days from assignment date'"
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
      this.logger.warn('AI returned non-JSON for homework, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
