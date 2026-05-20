import { z } from 'zod';

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().max(500).optional(),
  type: z.enum(['CELL', 'MINISTRY', 'CAMPUS', 'DEPARTMENT', 'TEAM']).default('CELL'),
  parentId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  ministryId: z.string().uuid().optional(),
});

export const UpdateGroupSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones').optional(),
  description: z.string().max(500).optional(),
  type: z.enum(['CELL', 'MINISTRY', 'CAMPUS', 'DEPARTMENT', 'TEAM', 'SPECIAL']).optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
  campusId: z.string().uuid().optional().nullable(),
  ministryId: z.string().uuid().optional().nullable(),
  location: z.object({
    province: z.string().optional(),
    district: z.string().optional(),
    corregimiento: z.string().optional(),
  }).optional(),
});

export const GroupsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['CELL', 'MINISTRY', 'CAMPUS', 'DEPARTMENT', 'TEAM']).optional(),
  campusId: z.string().uuid().optional(),
  ministryId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'createdAt', 'type']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const AddMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['LEADER', 'CO_LEADER', 'MEMBER', 'GUEST']).default('MEMBER'),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['LEADER', 'CO_LEADER', 'MEMBER', 'GUEST']),
});

export const GroupMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(['LEADER', 'CO_LEADER', 'MEMBER', 'GUEST']).optional(),
  search: z.string().optional(),
});

export type CreateGroupDto = z.infer<typeof CreateGroupSchema>;
export type UpdateGroupDto = z.infer<typeof UpdateGroupSchema>;
export type GroupsQueryDto = z.infer<typeof GroupsQuerySchema>;
export type AddMemberDto = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;
export type GroupMembersQueryDto = z.infer<typeof GroupMembersQuerySchema>;
