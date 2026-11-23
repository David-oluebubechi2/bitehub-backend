import { Injectable } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { SupportSettings } from '../common/types';
import { UpdateSupportDto } from './dto';

@Injectable()
export class SupportService {
  constructor(private readonly store: MemoryStore) {}

  get(): SupportSettings {
    return this.store.supportSettings;
  }

  update(dto: UpdateSupportDto): SupportSettings {
    const settings = this.store.supportSettings;
    if (dto.email !== undefined) settings.email = dto.email.trim();
    if (dto.phone !== undefined) settings.phone = dto.phone.trim();
    if (dto.whatsapp !== undefined) settings.whatsapp = dto.whatsapp.trim();
    if (dto.hours !== undefined) settings.hours = dto.hours.trim();
    if (dto.address !== undefined) settings.address = dto.address.trim();
    if (dto.responseTime !== undefined) settings.responseTime = dto.responseTime.trim();
    if (dto.faqs !== undefined) {
      settings.faqs = dto.faqs.map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() }));
    }
    this.store.persistSupport();
    return settings;
  }
}
