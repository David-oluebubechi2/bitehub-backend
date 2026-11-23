import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { Role } from '../common/types';

@Injectable()
export class AdminService {
  constructor(private readonly store: MemoryStore) {}

  stats() {
    const completed = this.store.orders.filter((o) => o.status !== 'CANCELLED');
    const revenue = completed.reduce((sum, o) => sum + o.total, 0);
    const customers = this.store.users.filter((u) => u.role === 'CUSTOMER');

    const statusCounts = this.store.orders.reduce<Record<string, number>>((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const key = date.toISOString().slice(0, 10);
      const total = this.store.orders
        .filter((o) => o.createdAt.slice(0, 10) === key && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total, 0);
      return {
        date: key,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: Math.round(total * 100) / 100,
        orders: this.store.orders.filter((o) => o.createdAt.slice(0, 10) === key).length,
      };
    });

    const productCounts = this.store.orders
      .filter((o) => o.status !== 'CANCELLED')
      .flatMap((o) => o.items)
      .reduce<Record<string, { name: string; emoji: string; quantity: number; revenue: number }>>((acc, item) => {
        const current = acc[item.productId] || { name: item.name, emoji: item.emoji, quantity: 0, revenue: 0 };
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
        acc[item.productId] = current;
        return acc;
      }, {});

    return {
      revenue: Math.round(revenue * 100) / 100,
      orders: this.store.orders.length,
      customers: customers.length,
      menuItems: this.store.products.length,
      averageOrderValue: completed.length ? Math.round((revenue / completed.length) * 100) / 100 : 0,
      statusCounts,
      revenueByDay: days,
      topProducts: Object.entries(productCounts)
        .map(([id, value]) => ({ id, ...value }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5),
    };
  }

  recentActivity() {
    return {
      orders: [...this.store.orders]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
      customers: [...this.store.users]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5)
        .map(({ passwordHash, ...user }) => user),
    };
  }

  setRole(id: string, role: Role) {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN' && role === 'CUSTOMER') {
      const adminCount = this.store.users.filter((u) => u.role === 'ADMIN').length;
      if (adminCount <= 1) throw new ForbiddenException('At least one admin must remain');
    }
    user.role = role;
    this.store.persistProfiles();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  setActive(id: string, active: boolean) {
    const user = this.store.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    user.active = active;
    this.store.persistProfiles();
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
