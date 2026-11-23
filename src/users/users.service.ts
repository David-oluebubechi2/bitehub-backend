import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { toPublicUser } from '../common/mappers';

@Injectable()
export class UsersService {
  constructor(private readonly store: MemoryStore) {}

  findAll() {
    return this.store.users.map(toPublicUser);
  }

  findOne(id: string) {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return toPublicUser(user);
  }

  remove(id: string) {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new BadRequestException('Admin accounts cannot be deleted');

    this.store.users.splice(this.store.users.indexOf(user), 1);
    this.store.addresses = this.store.addresses.filter((address) => address.userId !== id);
    this.store.orders = this.store.orders.filter((order) => order.userId !== id);
    this.store.notifications = this.store.notifications.filter((notification) => notification.userId !== id);
    return { success: true };
  }
}
