import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).default(['MEMBER']),
  spiritualStage: z.enum(['GANADO', 'CONSOLIDADO', 'DISCIPULADO', 'ENVIADO', '']).optional().transform(v => v || undefined),
  leaderId: z.string().optional(),
  networkId: z.string().optional(),
  sendInvitation: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema.partial();

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
