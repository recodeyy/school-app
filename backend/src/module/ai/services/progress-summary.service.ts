import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateProgressSummaryDto } from '../dto/progress-summary.dto.js';

const MODULE_NAME = 'progress_summary';

@Injectable()
export class ProgressSummaryService {
  private readonly logger = new Logger(ProgressSummaryService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateProgressSummaryDto,
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

    // Fetch all results grouped by subject
    const results = await this.prisma.result.findMany({
      where: { studentId: dto.studentId },
      include: { subject: true, exam: true },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch attendance stats
    const totalRecords = await this.prisma.attendanceRecord.count({
      where: { studentId: dto.studentId },
    });
    const presentRecords = await this.prisma.attendanceRecord.count({
      where: { studentId: dto.studentId, status: 'PRESENT' },
    });
    const lateRecords = await this.prisma.attendanceRecord.count({
      where: { studentId: dto.studentId, status: 'LATE' },
    });
    const attendancePercent =
      totalRecords > 0
        ? Math.round((presentRecords / totalRecords) * 100)
        : null;

    // Build subject-wise summary
    const subjectMap = new Map<string, { scores: number[]; total: number[]; exams: string[] }>();
    for (const r of results) {
      const key = r.subject.name;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, { scores: [], total: [], exams: [] });
      }
      const entry = subjectMap.get(key)!;
      entry.scores.push(Number(r.marksObtained));
      entry.total.push(Number(r.exam.totalMarks));
      entry.exams.push(r.exam.name);
    }

    const subjectSummary = Array.from(subjectMap.entries()).map(
      ([name, data]) => ({
        subject: name,
        averagePercent: Math.round(
          (data.scores.reduce((a, b) => a + b, 0) /
            data.total.reduce((a, b) => a + b, 0)) *
            100,
        ),
        examsTaken: data.exams.length,
        latestScore: `${data.scores[0]}/${data.total[0]}`,
      }),
    );

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate a parent-friendly student progress summary for:

Student: ${student.name}
Class: ${student.studentProfile.schoolClass.name}
Attendance: ${attendancePercent !== null ? `${attendancePercent}% (${presentRecords} present, ${lateRecords} late out of ${totalRecords} sessions)` : 'No data'}

Subject Performance:
${subjectSummary.length > 0 ? JSON.stringify(subjectSummary, null, 2) : 'No exam data available yet.'}

Write a warm, encouraging, parent-friendly summary. Avoid jargon. Use simple language a parent would understand.

Respond ONLY in valid JSON:
{
  "studentName": "${student.name}",
  "class": "${student.studentProfile.schoolClass.name}",
  "summary": "string — 2-3 paragraph overall progress summary for parents",
  "subjectWise": [
    {
      "subject": "string",
      "trend": "improving | stable | declining",
      "remark": "string — parent-friendly remark"
    }
  ],
  "attendanceSummary": "string — comment on attendance pattern",
  "recommendations": ["string — actionable suggestion for parents"]
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

    if (isFlagged) return { error: content };

    try {
      return JSON.parse(content);
    } catch {
      this.logger.warn('AI returned non-JSON for progress summary');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
