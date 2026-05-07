import { Injectable, Logger, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AiCreditService } from '../core/ai-credit.service.js';
import type { ChatMessage } from '../core/ai-provider.interface.js';
import { AiProviderService } from '../core/ai-provider.service.js';
import { AiSafetyService } from '../core/ai-safety.service.js';
import type { AnalyzeAttendanceRiskDto } from '../dto/attendance-risk.dto.js';

const MODULE_NAME = 'attendance_risk';

@Injectable()
export class AttendanceRiskService {
  private readonly logger = new Logger(AttendanceRiskService.name);

  constructor(
    private readonly aiProvider: AiProviderService,
    private readonly aiSafety: AiSafetyService,
    private readonly aiCredit: AiCreditService,
    private readonly prisma: PrismaService,
  ) {}

  async analyze(
    dto: AnalyzeAttendanceRiskDto,
    userId: string,
    userRole: string,
  ) {
    if (!dto.studentId && !dto.classId) {
      throw new BadRequestException(
        'Either studentId or classId must be provided',
      );
    }

    await this.aiCredit.enforceLimit(userId, userRole, MODULE_NAME);

    // Build student list
    let studentIds: string[] = [];
    if (dto.studentId) {
      studentIds = [dto.studentId];
    } else if (dto.classId) {
      const profiles = await this.prisma.studentProfile.findMany({
        where: { classId: dto.classId },
        select: { userId: true },
      });
      studentIds = profiles.map((p) => p.userId);
    }

    if (studentIds.length === 0) {
      throw new NotFoundException('No students found');
    }

    // Compute attendance stats per student
    const studentStats = await Promise.all(
      studentIds.map(async (sid) => {
        const student = await this.prisma.user.findUnique({
          where: { id: sid },
          select: { name: true },
        });
        const total = await this.prisma.attendanceRecord.count({
          where: { studentId: sid },
        });
        const present = await this.prisma.attendanceRecord.count({
          where: { studentId: sid, status: 'PRESENT' },
        });
        const absent = await this.prisma.attendanceRecord.count({
          where: { studentId: sid, status: 'ABSENT' },
        });
        const late = await this.prisma.attendanceRecord.count({
          where: { studentId: sid, status: 'LATE' },
        });
        return {
          studentId: sid,
          name: student?.name ?? 'Unknown',
          totalSessions: total,
          present,
          absent,
          late,
          attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
        };
      }),
    );

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: this.aiSafety.buildSystemPreamble(MODULE_NAME, false),
      },
      {
        role: 'user',
        content: `Analyze attendance risk for the following student(s):

${JSON.stringify(studentStats, null, 2)}

For each student, identify:
- Risk level (low/medium/high/critical)
- Attendance patterns (e.g. frequent Mondays absent, increasing absences)
- Suggested actions

Respond ONLY in valid JSON:
{
  "analysis": [
    {
      "studentId": "string",
      "name": "string",
      "attendancePercent": 75,
      "riskLevel": "low | medium | high | critical",
      "pattern": "string — describe the attendance pattern observed",
      "explanation": "string — plain-language explanation of the risk",
      "suggestedActions": ["string — action 1"]
    }
  ],
  "overallSummary": "string — summary for the class if multiple students"
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
      this.logger.warn('AI returned non-JSON for attendance risk');
      throw new HttpException('The AI generated an invalid response format. Please try again.', HttpStatus.UNPROCESSABLE_ENTITY);
    }
  }
}
