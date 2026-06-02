import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Creating Pastores Generales + Pastor Jóvenes + Masters...\n');

  const password = await argon2.hash('ChangeMe123!', { type: 2, memoryCost: 65536, timeCost: 3, parallelism: 4 });

  // Get campus and network
  const campus = await prisma.campus.findFirst({ where: { slug: 'sede-central' } });
  const netE5 = await prisma.network.findFirst({ where: { code: 'E5' } });

  if (!campus) throw new Error('Campus not found');

  // 1. Pastores Generales — Rubén Aguirre y Enelsa de Aguirre
  const ruben = await prisma.user.upsert({
    where: { email: 'ruben.aguirre@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'ruben.aguirre@jpdve.local',
      password,
      firstName: 'Rubén',
      lastName: 'Aguirre',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      campusId: campus.id,
      ministerialRole: 'PASTOR_GENERAL',
      leaderCode: 'PG',
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Rubén Aguirre (Pastor General) — ruben.aguirre@jpdve.local`);

  const enelsa = await prisma.user.upsert({
    where: { email: 'enelsa.aguirre@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'enelsa.aguirre@jpdve.local',
      password,
      firstName: 'Enelsa',
      lastName: 'de Aguirre',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      campusId: campus.id,
      ministerialRole: 'PASTOR_GENERAL',
      leaderCode: 'PG',
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Enelsa de Aguirre (Pastor General) — enelsa.aguirre@jpdve.local`);

  // 2. Pastor de Jóvenes / Cobertura de Red E5 — Alexis Maturana y Rosaura Maturana
  const alexis = await prisma.user.upsert({
    where: { email: 'alexis.maturana@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'alexis.maturana@jpdve.local',
      password,
      firstName: 'Alexis',
      lastName: 'Maturana',
      status: 'ACTIVE',
      roles: ['ADMIN'],
      campusId: campus.id,
      networkId: netE5?.id,
      ministerialRole: 'PASTOR_RED',
      leaderCode: 'E5.PJ',
      leaderId: ruben.id,
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Alexis Maturana (Pastor Jóvenes / Cobertura Red E5) — alexis.maturana@jpdve.local`);

  const rosaura = await prisma.user.upsert({
    where: { email: 'rosaura.maturana@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'rosaura.maturana@jpdve.local',
      password,
      firstName: 'Rosaura',
      lastName: 'Maturana',
      status: 'ACTIVE',
      roles: ['ADMIN'],
      campusId: campus.id,
      networkId: netE5?.id,
      ministerialRole: 'PASTOR_RED',
      leaderCode: 'E5.PJ',
      leaderId: ruben.id,
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Rosaura Maturana (Pastor Jóvenes / Cobertura Red E5) — rosaura.maturana@jpdve.local`);

  // 3. Master Users (SUPER_ADMIN — ven todo sin restricción)
  const master1 = await prisma.user.upsert({
    where: { email: 'master@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'master@jpdve.local',
      password,
      firstName: 'Master',
      lastName: 'Admin',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      campusId: campus.id,
      ministerialRole: 'PASTOR_GENERAL',
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Master Admin — master@jpdve.local`);

  const master2 = await prisma.user.upsert({
    where: { email: 'angelo.dev@jpdve.local' },
    update: { password, deletedAt: null, status: 'ACTIVE' },
    create: {
      email: 'angelo.dev@jpdve.local',
      password,
      firstName: 'Angelo',
      lastName: 'Developer',
      status: 'ACTIVE',
      roles: ['SUPER_ADMIN', 'ADMIN'],
      campusId: campus.id,
      ministerialRole: 'PASTOR_GENERAL',
      profile: { create: {} },
    },
  });
  console.log(`  ✓ Angelo Dev (Master) — angelo.dev@jpdve.local`);

  // Update the original admin to have proper pastoral info
  await prisma.user.update({
    where: { email: 'admin@jpdve.local' },
    data: { leaderCode: 'PG', ministerialRole: 'PASTOR_GENERAL' },
  });
  console.log(`  ✓ admin@jpdve.local updated: leaderCode=PG, ministerialRole=PASTOR_GENERAL`);

  console.log('\n═══════════════════════════════════════════════════');
  console.log(' USUARIOS CREADOS EXITOSAMENTE');
  console.log('═══════════════════════════════════════════════════');
  console.log(' Password para todos: ChangeMe123!');
  console.log('');
  console.log(' PASTORES GENERALES:');
  console.log('   ruben.aguirre@jpdve.local   (Rubén Aguirre)');
  console.log('   enelsa.aguirre@jpdve.local  (Enelsa de Aguirre)');
  console.log('');
  console.log(' PASTOR JÓVENES / COBERTURA RED E5:');
  console.log('   alexis.maturana@jpdve.local (Alexis Maturana)');
  console.log('   rosaura.maturana@jpdve.local (Rosaura Maturana)');
  console.log('');
  console.log(' MASTERS (ven todo, sin restricción):');
  console.log('   master@jpdve.local          (Master Admin)');
  console.log('   angelo.dev@jpdve.local      (Angelo Developer)');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
