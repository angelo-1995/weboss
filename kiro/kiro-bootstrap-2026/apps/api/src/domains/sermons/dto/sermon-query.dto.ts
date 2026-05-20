import { z } from 'zod';

export const SermonQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().max(100).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'PUBLISHED']).optional(),
});

export type SermonQueryDto = z.infer<typeof SermonQuerySchema>;
