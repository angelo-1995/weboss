import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding remote Neon DB (J-PDVE essential data only)...');

  const password = await argon2.hash('ChangeMe123!', {
    type: 2, // argon2id
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 1. Campus
  const campus = await prisma.campus.upsert({
    where: { slug: 'sede-central' },
    update: { name: 'Ministerio Palabras de Vida Eterna', timezone: 'America/Panama', churchCode: 'JPDVE' },
    create: { name: 'Ministerio Palabras de Vida Eterna', slug: 'sede-central', timezone: 'America/Panama', churchCode: 'JPDVE', address: 'Panamá' },
  });
  console.log('✓ Campus');

  // 2. Networks
  const nets = ['E1 Blanca','E2 Verde','E3 Roja','E4 Rosada','E5 Naranja','E6 Roja II'];
  for (let i = 0; i < nets.length; i++) {
    await prisma.network.upsert({ where: { code: `E${i+1}` }, update: { name: nets[i] }, create: { code: `E${i+1}`, name: nets[i] } });
  }
  const netE5 = await prisma.network.findUnique({ where: { code: 'E5' } });
  console.log('✓ 6 Networks');

  // 3. Users
  const pastor = await prisma.user.upsert({
    where: { email: 'admin@jpdve.local' },
    update: { password },
    create: { email: 'admin@jpdve.local', password, firstName: 'Pastor', lastName: 'General', status: 'ACTIVE', roles: ['SUPER_ADMIN','ADMIN'], campusId: campus.id, ministerialRole: 'PASTOR_GENERAL', leaderCode: 'PG', profile: { create: { bio: 'Pastor General' } } },
  });

  const pastorJov = await prisma.user.upsert({
    where: { email: 'pastor.jovenes@jpdve.local' },
    update: { password },
    create: { email: 'pastor.jovenes@jpdve.local', password, firstName: 'Roberto', lastName: 'Mendoza', status: 'ACTIVE', roles: ['ADMIN'], campusId: campus.id, networkId: netE5.id, ministerialRole: 'PASTOR_RED', leaderCode: 'E5', profile: { create: {} } },
  });

  const cobertura = await prisma.user.upsert({
    where: { email: 'cobertura.e5@jpdve.local' },
    update: { password },
    create: { email: 'cobertura.e5@jpdve.local', password, firstName: 'Daniel', lastName: 'Castillo', status: 'ACTIVE', roles: ['LEADER'], campusId: campus.id, networkId: netE5.id, ministerialRole: 'COBERTURA', leaderCode: 'E5.C1', leaderId: pastorJov.id, profile: { create: {} } },
  });

  const lider1 = await prisma.user.upsert({
    where: { email: 'lider.e51@jpdve.local' },
    update: { password },
    create: { email: 'lider.e51@jpdve.local', password, firstName: 'Angelo', lastName: 'Pérez', status: 'ACTIVE', roles: ['LEADER'], campusId: campus.id, networkId: netE5.id, ministerialRole: 'LIDER', leaderCode: 'E5.1', leaderId: cobertura.id, phoneNumber: '+507 6000-1111', profile: { create: {} } },
  });
  console.log('✓ 4 Users (Pastor, PastorJov, Cobertura, Lider)');

  // 4. Group E5.1
  const group = await prisma.group.upsert({
    where: { slug: 'equipo-e5-1' },
    update: {},
    create: { name: 'Angelo & Sofía', slug: 'equipo-e5-1', code: 'E5.1', type: 'CELL', campusId: campus.id, networkId: netE5.id, createdById: lider1.id, neighborhood: 'Villa Lucre' },
  });
  await prisma.groupMember.upsert({ where: { groupId_userId: { groupId: group.id, userId: lider1.id } }, update: {}, create: { groupId: group.id, userId: lider1.id, role: 'LEADER' } });
  console.log('✓ Group E5.1 + leader assigned');

  // 5. Pipeline Stages
  const stages = [
    { code: 'VISITANTE', name: 'Visitante', orderIndex: 1, color: '#9CA3AF' },
    { code: 'CONSOLIDADO', name: 'Consolidado', orderIndex: 2, color: '#60A5FA' },
    { code: 'ACADEMIA_N1', name: 'Academia Nivel 1', orderIndex: 3, color: '#34D399' },
    { code: 'SERVIDOR', name: 'Servidor', orderIndex: 6, color: '#FBBF24' },
    { code: 'LIDER_POTENCIAL', name: 'Líder Potencial', orderIndex: 7, color: '#F97316' },
    { code: 'LIDER', name: 'Líder', orderIndex: 8, color: '#EF4444' },
    { code: 'COBERTURA', name: 'Cobertura', orderIndex: 9, color: '#8B5CF6' },
  ];
  for (const s of stages) {
    await prisma.pipelineStageConfig.upsert({ where: { campusId_code: { campusId: campus.id, code: s.code } }, update: s, create: { ...s, campusId: campus.id } });
  }
  console.log('✓ 7 Pipeline Stages');

  // 6. A few persons
  const visitanteStage = await prisma.pipelineStageConfig.findFirst({ where: { campusId: campus.id, code: 'VISITANTE' } });
  const consolidadoStage = await prisma.pipelineStageConfig.findFirst({ where: { campusId: campus.id, code: 'CONSOLIDADO' } });

  const persons = [
    { firstName: 'Carlos', lastName: 'Gómez', phone: '+507 6111-0001', pipelineStageId: visitanteStage.id },
    { firstName: 'María', lastName: 'Torres', phone: '+507 6111-0002', pipelineStageId: consolidadoStage.id },
    { firstName: 'José', lastName: 'Rodríguez', phone: '+507 6111-0003', pipelineStageId: visitanteStage.id },
    { firstName: 'Ana', lastName: 'Martínez', phone: '+507 6111-0004', pipelineStageId: consolidadoStage.id },
    { firstName: 'Luis', lastName: 'Herrera', phone: '+507 6111-0005', pipelineStageId: visitanteStage.id },
  ];
  for (const p of persons) {
    await prisma.person.create({ data: { ...p, campusId: campus.id, currentGroupId: group.id } }).catch(() => {});
  }
  console.log('✓ 5 Persons');

  // 7. One report
  const lastSunday = new Date();
  lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
  await prisma.cellReport.create({
    data: {
      groupId: group.id, reporterId: lider1.id, cellCode: 'E5.1', meetingDate: lastSunday,
      coverageName: 'Daniel Castillo', leaderName: 'Angelo Pérez',
      menCount: 4, womenCount: 5, youthMaleCount: 2, youthFemaleCount: 3, childrenCount: 1,
      totalAttendance: 15, visitorsCount: 2, convertsCount: 1, reconciledCount: 0,
      startTime: '19:00', endTime: '21:00', offeringAmount: 25.00,
      messageTopic: 'La Fe que Vence', neighborhood: 'Villa Lucre',
    },
  }).catch(() => {});
  console.log('✓ 1 Cell Report');

  // 8. Permissions (minimal)
  const resources = ['users','groups','reports','persons'];
  for (const r of resources) {
    for (const a of ['CREATE','READ','UPDATE','DELETE']) {
      await prisma.permission.upsert({ where: { name: `${r}:${a.toLowerCase()}` }, update: {}, create: { resource: r, action: a, name: `${r}:${a.toLowerCase()}` } });
    }
  }
  console.log('✓ Permissions');

  console.log('\n═══════════════════════════════════════');
  console.log(' REMOTE DB READY!');
  console.log(' Login: admin@jpdve.local / ChangeMe123!');
  console.log('═══════════════════════════════════════');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
