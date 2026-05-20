import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: z.string().optional(),
  campusId: z.string().uuid().optional(),
  roles: z.array(z.enum(['SUPER_ADMIN', 'ADMIN', 'LEADER', 'MEMBER', 'GUEST'])).optional(),
  spiritualStage: z.enum(['GANADO', 'CONSOLIDADO', 'DISCIPULADO', 'ENVIADO']).optional(),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  displayName: z.string().max(100).optional(),
  phoneNumber: z.string().optional(),
  campusId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  roles: z.array(z.enum(['SUPER_ADMIN', 'ADMIN', 'LEADER', 'MEMBER', 'GUEST'])).optional(),
  leaderCode: z.string().optional().nullable(),
  leaderId: z.string().uuid().optional().nullable(),
  ministerialRole: z.enum(['PASTOR_GENERAL', 'PASTOR_RED', 'COBERTURA', 'LIDER', 'ESTACA', 'MIEMBRO']).optional().nullable(),
  networkId: z.string().uuid().optional().nullable(),
});

export const UpdateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  birthDate: z.string().datetime().optional().nullable(),
  address: z.string().max(300).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  linkedin: z.string().max(100).optional(),
  whatsapp: z.string().max(20).optional(),
});

export const UsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  campusId: z.string().uuid().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'LEADER', 'MEMBER', 'GUEST']).optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
export type UsersQueryDto = z.infer<typeof UsersQuerySchema>;
