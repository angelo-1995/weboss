import { z } from 'zod';
import { CreateSermonSchema } from './create-sermon.dto';

export const UpdateSermonSchema = CreateSermonSchema.partial();

export type UpdateSermonDto = z.infer<typeof UpdateSermonSchema>;
