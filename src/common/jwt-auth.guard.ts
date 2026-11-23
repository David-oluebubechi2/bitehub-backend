import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from './public.decorator';
import { MemoryStore } from './store';
import { Role, User } from './types';

interface SessionPayload {
  sub?: string;
  role?: Role;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
  phone?: string;
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly store: MemoryStore,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined>; user?: User }>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');
    try {
      const payload = this.jwt.verify(token) as SessionPayload;
      const user = this.store.users.find((candidate) => candidate.id === payload.sub);
      if (user?.active) {
        request.user = user;
        return true;
      }
      if (user || !payload.sub) throw new UnauthorizedException('Account not found or inactive');
      request.user = {
        id: payload.sub,
        email: payload.email || `${payload.sub}@users.bitehub.local`,
        username: payload.username || payload.sub,
        passwordHash: '',
        name: payload.name || 'BiteHub customer',
        phone: payload.phone || '',
        avatar: payload.avatar || 'BH',
        role: payload.role || 'CUSTOMER',
        active: true,
        createdAt: new Date().toISOString(),
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
