import { Injectable } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { PaymentIntentDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly store: MemoryStore) {}

  createIntent(dto: PaymentIntentDto) {
    const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;
    return {
      id: this.store.makeId('pay-'),
      reference,
      amount: Math.round(dto.amount * 100) / 100,
      method: dto.method,
      status: dto.method === 'CASH' ? 'PENDING' : 'SUCCEEDED',
      provider: 'mock',
      orderId: dto.orderId || null,
      createdAt: this.store.now(),
    };
  }

  verify(reference: string) {
    return {
      reference,
      status: 'SUCCEEDED',
      verifiedAt: this.store.now(),
    };
  }
}
