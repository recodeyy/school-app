import {  Injectable, Logger, NotFoundException , HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { GenerateReportCardRemarksDto } from '../dto/report-card-remarks.dto.js';

const MODULE_NAME = 'report_card_remarks';

@Injectable()
export class ReportCardRemarksService {
  private readonly logger = new Logger(ReportCardRemarksService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async generate(
    dto: GenerateReportCardRemarksDto,
    userId: string,
    userRole: string,
  ) {
    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    // Fetch student with profile
    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
      include: {
        studentProfile: { include: { schoolClass: true } },
      },
    });

    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student not found');
    }

    // Fetch results (optionally filtered by exam)
    const resultsWhere: any = { studentId: dto.studentId };
    if (dto.examId) {
      resultsWhere.examId = dto.examId;
    }

    const results = await this.prisma.result.findMany({
      where: resultsWhere,
      include: { subject: true, exam: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Fetch attendance stats
    const totalSessions = await this.prisma.attendanceRecord.count({
      where: { studentId: dto.studentId },
    });
    const presentSessions = await this.prisma.attendanceRecord.count({
      where: { studentId: dto.studentId, status: 'PRESENT' },
    });
    const attendancePercent =
      totalSessions > 0
        ? Math.round((presentSessions / totalSessions) * 100)
        : null;

    // Build data summary for the AI
    const subjectSummary = results.map((r) => ({
      subject: r.subject.name,
      exam: r.exam.name,
      marksObtained: r.marksObtained.toString(),
      totalMarks: r.exam.totalMarks.toString(),
      grade: r.grade || 'N/A',
    }));

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Generate report card remarks for the following student:

Student Name: ${student.name}
Class: ${student.studentProfile.schoolClass.name}
Attendance: ${attendancePercent !== null ? `${attendancePercent}%` : 'No attendance data available'}

Academic Performance:
${subjectSummary.length > 0 ? JSON.stringify(subjectSummary, null, 2) : 'No exam results available yet.'}

Based on this data, generate thoughtful, constructive report card remarks.

Respond ONLY in valid JSON with this exact structure:
{
  "studentName": "${student.name}",
  "class": "${student.studentProfile.schoolClass.name}",
  "overallRemark": "string — 2-3 sentence overall remark",
  "strengths": ["string — strength 1", "string — strength 2"],
  "areasForImprovement": ["string — area 1"],
  "encouragement": "string — motivational closing remark",
  "attendanceRemark": "string — remark on attendance"
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
      this.logger.warn('AI returned non-JSON for remarks, returning raw');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
