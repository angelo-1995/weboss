import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed the configurable pipeline stages for J-PDVE Conexiones.
 * These are the default stages for the ministry.
 * Each church (campus) can have its own set of stages.
 */
export async function seedPipelineStages() {
  console.log('\n🔄 Seeding Pipeline Stages...');

  // Find the default campus
  const campus = await prisma.campus.findFirst({
    where: { slug: 'sede-central' },
  });

  if (!campus) {
    console.log('⚠️  No campus found. Skipping pipeline stages seed.');
    return;
  }

  const stages = [
    { code: 'VISITANTE', name: 'Visitante', orderIndex: 1, color: '#9CA3AF', description: 'Persona nueva que visita por primera vez' },
    { code: 'CONSOLIDADO', name: 'Consolidado', orderIndex: 2, color: '#60A5FA', description: 'Persona que ha sido consolidada en la fe' },
    { code: 'ACADEMIA_N1', name: 'Academia Nivel 1', orderIndex: 3, color: '#34D399', description: 'Estudiante de Academia nivel básico' },
    { code: 'ACADEMIA_N2', name: 'Academia Nivel 2', orderIndex: 4, color: '#10B981', description: 'Estudiante de Academia nivel intermedio' },
    { code: 'ACADEMIA_N3', name: 'Academia Nivel 3', orderIndex: 5, color: '#059669', description: 'Estudiante de Academia nivel avanzado' },
    { code: 'SERVIDOR', name: 'Servidor', orderIndex: 6, color: '#FBBF24', description: 'Persona sirviendo activamente en el ministerio' },
    { code: 'LIDER_POTENCIAL', name: 'Líder Potencial', orderIndex: 7, color: '#F97316', description: 'Candidato a liderar una célula' },
    { code: 'LIDER', name: 'Líder', orderIndex: 8, color: '#EF4444', description: 'Líder activo de célula o equipo ministerial' },
    { code: 'COBERTURA', name: 'Cobertura', orderIndex: 9, color: '#8B5CF6', description: 'Líder que supervisa a otros líderes' },
  ];

  for (const stage of stages) {
    await prisma.pipelineStageConfig.upsert({
      where: {
        campusId_code: { campusId: campus.id, code: stage.code },
      },
      update: {
        name: stage.name,
        orderIndex: stage.orderIndex,
        color: stage.color,
        description: stage.description,
      },
      create: {
        campusId: campus.id,
        code: stage.code,
        name: stage.name,
        orderIndex: stage.orderIndex,
        color: stage.color,
        description: stage.description,
      },
    });
  }

  console.log(`✓ Pipeline Stages: ${stages.length} stages created for "${campus.name}"`);
}
