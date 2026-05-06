import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateFlashcardsDto } from '../dto/flashcard.dto.js';

const MODULE_NAME = 'flashcards';

@Injectable()
export class FlashcardService {
  private readonly logger = new Logger(FlashcardService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(dto: GenerateFlashcardsDto, userId: string, userRole: string) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
      include: { schoolClass: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    const count = dto.count ?? 10;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, true, subject.schoolClass.name),
      },
      {
        role: 'user',
        content: `Generate ${count} revision flashcards for:
- Subject: "${subject.name}"
- Class: "${subject.schoolClass.name}"
- Chapter/Topic: "${dto.chapter}"

Each flashcard should have a front (question/term) and back (answer/definition).

Respond ONLY in valid JSON:
{
  "subject": "${subject.name}",
  "chapter": "${dto.chapter}",
  "flashcards": [
    {
      "front": "string — question or term",
      "back": "string — answer or definition"
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
      this.logger.warn('AI returned non-JSON for flashcards');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
