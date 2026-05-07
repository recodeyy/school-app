import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateLessonPlanDto } from '../dto/lesson-plan.dto.js';

const MODULE_NAME = 'lesson_plan';

@Injectable()
export class LessonPlanService {
  private readonly logger = new Logger(LessonPlanService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateLessonPlanDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const [schoolClass, subject] = await Promise.all([
      this.prisma.schoolClass.findUnique({ where: { id: dto.classId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
    ]);

    if (!schoolClass) throw new NotFoundException('Class not found');
    if (!subject) throw new NotFoundException('Subject not found');

    const duration = dto.duration ?? 45;
    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
    };
    const language = langMap[dto.language ?? 'en'] || 'English';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Create a detailed lesson plan for:
- Class: "${schoolClass.name}"
- Subject: "${subject.name}"
- Chapter/Topic: "${dto.chapter}"
- Duration: ${duration} minutes
- Language: ${language}

Respond ONLY in valid JSON with this exact structure:
{
  "title": "string — lesson plan title",
  "class": "${schoolClass.name}",
  "subject": "${subject.name}",
  "chapter": "${dto.chapter}",
  "duration": "${duration} minutes",
  "objectives": [
    "string — learning objective 1",
    "string — learning objective 2"
  ],
  "warmUp": {
    "duration": "5 minutes",
    "activity": "string — warm-up activity description"
  },
  "explanationFlow": [
    {
      "step": 1,
      "topic": "string — sub-topic",
      "duration": "10 minutes",
      "method": "string — teaching method (lecture, discussion, demo, etc.)",
      "description": "string — what the teacher does and says"
    }
  ],
  "activities": [
    {
      "name": "string — activity name",
      "type": "individual | group | pair",
      "duration": "10 minutes",
      "description": "string — activity description",
      "materials": ["string — required materials"]
    }
  ],
  "assessment": {
    "type": "string — oral, written, quiz, etc.",
    "description": "string — how to assess understanding"
  },
  "homework": {
    "description": "string — homework assignment",
    "dueIn": "string — e.g. 'next class'"
  },
  "teacherNotes": "string — additional notes for the teacher"
}`,
      },
    ];

    const response = await this.aiProvider.chat(messages, {
      module: MODULE_NAME,
      jsonMode: true,
      maxTokens: 3000,
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
      this.logger.warn('AI returned non-JSON for lesson plan, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
