import { z } from 'zod';

export const CreateRelationshipSchema = z.object({
  discipleId: z.string().uuid(),
  type: z.enum(['MENTOR_MENTEE', 'LEADER_MEMBER', 'ACCOUNTABILITY', 'PASTORAL']).default('MENTOR_MENTEE'),
  groupId: z.string().uuid().optional(),
  notes: z.string().max(1000).optional(),
  startDate: z.string().datetime().optional(),
});

export const UpdateRelationshipSchema = z.object({
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  notes: z.string().max(1000).optional(),
  endDate: z.string().datetime().optional().nullable(),
});

export const RelationshipsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  mentorId: z.string().uuid().optional(),
  discipleId: z.string().uuid().optional(),
  type: z.enum(['MENTOR_MENTEE', 'LEADER_MEMBER', 'ACCOUNTABILITY', 'PASTORAL']).optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
  groupId: z.string().uuid().optional(),
});

export const CreateMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).default(0),
});

export const CompleteMilestoneSchema = z.object({
  completedAt: z.string().datetime().optional(),
});

export const CreateCheckInSchema = z.object({
  notes: z.string().max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  scheduledAt: z.string().datetime(),
  attendedBy: z.array(z.string().uuid()).optional(),
});

export const CompleteCheckInSchema = z.object({
  notes: z.string().max(2000).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  completedAt: z.string().datetime().optional(),
});

export type CreateRelationshipDto = z.infer<typeof CreateRelationshipSchema>;
export type UpdateRelationshipDto = z.infer<typeof UpdateRelationshipSchema>;
export type RelationshipsQueryDto = z.infer<typeof RelationshipsQuerySchema>;
export type CreateMilestoneDto = z.infer<typeof CreateMilestoneSchema>;
export type CreateCheckInDto = z.infer<typeof CreateCheckInSchema>;
export type CompleteCheckInDto = z.infer<typeof CompleteCheckInSchema>;
