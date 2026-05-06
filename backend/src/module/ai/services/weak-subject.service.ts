import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { DetectWeakSubjectsDto } from '../dto/weak-subject.dto.js';

const MODULE_NAME = 'weak_subject';

@Injectable()
export class WeakSubjectService {
  private readonly logger = new Logger(WeakSubjectService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async detect(
    dto: DetectWeakSubjectsDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
      include: { studentProfile: { include: { schoolClass: true } } },
    });
    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student not found');
    }

    // Fetch all results for the student
    const results = await this.prisma.result.findMany({
      where: { studentId: dto.studentId },
      include: { subject: true, exam: true },
      orderBy: { createdAt: 'desc' },
    });

    if (results.length === 0) {
      return {
        studentName: student.name,
        message: 'No exam results available for analysis.',
        weakSubjects: [],
      };
    }

    // Compute per-subject stats
    const subjectMap = new Map<
      string,
      { subjectId: string; scores: number[]; totals: number[]; exams: string[] }
    >();
    for (const r of results) {
      const key = r.subject.name;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, {
          subjectId: r.subjectId,
          scores: [],
          totals: [],
          exams: [],
        });
      }
      const entry = subjectMap.get(key)!;
      entry.scores.push(Number(r.marksObtained));
      entry.totals.push(Number(r.exam.totalMarks));
      entry.exams.push(r.exam.name);
    }

    const subjectStats = Array.from(subjectMap.entries()).map(
      ([name, data]) => {
        const avgPercent = Math.round(
          (data.scores.reduce((a, b) => a + b, 0) /
            data.totals.reduce((a, b) => a + b, 0)) *
            100,
        );
        return {
          subject: name,
          averagePercent: avgPercent,
          examsTaken: data.exams.length,
          scores: data.scores.map(
            (s, i) => `${s}/${data.totals[i]} (${data.exams[i]})`,
          ),
        };
      },
    );

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Analyze subject-wise performance and detect weak subjects for:

Student: ${student.name}
Class: ${student.studentProfile.schoolClass.name}

Subject Performance:
${JSON.stringify(subjectStats, null, 2)}

Identify subjects where the student is below 50% or significantly below their own average. Provide analysis and recommendations.

Respond ONLY in valid JSON:
{
  "studentName": "${student.name}",
  "class": "${student.studentProfile.schoolClass.name}",
  "overallAverage": number,
  "weakSubjects": [
    {
      "subject": "string",
      "averagePercent": number,
      "analysis": "string — why this is a concern",
      "recommendations": ["string — specific study suggestion"]
    }
  ],
  "strongSubjects": [
    {
      "subject": "string",
      "averagePercent": number,
      "remark": "string — positive note"
    }
  ],
  "overallRecommendation": "string — overall advice for the student/parent"
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
      this.logger.warn('AI returned non-JSON for weak subject detection');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
