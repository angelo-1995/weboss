import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infrastructure/database/database.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find notifications for a user with cursor-based pagination (newest first).
   */
  async findByUser(userId: string, options: { cursor?: string; limit?: number }) {
    const { cursor, limit = 20 } = options;

    const items = await this.db.notification.findMany({
      where: { userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        isRead: true,
        sermonId: true,
        createdAt: true,
      },
    });

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    return { items: data, nextCursor };
  }

  /**
   * Find a notification by ID.
   */
  async findById(id: string) {
    return this.db.notification.findUnique({ where: { id } });
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string) {
    return this.db.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  /**
   * Count unread notifications for a user.
   */
  async countUnread(userId: string): Promise<number> {
    return this.db.notification.count({
      where: { userId, isRead: false },
    });
  }
}
