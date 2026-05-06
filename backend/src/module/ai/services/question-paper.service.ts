import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateQuestionPaperDto } from '../dto/question-paper.dto.js';

const MODULE_NAME = 'question_paper';

@Injectable()
export class QuestionPaperService {
  private readonly logger = new Logger(QuestionPaperService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateQuestionPaperDto,
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

    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      mr: 'Marathi',
    };
    const language = langMap[dto.language ?? 'en'] || 'English';
    const includeAnswerKey = dto.includeAnswerKey !== false;

    const sectionDesc = dto.sectionConfig
      .map(
        (s) =>
          `- ${s.name}: ${s.count} questions of type "${s.questionType}", ${s.marksPerQuestion} marks each`,
      )
      .join('\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate an exam question paper with the following specifications:

School Exam Paper
- Class: "${schoolClass.name}"
- Subject: "${subject.name}"
- Exam Type: ${dto.examType}
- Total Marks: ${dto.totalMarks}
- Chapters to cover: ${dto.chapters.join(', ')}
- Language: ${language}

Section Configuration:
${sectionDesc}

${includeAnswerKey ? 'Include an answer key for each question.' : 'Do NOT include answers.'}

Respond ONLY in valid JSON with this exact structure:
{
  "header": {
    "schoolName": "[School Name]",
    "examName": "${dto.examType} Examination",
    "subject": "${subject.name}",
    "class": "${schoolClass.name}",
    "totalMarks": ${dto.totalMarks},
    "duration": "string — suggested duration",
    "instructions": ["string — general instruction"]
  },
  "sections": [
    {
      "name": "Section A",
      "questionType": "mcq",
      "marksPerQuestion": 1,
      "questions": [
        {
          "number": 1,
          "text": "string — question text",
          "options": ["A", "B", "C", "D"] | null,
          "marks": 1,
          "answerKey": "string — answer" | null
        }
      ]
    }
  ],
  "totalMarks": ${dto.totalMarks}
}`,
      },
    ];

    const response = await this.aiProvider.chat(messages, {
      module: MODULE_NAME,
      jsonMode: true,
      maxTokens: 4000,
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
      this.logger.warn('AI returned non-JSON for question paper, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
