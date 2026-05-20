import type { BaseEntity, Status, UUID } from './common.types';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'LEADER' | 'MEMBER' | 'GUEST';

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  status: Status;
  roles: UserRole[];
  campusId?: UUID;
}

export interface UserProfile extends User {
  bio?: string;
  birthDate?: string;
  address?: string;
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  whatsapp?: string;
}
