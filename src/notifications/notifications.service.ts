import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { Notification, User } from '../common/types';

@Injectable()
export class NotificationsService {
  constructor(private readonly store: MemoryStore) {}

  findAll(user: User): Notification[] {
    return this.store.notifications
      .filter((n) => n.userId === user.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  unreadCount(user: User) {
    return this.findAll(user).filter((n) => !n.read).length;
  }

  markRead(user: User, id: string) {
    const notification = this.store.notifications.find((n) => n.id === id);
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== user.id) throw new ForbiddenException('Not your notification');
    notification.read = true;
    return notification;
  }

  markAllRead(user: User) {
    this.findAll(user).forEach((n) => (n.read = true));
    return { success: true };
  }

  push(userId: string, title: string, body: string, type: Notification['type'] = 'ORDER') {
    this.store.notifications.unshift({
      id: this.store.makeId('ntf-'),
      userId,
      title,
      body,
      type,
      read: false,
      createdAt: this.store.now(),
    });
  }
}
