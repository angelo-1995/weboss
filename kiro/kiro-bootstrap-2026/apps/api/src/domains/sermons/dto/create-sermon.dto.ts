import { z } from 'zod';

export const CreateSermonSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  sermonDate: z.string().datetime(),
  videoUrl: z.string().url().optional(),
  externalLink: z.string().url().optional(),
  publishAt: z.string().datetime().optional(),
});

export type CreateSermonDto = z.infer<typeof CreateSermonSchema>;
