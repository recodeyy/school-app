import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateParentMessageDto } from '../dto/parent-message.dto.js';

const MODULE_NAME = 'parent_message';

@Injectable()
export class ParentMessageService {
  private readonly logger = new Logger(ParentMessageService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateParentMessageDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    // Fetch student name and parent info
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
      include: {
        studentProfile: {
          include: {
            schoolClass: true,
            guardian: true,
          },
        },
      },
    });

    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student not found');
    }

    const parentName = student.studentProfile.guardian?.name || 'Parent/Guardian';
    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
    };
    const language = langMap[dto.language ?? 'en'] || 'English';
    const tone = dto.tone || 'formal';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Write a polite message to a parent about their child. Details:

Student Name: ${student.name}
Class: ${student.studentProfile.schoolClass.name}
Parent Name: ${parentName}
Issue Category: ${dto.issue}
Specific Details: ${dto.details}
Language: ${language}
Tone: ${tone}

The message should be respectful, clear, and professional. It should convey the issue without being accusatory and suggest a constructive path forward.

Respond ONLY in valid JSON with this exact structure:
{
  "greeting": "string — greeting line addressing the parent",
  "body": "string — main message body (use \\n for paragraphs)",
  "actionRequired": "string — what action is expected from the parent, if any",
  "closing": "string — polite closing line",
  "senderPlaceholder": "string — e.g. 'Class Teacher, ${student.studentProfile.schoolClass.name}'"
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
      this.logger.warn('AI returned non-JSON for parent message, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
