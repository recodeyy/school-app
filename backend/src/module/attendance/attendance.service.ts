import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceStatus } from '../../generated/prisma/client.js';
import { parsePagination } from '../../common/index.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAttendanceSessionDto, QueryAttendanceDto } from './dto/index.js';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationCoreService,
  ) {}

  private parseTimeToDate(value: string): Date {
    const parts = value.split(':').map((p) => parseInt(p, 10));
    if (parts.length < 2)
      throw new BadRequestException('Invalid time format, expected HH:mm');
    const d = new Date(0);
    d.setUTCHours(parts[0] ?? 0, parts[1] ?? 0, 0, 0);
    return d;
  }

  /**
   * Create an attendance session with records (daily/period-wise).
   * Also notifies parents of absent/late students.
   */
  async createSession(dto: CreateAttendanceSessionDto, teacherId: string) {
    // Validate class
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass) throw new NotFoundException('Class not found');

    // Validate subject
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subjectId },
    });
    if (!subject) throw new NotFoundException('Subject not found');

    const session = await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.attendanceSession.create({
        data: {
          classId: dto.classId,
          subjectId: dto.subjectId,
          teacherId,
          date: new Date(dto.date),
          startTime: this.parseTimeToDate(dto.startTime),
        },
      });

      if (dto.records && dto.records.length > 0) {
        await tx.attendanceRecord.createMany({
          data: dto.records.map((r) => ({
            sessionId: newSession.id,
            studentId: r.studentId,
            status: r.status as AttendanceStatus,
            note: r.note ?? null,
          })),
        });
      }

      return newSession;
    });

    // Notify parents of absent/late students
    const absentLateStudentIds = dto.records
      .filter((r) => r.status === 'ABSENT' || r.status === 'LATE')
      .map((r) => r.studentId);

    if (absentLateStudentIds.length > 0) {
      await this.notificationService.notifyGuardians(
        absentLateStudentIds,
        'ATTENDANCE_ALERT',
        `Attendance Alert: ${subject.name}`,
        `Your child was marked absent/late for ${subject.name} on ${dto.date}`,
        { sessionId: session.id, classId: dto.classId, date: dto.date },
      );
    }

    return this.getSession(session.id);
  }

  /**
   * Get a single session with records.
   */
  async getSession(id: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        records: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
        subject: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    });
    if (!session) throw new NotFoundException('Attendance session not found');
    return session;
  }

  /**
   * List attendance sessions for a class (with date range filtering).
   */
  async listSessions(query: QueryAttendanceDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};

    if (query.classId) where.classId = query.classId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.attendanceSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          subject: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
          teacher: { select: { id: true, name: true } },
          _count: { select: { records: true } },
        },
      }),
      this.prisma.attendanceSession.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get attendance records for a specific student.
   */
  async getStudentAttendance(studentId: string, query: QueryAttendanceDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { studentId };

    if (query.startDate || query.endDate) {
      where.session = { date: {} };
      if (query.startDate) where.session.date.gte = new Date(query.startDate);
      if (query.endDate) where.session.date.lte = new Date(query.endDate);
    }

    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { session: { date: 'desc' } },
        include: {
          session: {
            include: {
              subject: { select: { id: true, name: true } },
              schoolClass: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get attendance summary stats for a student.
   */
  async getStudentAttendanceSummary(
    studentId: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = { studentId };
    if (startDate || endDate) {
      where.session = { date: {} };
      if (startDate) where.session.date.gte = new Date(startDate);
      if (endDate) where.session.date.lte = new Date(endDate);
    }

    const records = await this.prisma.attendanceRecord.findMany({ where });

    const total = records.length;
    const present = records.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const excused = records.filter(
      (r) => r.status === AttendanceStatus.EXCUSED,
    ).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
  }

  /**
   * Get daily attendance for a class on a specific date.
   */
  async getDailyAttendance(classId: string, date: string) {
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { classId, date: new Date(date) },
      include: {
        records: {
          include: { student: { select: { id: true, name: true } } },
        },
        subject: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    return sessions;
  }
}
