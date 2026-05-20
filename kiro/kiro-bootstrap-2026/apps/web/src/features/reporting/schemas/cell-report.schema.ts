import { z } from 'zod';

export const createCellReportSchema = z.object({
  groupId: z.string().min(1, 'Selecciona un grupo'),
  cellCode: z.string().min(1, 'El código de célula es requerido'),
  meetingDate: z.string().min(1, 'La fecha de reunión es requerida'),
  coverageName: z.string().min(1, 'El nombre de cobertura es requerido'),
  leaderName: z.string().min(1, 'El nombre del líder es requerido'),
  coLeaderName: z.string().optional(),
  contactPhone: z.string().optional(),

  // Asistencia
  menCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  womenCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  youthMaleCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  youthFemaleCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  childrenCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),

  // Métricas
  visitorsCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  convertsCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),
  reconciledCount: z.coerce.number().int().min(0, 'Debe ser 0 o más').default(0),

  // Reunión
  messageTopic: z.string().optional(),
  startTime: z.string().min(1, 'La hora de inicio es requerida'),
  endTime: z.string().min(1, 'La hora de fin es requerida'),
  offeringAmount: z.coerce.number().min(0, 'Debe ser 0 o más').optional(),

  // Ubicación
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  sector: z.string().optional(),
  street: z.string().optional(),
  houseNumber: z.string().optional(),

  // Supervisión
  wasSupervised: z.boolean().default(false),
  observations: z.string().optional(),
});

export type CreateCellReportInput = z.infer<typeof createCellReportSchema>;

/** Compute total attendance from form values */
export function computeTotalAttendance(values: Partial<CreateCellReportInput>): number {
  return (
    (values.menCount ?? 0) +
    (values.womenCount ?? 0) +
    (values.youthMaleCount ?? 0) +
    (values.youthFemaleCount ?? 0) +
    (values.childrenCount ?? 0)
  );
}
