import { z } from 'zod';

export const relationshipTypes = [
  { value: 'MENTOR_MENTEE', label: 'Mentor-Discípulo' },
  { value: 'LEADER_MEMBER', label: 'Líder-Miembro' },
  { value: 'ACCOUNTABILITY', label: 'Accountability' },
  { value: 'PASTORAL', label: 'Pastoral' },
] as const;

export const createRelationshipSchema = z.object({
  discipleId: z.string().min(1, 'Selecciona un discípulo'),
  type: z.enum(['MENTOR_MENTEE', 'LEADER_MEMBER', 'ACCOUNTABILITY', 'PASTORAL'], {
    required_error: 'Selecciona un tipo de relación',
  }),
  groupId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;

export const milestoneSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  order: z.coerce.number().int().min(1, 'El orden debe ser al menos 1'),
});

export type MilestoneInput = z.infer<typeof milestoneSchema>;

export const checkInSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().min(1, 'Las notas son requeridas'),
  rating: z.coerce.number().int().min(1).max(5),
  attendees: z.string().optional(),
  topics: z.string().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
