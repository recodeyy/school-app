import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TimetableService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get class-wise timetable (full week or specific day).
   */
  async getClassTimetable(classId: string, dayOfWeek?: number) {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: classId },
    });
    if (!schoolClass) throw new NotFoundException('Class not found');

    const where: any = { classId };
    if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;

    const slots = await this.prisma.timetableSlot.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Group by day of week
    const grouped: Record<number, any[]> = {};
    for (const slot of slots) {
      if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
      grouped[slot.dayOfWeek].push(slot);
    }

    return {
      classId,
      className: schoolClass.name,
      timetable: grouped,
      slots,
    };
  }

  /**
   * Get teacher's schedule (all classes they teach).
   */
  async getTeacherSchedule(teacherId: string, dayOfWeek?: number) {
    // Get all subjects taught by this teacher
    const subjects = await this.prisma.subject.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const subjectIds = subjects.map((s) => s.id);
    if (subjectIds.length === 0) {
      return { teacherId, schedule: [], timetable: {} };
    }

    const where: any = { subjectId: { in: subjectIds } };
    if (dayOfWeek !== undefined) where.dayOfWeek = dayOfWeek;

    const slots = await this.prisma.timetableSlot.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        subject: { select: { id: true, name: true, code: true } },
        schoolClass: { select: { id: true, name: true } },
      },
    });

    // Group by day
    const grouped: Record<number, any[]> = {};
    for (const slot of slots) {
      if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
      grouped[slot.dayOfWeek].push(slot);
    }

    return {
      teacherId,
      schedule: slots,
      timetable: grouped,
    };
  }

  /**
   * Get today's schedule for a student (based on their class).
   */
  async getStudentTodaySchedule(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });
    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student not found');
    }

    const todayDow = new Date().getDay();
    return this.getClassTimetable(student.studentProfile.classId, todayDow);
  }
}
