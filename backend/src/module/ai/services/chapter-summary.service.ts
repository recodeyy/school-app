import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateChapterSummaryDto } from '../dto/chapter-summary.dto.js';

const MODULE_NAME = 'chapter_summary';

@Injectable()
export class ChapterSummaryService {
  private readonly logger = new Logger(ChapterSummaryService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateChapterSummaryDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
      include: { schoolClass: true },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
    const language = langMap[dto.language ?? 'en'] || 'English';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, true, subject.schoolClass.name),
      },
      {
        role: 'user',
        content: `Create a concise chapter summary and revision notes for:
- Subject: "${subject.name}"
- Class: "${subject.schoolClass.name}"
- Chapter/Topic: "${dto.chapter}"
- Language: ${language}

Respond ONLY in valid JSON:
{
  "subject": "${subject.name}",
  "chapter": "${dto.chapter}",
  "summary": "string — 3-5 paragraph summary of the chapter",
  "keyPoints": ["string — key point 1", "string — key point 2"],
  "definitions": [{"term": "string", "definition": "string"}],
  "revisionNotes": "string — quick revision bullet points",
  "mnemonics": ["string — memory aids if applicable"]
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
      this.logger.warn('AI returned non-JSON for chapter summary');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
