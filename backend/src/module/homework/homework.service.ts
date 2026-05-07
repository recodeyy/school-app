import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HomeworkStatus, UserRole } from '../../generated/prisma/client.js';
import { parsePagination } from '../../common/index.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateHomeworkDto,
  GradeHomeworkDto,
  QueryHomeworkDto,
  SubmitHomeworkDto,
  UpdateHomeworkDto,
} from './dto/index.js';

@Injectable()
export class HomeworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationCoreService,
  ) {}

  /**
   * Teacher creates homework for a class/subject.
   */
  async create(dto: CreateHomeworkDto, teacherId: string) {
    const homework = await this.prisma.homework.create({
      data: {
        title: dto.title,
        description: dto.description,
        classId: dto.classId,
        subjectId: dto.subjectId,
        createdById: teacherId,
        dueDate: new Date(dto.dueDate),
        isPublished: dto.isPublished ?? true,
      },
      include: {
        subject: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Notify students and parents
    if (homework.isPublished) {
      await this.notifyHomeworkCreated(homework);
    }

    return homework;
  }

  /**
   * Update homework (teacher only).
   */
  async update(id: string, dto: UpdateHomeworkDto, teacherId: string) {
    const existing = await this.prisma.homework.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Homework not found');
    if (existing.createdById !== teacherId) {
      throw new ForbiddenException('Only the creator can update this homework');
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.isPublished !== undefined) updateData.isPublished = dto.isPublished;

    return this.prisma.homework.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * List homework with filtering.
   */
  async list(query: QueryHomeworkDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { isPublished: true };

    if (query.classId) where.classId = query.classId;
    if (query.subjectId) where.subjectId = query.subjectId;

    const [data, total] = await Promise.all([
      this.prisma.homework.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
      }),
      this.prisma.homework.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * List homework created by a specific teacher.
   */
  async listByTeacher(teacherId: string, query: QueryHomeworkDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { createdById: teacherId };

    if (query.classId) where.classId = query.classId;
    if (query.subjectId) where.subjectId = query.subjectId;

    const [data, total] = await Promise.all([
      this.prisma.homework.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
          _count: { select: { submissions: true } },
        },
      }),
      this.prisma.homework.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get single homework with submissions.
   */
  async getById(id: string) {
    const homework = await this.prisma.homework.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        submissions: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    return homework;
  }

  /**
   * Get homework for a student (based on their class).
   */
  async getForStudent(studentId: string, query: QueryHomeworkDto) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });
    if (!student || !student.studentProfile) {
      throw new NotFoundException('Student not found');
    }

    const { page, limit, skip } = parsePagination(query);
    const where: any = {
      classId: student.studentProfile.classId,
      isPublished: true,
    };
    if (query.subjectId) where.subjectId = query.subjectId;

    const [data, total] = await Promise.all([
      this.prisma.homework.findMany({
        where,
        skip,
        take: limit,
        orderBy: { dueDate: 'desc' },
        include: {
          subject: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
          submissions: {
            where: { studentId },
            select: { id: true, status: true, submittedAt: true, grade: true },
          },
        },
      }),
      this.prisma.homework.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Student submits homework.
   */
  async submit(homeworkId: string, studentId: string, dto: SubmitHomeworkDto) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });
    if (!homework) throw new NotFoundException('Homework not found');

    const isLate = new Date() > homework.dueDate;

    const submission = await this.prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: { homeworkId, studentId },
      },
      create: {
        homeworkId,
        studentId,
        content: dto.content,
        status: isLate ? HomeworkStatus.LATE : HomeworkStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      update: {
        content: dto.content,
        status: isLate ? HomeworkStatus.LATE : HomeworkStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    return submission;
  }

  /**
   * Teacher grades a submission.
   */
  async grade(
    homeworkId: string,
    studentId: string,
    dto: GradeHomeworkDto,
    teacherId: string,
  ) {
    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });
    if (!homework) throw new NotFoundException('Homework not found');
    if (homework.createdById !== teacherId) {
      throw new ForbiddenException('Only the creator can grade this homework');
    }

    const submission = await this.prisma.homeworkSubmission.update({
      where: {
        homeworkId_studentId: { homeworkId, studentId },
      },
      data: {
        grade: dto.grade,
        feedback: dto.feedback,
        status: HomeworkStatus.GRADED,
        gradedAt: new Date(),
      },
    });

    // Notify student
    await this.notificationService.create({
      recipientId: studentId,
      type: 'HOMEWORK_GRADED',
      title: `Homework Graded: ${homework.title}`,
      body: `You received ${dto.grade}. ${dto.feedback ?? ''}`,
      data: { homeworkId },
    });

    return submission;
  }

  /**
   * Delete homework (teacher only).
   */
  async delete(id: string, teacherId: string) {
    const existing = await this.prisma.homework.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Homework not found');
    if (existing.createdById !== teacherId) {
      throw new ForbiddenException('Only the creator can delete this homework');
    }
    await this.prisma.homework.delete({ where: { id } });
    return { success: true, message: 'Homework deleted' };
  }

  /**
   * Notify students and parents about new homework.
   */
  private async notifyHomeworkCreated(homework: any) {
    // Get all students in the class
    const students = await this.prisma.user.findMany({
      where: {
        role: UserRole.STUDENT,
        studentProfile: { classId: homework.classId },
      },
      include: { studentProfile: true },
    });

    const studentNotifs = students.map((s) => ({
      recipientId: s.id,
      type: 'HOMEWORK_ASSIGNED',
      title: `New Homework: ${homework.title}`,
      body: `${homework.subject?.name ?? 'Subject'} - Due: ${homework.dueDate.toISOString().slice(0, 10)}`,
      data: { homeworkId: homework.id },
    }));

    if (studentNotifs.length) {
      await this.notificationService.createMany(studentNotifs);
    }

    // Notify guardians
    const studentIds = students.map((s) => s.id);
    await this.notificationService.notifyGuardians(
      studentIds,
      'HOMEWORK_ASSIGNED',
      `New Homework: ${homework.title}`,
      `${homework.subject?.name ?? 'Subject'} - Due: ${homework.dueDate.toISOString().slice(0, 10)}`,
      { homeworkId: homework.id },
    );
  }
}
