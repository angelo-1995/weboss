import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly repo: NotificationsRepository) {}

  /**
   * List notifications for the authenticated user (cursor-based, newest first).
   */
  async findByUser(userId: string, options: { cursor?: string; limit?: number }) {
    return this.repo.findByUser(userId, options);
  }

  /**
   * Mark a notification as read. Validates ownership.
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.repo.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only mark your own notifications as read');
    }

    return this.repo.markAsRead(notificationId);
  }

  /**
   * Get unread notification count for the authenticated user.
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repo.countUnread(userId);
    return { count };
  }
}
