import { Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../common/types';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.notifications.findAll(user);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() user: User) {
    return { count: this.notifications.unreadCount(user) };
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: User) {
    return this.notifications.markAllRead(user);
  }

  @Patch(':id/read')
  markRead(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notifications.markRead(user, id);
  }
}
