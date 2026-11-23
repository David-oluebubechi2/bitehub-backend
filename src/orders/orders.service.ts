import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemoryStore } from '../common/store';
import {
  Address,
  Order,
  OrderItem,
  OrderStatus,
  User,
} from '../common/types';
import { CouponsService } from '../coupons/coupons.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly store: MemoryStore,
    private readonly coupons: CouponsService,
    private readonly notifications: NotificationsService,
  ) {}

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }

  private owned(user: User, id: string): Order {
    const order = this.store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new NotFoundException('Order not found');
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('Not your order');
    }
    return order;
  }

  create(user: User, dto: CreateOrderDto): Order {
    if (!dto.items?.length) throw new BadRequestException('Your cart is empty');

    const lines: { item: OrderItem; lineTotal: number }[] = dto.items.map((input) => {
      const product = this.store.products.find((p) => p.id === input.productId);
      if (!product) throw new BadRequestException(`Product ${input.productId} no longer exists`);
      if (!product.available) throw new BadRequestException(`${product.name} is currently unavailable`);

      const selectedAddOns = (input.addOnIds || [])
        .map((id) => product.addOns.find((a) => a.id === id))
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
        .map((a) => ({ name: a.name, price: a.price }));

      const item: OrderItem = {
        productId: product.id,
        name: product.name,
        emoji: product.emoji,
        price: product.price,
        quantity: input.quantity,
        addOns: selectedAddOns,
        notes: input.notes || '',
      };
      const unit = product.price + selectedAddOns.reduce((sum, a) => sum + a.price, 0);
      return { item, lineTotal: unit * input.quantity };
    });

    const subtotal = this.round(lines.reduce((sum, l) => sum + l.lineTotal, 0));
    const coupon = dto.couponCode
      ? this.coupons.validate(dto.couponCode, subtotal)
      : { valid: false, discount: 0, freeShipping: false, code: '', message: '' };
    if (dto.couponCode && !coupon.valid) throw new BadRequestException(coupon.message);

    let address: Address | null = null;
    if (dto.fulfillment === 'DELIVERY') {
      if (dto.addressId) {
        const found = this.store.addresses.find((a) => a.id === dto.addressId && a.userId === user.id);
        if (!found) throw new BadRequestException('Address not found');
        address = found;
      } else if (dto.address) {
        address = {
          id: this.store.makeId('addr-'),
          userId: user.id,
          label: dto.address.label,
          line1: dto.address.line1,
          line2: dto.address.line2 || '',
          city: dto.address.city,
          postalCode: dto.address.postalCode || '',
          country: 'USA',
          phone: dto.address.phone || user.phone,
          isDefault: false,
          createdAt: this.store.now(),
        };
        this.store.addresses.push(address);
      } else {
        address = this.store.addresses.find((a) => a.userId === user.id && a.isDefault) || null;
      }
      if (!address) throw new BadRequestException('Please provide a delivery address');
    }

    const freeShipping = coupon.freeShipping || subtotal >= this.store.restaurant.freeDeliveryOver;
    const deliveryFee =
      dto.fulfillment === 'DELIVERY' && !freeShipping ? this.store.restaurant.deliveryFee : 0;
    const total = this.round(Math.max(0, subtotal - coupon.discount) + deliveryFee);
    const timestamp = this.store.now();
    const initialStatus: OrderStatus = dto.paymentMethod === 'CASH' ? 'PENDING' : 'CONFIRMED';

    const order: Order = {
      id: this.store.makeId('ord-'),
      orderNumber: `BH-${this.store.nextOrderNumber++}`,
      userId: user.id,
      items: lines.map((l) => l.item),
      subtotal,
      deliveryFee: this.round(deliveryFee),
      discount: this.round(coupon.discount),
      total,
      status: initialStatus,
      fulfillment: dto.fulfillment as Order['fulfillment'],
      address,
      paymentMethod: dto.paymentMethod as Order['paymentMethod'],
      paymentStatus: dto.paymentMethod === 'CASH' ? 'PENDING' : 'PAID',
      couponCode: coupon.valid ? coupon.code : null,
      notes: dto.notes || '',
      timeline: [
        { status: 'PENDING', at: timestamp, note: 'Order placed' },
        ...(initialStatus === 'CONFIRMED'
          ? [{ status: 'CONFIRMED' as OrderStatus, at: timestamp, note: 'Payment confirmed' }]
          : []),
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.orders.unshift(order);
    if (coupon.valid) {
      const applied = this.store.coupons.find((c) => c.code === coupon.code);
      if (applied) applied.usageCount += 1;
      this.store.persistCoupons();
    }
    this.notifications.push(user.id, 'Order placed', `Your order ${order.orderNumber} has been received.`, 'ORDER');
    this.store.users
      .filter((u) => u.role === 'ADMIN')
      .forEach((admin) =>
        this.notifications.push(admin.id, 'New order placed', `Order ${order.orderNumber} needs attention.`, 'ORDER'),
      );

    return order;
  }

  findAll(user: User): Order[] {
    const orders = user.role === 'ADMIN'
      ? this.store.orders
      : this.store.orders.filter((o) => o.userId === user.id);
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findOne(user: User, id: string): Order {
    return this.owned(user, id);
  }

  cancel(user: User, id: string): Order {
    const order = this.owned(user, id);
    if (!['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)) {
      throw new BadRequestException('This order can no longer be cancelled');
    }
    order.status = 'CANCELLED';
    order.updatedAt = this.store.now();
    order.timeline.push({ status: 'CANCELLED', at: order.updatedAt, note: 'Order cancelled' });
    this.notifications.push(user.id, 'Order cancelled', `Order ${order.orderNumber} was cancelled.`, 'ORDER');
    return order;
  }

  reorder(user: User, id: string): Order {
    const previous = this.owned(user, id);
    return this.create(user, {
      items: previous.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        addOnIds: item.addOns
          .map((a) => this.store.products.find((p) => p.id === item.productId)?.addOns.find((x) => x.name === a.name)?.id)
          .filter((x): x is string => Boolean(x)),
        notes: item.notes,
      })),
      fulfillment: previous.fulfillment,
      addressId: previous.address?.id,
      paymentMethod: previous.paymentMethod,
      notes: previous.notes,
    });
  }

  updateStatus(id: string, dto: UpdateOrderStatusDto): Order {
    const order = this.store.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new NotFoundException('Order not found');
    order.status = dto.status as OrderStatus;
    order.updatedAt = this.store.now();
    order.timeline.push({
      status: order.status,
      at: order.updatedAt,
      note: dto.note || `Status updated to ${order.status.toLowerCase().replace('_', ' ')}`,
    });
    if (order.status === 'DELIVERED') {
      order.paymentStatus = order.paymentMethod === 'CASH' ? 'PAID' : order.paymentStatus;
    }
    this.notifications.push(
      order.userId,
      'Order status updated',
      `Order ${order.orderNumber} is now ${order.status.toLowerCase().replace('_', ' ')}.`,
      'ORDER',
    );
    return order;
  }
}
