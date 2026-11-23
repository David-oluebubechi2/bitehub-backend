import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MemoryStore } from '../common/store';
import { hashPassword, verifyPassword } from '../common/crypto.util';
import { toPublicUser } from '../common/mappers';
import { AuthTokens, User } from '../common/types';
import { LoginDto, RegisterDto, UpdateProfileDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly store: MemoryStore,
    private readonly jwt: JwtService,
  ) {}

  private normalizeUsername(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9_.-]+/g, '').slice(0, 30);
  }

  private issue(user: User): AuthTokens {
    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        role: user.role,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
      }),
      user: toPublicUser(user),
    };
  }

  register(dto: RegisterDto): AuthTokens {
    const email = dto.email.trim().toLowerCase();
    if (this.store.users.some((u) => u.email === email)) {
      throw new ConflictException('An account with this email already exists');
    }

    const base = this.normalizeUsername(dto.username || email.split('@')[0]) || 'user';
    let username = base;
    if (this.store.users.some((u) => u.username === username)) {
      if (dto.username) throw new ConflictException('That username is already taken');
      let suffix = 2;
      while (this.store.users.some((u) => u.username === `${base}${suffix}`)) suffix += 1;
      username = `${base}${suffix}`;
    }

    const user: User = {
      id: this.store.makeId('user-'),
      email,
      username,
      passwordHash: hashPassword(dto.password),
      name: dto.name.trim(),
      phone: dto.phone || '',
      avatar: dto.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase(),
      role: 'CUSTOMER',
      active: true,
      createdAt: this.store.now(),
    };
    this.store.users.push(user);
    this.store.notifications.unshift({
      id: this.store.makeId('ntf-'),
      userId: user.id,
      title: 'Welcome to BiteHub',
      body: 'Your account is ready. Use WELCOME10 for 10% off your first order.',
      type: 'ACCOUNT',
      read: false,
      createdAt: this.store.now(),
    });
    this.store.persistProfiles();
    return this.issue(user);
  }

  login(dto: LoginDto): AuthTokens {
    const identifier = (dto.email || dto.username || '').trim().toLowerCase();
    if (!identifier) throw new UnauthorizedException('Enter your email or username');
    const user = this.store.users.find((u) => u.email === identifier || u.username === identifier);
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email, username, or password');
    }
    if (!user.active) throw new UnauthorizedException('This account has been deactivated');
    return this.issue(user);
  }

  me(user: User): AuthTokens['user'] {
    return toPublicUser(user);
  }

  updateProfile(user: User, dto: UpdateProfileDto): AuthTokens['user'] {
    if (!this.store.users.some((candidate) => candidate.id === user.id)) this.store.users.push(user);
    if (dto.username !== undefined) {
      const username = this.normalizeUsername(dto.username);
      if (!username) throw new BadRequestException('Username is required');
      if (this.store.users.some((candidate) => candidate.id !== user.id && candidate.username === username)) {
        throw new ConflictException('That username is already taken');
      }
      user.username = username;
    }
    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (!email) throw new BadRequestException('Email is required');
      if (this.store.users.some((candidate) => candidate.id !== user.id && candidate.email === email)) {
        throw new ConflictException('An account with this email already exists');
      }
      user.email = email;
    }
    if (dto.name !== undefined) {
      user.name = dto.name.trim();
      user.avatar = user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    }
    if (dto.phone !== undefined) user.phone = dto.phone;
    this.store.persistProfiles();
    return toPublicUser(user);
  }
}
