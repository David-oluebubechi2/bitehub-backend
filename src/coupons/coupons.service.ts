import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { Coupon } from '../common/types';
import { CreateCouponDto, UpdateCouponDto } from './dto';

export interface CouponResult {
  valid: boolean;
  message: string;
  code: string;
  discount: number;
  freeShipping: boolean;
}

@Injectable()
export class CouponsService {
  constructor(private readonly store: MemoryStore) {}

  findAll(): Coupon[] {
    return [...this.store.coupons].reverse();
  }

  findActive(): Coupon[] {
    const now = new Date();
    return this.store.coupons.filter(
      (coupon) => coupon.active && (!coupon.expiresAt || new Date(coupon.expiresAt) >= now),
    );
  }

  validate(code: string, subtotal: number): CouponResult {
    const normalized = code.trim().toUpperCase();
    const coupon = this.store.coupons.find((c) => c.code === normalized);

    if (!coupon || !coupon.active) {
      return { valid: false, message: 'This coupon code is invalid or inactive', code: normalized, discount: 0, freeShipping: false };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: 'This coupon code has expired', code: normalized, discount: 0, freeShipping: false };
    }
    if (subtotal < coupon.minOrder) {
      return {
        valid: false,
        message: `Add ₦${(coupon.minOrder - subtotal).toFixed(2)} more to use ${normalized}`,
        code: normalized,
        discount: 0,
        freeShipping: false,
      };
    }

    let discount = 0;
    let freeShipping = false;
    if (coupon.type === 'PERCENT') discount = Math.round(subtotal * coupon.value) / 100;
    if (coupon.type === 'FIXED') discount = Math.min(coupon.value, subtotal);
    if (coupon.type === 'FREE_SHIPPING') freeShipping = true;

    return {
      valid: true,
      message: coupon.type === 'FREE_SHIPPING' ? 'Free delivery applied' : `₦${discount.toFixed(2)} discount applied`,
      code: normalized,
      discount: Math.round(discount * 100) / 100,
      freeShipping,
    };
  }

  create(dto: CreateCouponDto): Coupon {
    const code = dto.code.trim().toUpperCase();
    if (this.store.coupons.some((c) => c.code === code)) {
      throw new ConflictException('A coupon with this code already exists');
    }
    const coupon: Coupon = {
      id: this.store.makeId('cpn-'),
      code,
      type: dto.type,
      value: dto.value,
      minOrder: dto.minOrder ?? 0,
      active: dto.active ?? true,
      expiresAt: dto.expiresAt ?? null,
      usageCount: 0,
      createdAt: this.store.now(),
    };
    this.store.coupons.push(coupon);
    this.store.persistCoupons();
    return coupon;
  }

  update(id: string, dto: UpdateCouponDto): Coupon {
    const coupon = this.store.coupons.find((c) => c.id === id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    Object.assign(coupon, {
      ...(dto.code !== undefined && { code: dto.code.trim().toUpperCase() }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.value !== undefined && { value: dto.value }),
      ...(dto.minOrder !== undefined && { minOrder: dto.minOrder }),
      ...(dto.active !== undefined && { active: dto.active }),
      ...(dto.expiresAt !== undefined && { expiresAt: dto.expiresAt }),
    });
    this.store.persistCoupons();
    return coupon;
  }

  delete(id: string) {
    const coupon = this.store.coupons.find((c) => c.id === id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    this.store.coupons.splice(this.store.coupons.indexOf(coupon), 1);
    this.store.persistCoupons();
    return { success: true };
  }
}
