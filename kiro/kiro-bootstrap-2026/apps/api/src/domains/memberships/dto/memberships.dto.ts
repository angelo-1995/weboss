import { z } from 'zod';

export const CreateMembershipSchema = z.object({
  userId: z.string().uuid(),
  groupId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).default('ACTIVE'),
  startDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const UpdateMembershipSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  endDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export const MembershipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateMembershipDto = z.infer<typeof CreateMembershipSchema>;
export type UpdateMembershipDto = z.infer<typeof UpdateMembershipSchema>;
export type MembershipsQueryDto = z.infer<typeof MembershipsQuerySchema>;
