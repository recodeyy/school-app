import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateNoticeDto } from '../dto/notice.dto.js';

const MODULE_NAME = 'notice';

@Injectable()
export class NoticeGeneratorService {
  private readonly logger = new Logger(NoticeGeneratorService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
  ) {}

  async generate(dto: GenerateNoticeDto, userId: string, userRole: string) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
    };
    const language = langMap[dto.language] || 'English';
    const tone = dto.tone || 'formal';
    const keyPointsList =
      dto.keyPoints && dto.keyPoints.length > 0
        ? dto.keyPoints.map((p) => `- ${p}`).join('\n')
        : 'None specified — use your best judgment.';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate a polished school circular/notice with these details:

Topic: ${dto.topic}
Target Audience: ${dto.audience}
Language: ${language}
Tone: ${tone}

Key points to include:
${keyPointsList}

The notice should be professional, well-formatted, and ready to be printed or sent digitally.

Respond ONLY in valid JSON with this exact structure:
{
  "subject": "string — notice subject line",
  "date": "string — current date in formal format",
  "to": "string — addressed to",
  "body": "string — the full notice body (use \\n for line breaks)",
  "closingLine": "string — closing remark",
  "signedBy": "string — placeholder for authority signature"
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
      this.logger.warn('AI returned non-JSON for notice, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
