import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { AskDoubtDto } from '../dto/doubt-solver.dto.js';

const MODULE_NAME = 'doubt_solver';

@Injectable()
export class DoubtSolverService {
  private readonly logger = new Logger(DoubtSolverService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async solve(dto: AskDoubtDto, userId: string, userRole: string) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    // Fetch student's class level for age-appropriate responses
    let classLevel: string | undefined;
    try {
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: { include: { schoolClass: true } } },
      });
      classLevel = student?.studentProfile?.schoolClass?.name;
    } catch (err) {
      this.logger.warn(`Could not fetch student profile for ${userId}: ${err}`);
      // Continue without class level — non-fatal
    }

    // Optionally fetch subject name for context
    let subjectName = '';
    if (dto.subjectId) {
      try {
        const subject = await this.prisma.subject.findUnique({
          where: { id: dto.subjectId },
        });
        subjectName = subject?.name ?? '';
      } catch (err) {
        this.logger.warn(`Could not fetch subject ${dto.subjectId}: ${err}`);
      }
    }

    const contextParts: string[] = [];
    if (subjectName) contextParts.push(`Subject: ${subjectName}`);
    if (dto.chapter) contextParts.push(`Chapter: ${dto.chapter}`);
    const contextStr =
      contextParts.length > 0
        ? `\nContext:\n${contextParts.join('\n')}`
        : '';

    const safeMessages = this.aiSafety.injectSafetyPreamble(
      [
        {
          role: 'user',
          content: `A student has the following doubt:${contextStr}

Question: ${dto.question}

Provide a clear, step-by-step explanation appropriate for the student's level. Do NOT just give the answer — help the student understand the concept.

Respond ONLY in valid JSON:
{
  "explanation": "string — detailed step-by-step explanation",
  "examples": ["string — illustrative example"],
  "relatedTopics": ["string — related topics to study"],
  "tip": "string — a helpful study tip"
}`,
        },
      ],
      MODULE_NAME,
      true,
      classLevel,
    );

    const response = await this.aiProvider.chat(safeMessages, {
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
      this.logger.warn('AI returned non-JSON for doubt solver, returning raw');
      throw new HttpException(
        'The AI generated an invalid response format. Please try again.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }
}
