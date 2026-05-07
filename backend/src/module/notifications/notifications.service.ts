import { Injectable, NotFoundException } from '@nestjs/common';
import { parsePagination } from '../../common/index.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { QueryNotificationsDto } from './dto/index.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get notifications for the current user.
   */
  async getMyNotifications(userId: string, query: QueryNotificationsDto) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { recipientId: userId };

    if (query.type) where.type = query.type;
    if (query.isRead !== undefined) where.isRead = query.isRead === 'true';

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      success: true,
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get unread count.
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
    return { unreadCount: count };
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string, userId: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.recipientId !== userId)
      throw new NotFoundException('Notification not found');

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true, markedCount: result.count };
  }
}
