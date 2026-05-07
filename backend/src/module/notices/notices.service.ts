import { Injectable, NotFoundException } from '@nestjs/common';
import { parsePagination } from '../../common/index.js';
import { NotificationCoreService } from '../../core/notifications/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  CreateNoticeDto,
  QueryNoticeDto,
  UpdateNoticeDto,
} from './dto/index.js';

@Injectable()
export class NoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationCoreService,
  ) {}

  /**
   * Create a notice.
   */
  async create(dto: CreateNoticeDto, createdById: string) {
    const notice = await this.prisma.notice.create({
      data: {
        title: dto.title,
        content: dto.content,
        targetRoles: dto.targetRoles,
        classId: dto.classId,
        createdById,
        isPinned: dto.isPinned ?? false,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
      },
    });

    // Notify target users
    await this.notifyNotice(notice);

    return notice;
  }

  /**
   * Update a notice.
   */
  async update(id: string, dto: UpdateNoticeDto) {
    const existing = await this.prisma.notice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notice not found');

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.targetRoles !== undefined) updateData.targetRoles = dto.targetRoles;
    if (dto.isPinned !== undefined) updateData.isPinned = dto.isPinned;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;
    if (dto.expiresAt !== undefined)
      updateData.expiresAt = new Date(dto.expiresAt);

    return this.prisma.notice.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Delete a notice.
   */
  async delete(id: string) {
    const existing = await this.prisma.notice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Notice not found');
    await this.prisma.notice.delete({ where: { id } });
    return { success: true, message: 'Notice deleted' };
  }

  /**
   * List notices (filtered by user role).
   */
  async list(userRole: string, query: QueryNoticeDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {
      isActive: true,
      targetRoles: { has: userRole },
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    };

    const [data, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdBy: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
        },
      }),
      this.prisma.notice.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * List all notices (admin view).
   */
  async listAll(query: QueryNoticeDto) {
    const { page, limit, skip } = parsePagination(query);

    const [data, total] = await Promise.all([
      this.prisma.notice.findMany({
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          createdBy: { select: { id: true, name: true } },
          schoolClass: { select: { id: true, name: true } },
        },
      }),
      this.prisma.notice.count(),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single notice.
   */
  async getById(id: string) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
        schoolClass: { select: { id: true, name: true } },
      },
    });
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  /**
   * Notify target users about a new notice.
   */
  private async notifyNotice(notice: any) {
    const targetRoles = notice.targetRoles || [];
    if (targetRoles.length === 0) return;

    const where: any = { role: { in: targetRoles }, isActive: true };
    if (notice.classId) {
      // Only notify students in that class
      where.OR = [
        { studentProfile: { classId: notice.classId } },
        { role: { notIn: ['STUDENT'] } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where: { role: { in: targetRoles }, isActive: true },
      select: { id: true },
    });

    if (users.length > 0) {
      const payloads = users.map((u) => ({
        recipientId: u.id,
        type: 'NOTICE',
        title: `Notice: ${notice.title}`,
        body: notice.content.substring(0, 200),
        data: { noticeId: notice.id },
      }));
      await this.notificationService.createMany(payloads);
    }
  }
}
