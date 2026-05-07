import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin Dashboard Stats
   */
  async getAdminDashboard() {
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      activeNotices,
      pendingFees,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      this.prisma.user.count({ where: { role: 'TEACHER', isActive: true } }),
      this.prisma.schoolClass.count(),
      this.prisma.notice.count({ where: { isActive: true } }),
      this.prisma.fee.count({
        where: { status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] } },
      }),
    ]);

    return {
      quickStats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        activeNotices,
        pendingFees,
      },
    };
  }

  /**
   * Teacher Dashboard Stats
   */
  async getTeacherDashboard(teacherId: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const dow = new Date().getDay();

    const [subjectsTaught, myClasses, todayTimetable, pendingHomework] =
      await Promise.all([
        this.prisma.subject.count({ where: { teacherId } }),
        this.prisma.schoolClass.count({ where: { classTeacherId: teacherId } }),
        this.prisma.timetableSlot.findMany({
          where: {
            subject: { teacherId },
            dayOfWeek: dow,
          },
          include: {
            schoolClass: { select: { name: true } },
            subject: { select: { name: true } },
          },
          orderBy: { startTime: 'asc' },
        }),
        this.prisma.homework.count({
          where: {
            createdById: teacherId,
            dueDate: { gte: today },
          },
        }),
      ]);

    return {
      overview: {
        subjectsTaught,
        classesAssigned: myClasses,
        pendingHomework,
      },
      todaySchedule: todayTimetable,
    };
  }

  /**
   * Student Dashboard Stats
   */
  async getStudentDashboard(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!student || !student.studentProfile) {
      return { error: 'Student profile not found' };
    }

    const classId = student.studentProfile.classId;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [pendingHomework, unreadNotices, pendingFees, attendanceSummary] =
      await Promise.all([
        this.prisma.homework.findMany({
          where: {
            classId,
            isPublished: true,
            dueDate: { gte: today },
            submissions: { none: { studentId } },
          },
          take: 5,
          orderBy: { dueDate: 'asc' },
          include: { subject: { select: { name: true } } },
        }),
        this.prisma.notice.findMany({
          where: {
            isActive: true,
            targetRoles: { has: 'STUDENT' },
            OR: [{ classId: null }, { classId }],
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.fee.findMany({
          where: {
            studentId,
            status: { in: ['PENDING', 'PARTIAL', 'OVERDUE'] },
          },
          take: 5,
        }),
        this.getStudentAttendanceSummary(studentId),
      ]);

    return {
      attendanceSummary,
      pendingHomework,
      unreadNotices,
      pendingFees,
    };
  }

  /**
   * Parent Dashboard Stats
   */
  async getParentDashboard(parentId: string) {
    // A parent can have multiple children
    const children = await this.prisma.user.findMany({
      where: {
        role: 'STUDENT',
        studentProfile: { guardianId: parentId },
      },
      include: { studentProfile: true },
    });

    const childrenData = await Promise.all(
      children.map(async (child) => {
        return {
          childId: child.id,
          name: child.name,
          dashboard: await this.getStudentDashboard(child.id),
        };
      }),
    );

    return {
      childrenOverview: childrenData,
    };
  }

  private async getStudentAttendanceSummary(studentId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { studentId },
    });

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, percentage };
  }
}
