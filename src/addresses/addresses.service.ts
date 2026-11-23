import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { MemoryStore } from '../common/store';
import { Address, User } from '../common/types';
import { CreateAddressDto, UpdateAddressDto } from './dto';

@Injectable()
export class AddressesService {
  constructor(private readonly store: MemoryStore) {}

  findAll(user: User) {
    return this.store.addresses.filter((a) => a.userId === user.id);
  }

  private owned(user: User, id: string): Address {
    const address = this.store.addresses.find((a) => a.id === id);
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== user.id) throw new ForbiddenException('Not your address');
    return address;
  }

  create(user: User, dto: CreateAddressDto) {
    if (dto.isDefault) {
      this.store.addresses.filter((a) => a.userId === user.id).forEach((a) => (a.isDefault = false));
    }
    const address: Address = {
      id: this.store.makeId('addr-'),
      userId: user.id,
      label: dto.label,
      line1: dto.line1,
      line2: dto.line2 || '',
      city: dto.city,
      postalCode: dto.postalCode || '',
      country: dto.country || 'USA',
      phone: dto.phone || user.phone,
      isDefault: dto.isDefault ?? this.findAll(user).length === 0,
      createdAt: this.store.now(),
    };
    this.store.addresses.push(address);
    return address;
  }

  update(user: User, id: string, dto: UpdateAddressDto) {
    const address = this.owned(user, id);
    if (dto.isDefault) {
      this.store.addresses.filter((a) => a.userId === user.id).forEach((a) => (a.isDefault = false));
    }
    Object.assign(address, dto);
    return address;
  }

  setDefault(user: User, id: string) {
    const address = this.owned(user, id);
    this.store.addresses.filter((a) => a.userId === user.id).forEach((a) => (a.isDefault = false));
    address.isDefault = true;
    return address;
  }

  delete(user: User, id: string) {
    const address = this.owned(user, id);
    this.store.addresses.splice(this.store.addresses.indexOf(address), 1);
    return { success: true };
  }
}
