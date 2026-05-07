import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../module/prisma/prisma.service.js';

export interface CreateNotificationPayload {
  recipientId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationCoreService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a single notification for a recipient.
   */
  async create(payload: CreateNotificationPayload) {
    return this.prisma.notification.create({
      data: {
        recipientId: payload.recipientId,
        type: payload.type,
        title: payload.title,
        body: payload.body ?? null,
        data: payload.data ?? undefined,
      },
    });
  }

  /**
   * Create notifications for multiple recipients at once.
   */
  async createMany(payloads: CreateNotificationPayload[]) {
    if (!payloads.length) return;
    return this.prisma.notification.createMany({
      data: payloads.map((p) => ({
        recipientId: p.recipientId,
        type: p.type,
        title: p.title,
        body: p.body ?? null,
        data: p.data ?? undefined,
      })),
    });
  }

  /**
   * Notify all guardians of a list of student IDs.
   */
  async notifyGuardians(
    studentIds: string[],
    type: string,
    title: string,
    body?: string,
    data?: Record<string, any>,
  ) {
    if (!studentIds.length) return;
    const students = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
      include: { studentProfile: true },
    });

    const guardianPayloads: CreateNotificationPayload[] = [];
    for (const student of students) {
      const guardianId = (student as any).studentProfile?.guardianId;
      if (guardianId) {
        guardianPayloads.push({
          recipientId: guardianId,
          type,
          title,
          body,
          data: { ...data, studentId: student.id, studentName: student.name },
        });
      }
    }
    if (guardianPayloads.length) {
      await this.createMany(guardianPayloads);
    }
  }
}
