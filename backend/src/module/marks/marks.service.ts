import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamType } from '../../generated/prisma/client.js';
import { parsePagination } from '../../common/index.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateExamDto, QueryResultsDto, UploadMarksDto } from './dto/index.js';

@Injectable()
export class MarksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationCoreService,
  ) {}

  /**
   * Create an exam.
   */
  async createExam(dto: CreateExamDto) {
    const schoolClass = await this.prisma.schoolClass.findUnique({
      where: { id: dto.classId },
    });
    if (!schoolClass) throw new NotFoundException('Class not found');

    return this.prisma.exam.create({
      data: {
        name: dto.name,
        classId: dto.classId,
        type: dto.type as ExamType,
        totalMarks: dto.totalMarks,
        examDate: new Date(dto.examDate),
        isPublished: dto.isPublished ?? false,
      },
      include: {
        schoolClass: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * List exams with optional class filtering.
   */
  async listExams(classId?: string) {
    const where: any = {};
    if (classId) where.classId = classId;

    return this.prisma.exam.findMany({
      where,
      orderBy: { examDate: 'desc' },
      include: {
        schoolClass: { select: { id: true, name: true } },
        _count: { select: { results: true } },
      },
    });
  }

  /**
   * Get exam details.
   */
  async getExam(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        schoolClass: { select: { id: true, name: true } },
        results: {
          include: {
            student: { select: { id: true, name: true, email: true } },
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');
    return exam;
  }

  /**
   * Upload marks for an exam (bulk).
   */
  async uploadMarks(dto: UploadMarksDto, teacherId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    const results: any[] = [];
    for (const entry of dto.marks) {
      const result = await this.prisma.result.upsert({
        where: {
          examId_studentId_subjectId: {
            examId: dto.examId,
            studentId: entry.studentId,
            subjectId: entry.subjectId,
          },
        },
        create: {
          examId: dto.examId,
          studentId: entry.studentId,
          subjectId: entry.subjectId,
          marksObtained: entry.marksObtained,
          grade: entry.grade,
          remarks: entry.remarks,
          enteredById: teacherId,
        },
        update: {
          marksObtained: entry.marksObtained,
          grade: entry.grade,
          remarks: entry.remarks,
          enteredById: teacherId,
        },
      });
      results.push(result);
    }

    return { success: true, count: results.length };
  }

  /**
   * Publish/unpublish exam results and notify students/parents.
   */
  async publishResults(examId: string, isPublished: boolean) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { results: true },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    await this.prisma.exam.update({
      where: { id: examId },
      data: { isPublished },
    });

    if (isPublished) {
      // Notify all students who have results
      const studentIds = [...new Set(exam.results.map((r) => r.studentId))];
      const studentNotifs = studentIds.map((sid) => ({
        recipientId: sid,
        type: 'RESULT_PUBLISHED',
        title: `Results Published: ${exam.name}`,
        body: `Your results for ${exam.name} are now available.`,
        data: { examId },
      }));

      if (studentNotifs.length) {
        await this.notificationService.createMany(studentNotifs);
      }

      // Notify parents
      await this.notificationService.notifyGuardians(
        studentIds,
        'RESULT_PUBLISHED',
        `Results Published: ${exam.name}`,
        `Results for ${exam.name} are now available.`,
        { examId },
      );
    }

    return { success: true, isPublished };
  }

  /**
   * Get results for a student.
   */
  async getStudentResults(studentId: string, query: QueryResultsDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { studentId };

    // Only show published results for students/parents
    where.exam = { isPublished: true };

    if (query.examId) where.examId = query.examId;

    const [data, total] = await Promise.all([
      this.prisma.result.findMany({
        where,
        skip,
        take: limit,
        orderBy: { exam: { examDate: 'desc' } },
        include: {
          exam: {
            select: {
              id: true,
              name: true,
              type: true,
              totalMarks: true,
              examDate: true,
            },
          },
          subject: { select: { id: true, name: true } },
        },
      }),
      this.prisma.result.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get results for a class (admin/teacher view).
   */
  async getClassResults(classId: string, examId?: string) {
    const where: any = { exam: { classId } };
    if (examId) where.examId = examId;

    const results = await this.prisma.result.findMany({
      where,
      orderBy: [{ exam: { examDate: 'desc' } }, { student: { name: 'asc' } }],
      include: {
        student: { select: { id: true, name: true, email: true } },
        subject: { select: { id: true, name: true } },
        exam: {
          select: { id: true, name: true, type: true, totalMarks: true },
        },
      },
    });

    return results;
  }
}
