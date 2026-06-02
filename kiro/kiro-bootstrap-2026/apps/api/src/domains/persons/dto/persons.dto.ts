import { z } from 'zod';

export const createPersonSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  pipelineStageId: z.string().uuid().optional().nullable(),
  currentGroupId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updatePersonSchema = createPersonSchema.partial();

export const advancePipelineSchema = z.object({
  personId: z.string().uuid(),
  toStageId: z.string().uuid(),
  notes: z.string().max(500).optional().nullable(),
});

export const transferPersonSchema = z.object({
  personId: z.string().uuid(),
  targetGroupId: z.string().uuid(),
  reason: z.string().max(200).optional().nullable(),
});

export const personsQuerySchema = z.object({
  search: z.string().optional(),
  pipelineStageId: z.string().uuid().optional(),
  currentGroupId: z.string().uuid().optional(),
  campusId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreatePersonDto = z.infer<typeof createPersonSchema>;
export type UpdatePersonDto = z.infer<typeof updatePersonSchema>;
export type AdvancePipelineDto = z.infer<typeof advancePipelineSchema>;
export type TransferPersonDto = z.infer<typeof transferPersonSchema>;
export type PersonsQueryDto = z.infer<typeof personsQuerySchema>;
