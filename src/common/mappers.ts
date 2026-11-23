import { PublicUser, User } from './types';

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest as PublicUser;
}
