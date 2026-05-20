import { z } from 'zod';

export const GROUP_TYPES = ['CELL', 'MINISTRY', 'TEAM', 'DEPARTMENT', 'CAMPUS', 'SPECIAL'] as const;

/** Generate a URL-safe slug from a name */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const createGroupSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  slug: z.string().optional(), // Auto-generated from name
  code: z.string().optional(), // Código jerárquico (ej: E5.1)
  description: z.string().optional(),
  type: z.enum(GROUP_TYPES, { required_error: 'Selecciona un tipo' }),
  campusId: z.string().optional(),
  networkId: z.string().optional(),

  // Ubicación
  country: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  corregimiento: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),

  // Líderes (se asignan como miembros después de crear)
  leaderId: z.string().optional(),
  coLeaderId: z.string().optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = createGroupSchema.partial();

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
