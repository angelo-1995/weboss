import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Adding Co-Leaders to Organigrama E5...\n');

  const password = await argon2.hash('ChangeMe123!', { type: 2, memoryCost: 65536, timeCost: 3, parallelism: 4 });

  // Get campus and network
  const campus = await prisma.campus.findFirst({ where: { slug: 'sede-central' } });
  const netE5 = await prisma.network.findFirst({ where: { code: 'E5' } });

  if (!campus || !netE5) {
    throw new Error('Campus or Network E5 not found. Run seed-e5-organigrama.mjs first.');
  }

  // Get existing leaders to link co-leaders
  const existingUsers = await prisma.user.findMany({ where: { networkId: netE5.id } });
  const byCode = {};
  for (const u of existingUsers) {
    if (u.leaderCode) byCode[u.leaderCode] = u;
  }

  // Get groups
  const existingGroups = await prisma.group.findMany({ where: { networkId: netE5.id } });
  const groupByCode = {};
  for (const g of existingGroups) {
    if (g.code) groupByCode[g.code] = g;
  }

  // Co-leaders to create
  const coLeaders = [
    { email: 'michelle@jpdve.local', firstName: 'Michelle', lastName: 'Lam', code: 'E5.1.co', teamCode: 'E5.1', leaderId: byCode['E5.1']?.id },
    { email: 'paola@jpdve.local', firstName: 'Paola', lastName: 'Andrade', code: 'E5.3.co', teamCode: 'E5.3', leaderId: byCode['E5.3']?.id },
    { email: 'kenneth@jpdve.local', firstName: 'Kenneth', lastName: 'Gil', code: 'E5.4.1.co', teamCode: 'E5.4.1', leaderId: byCode['E5.4.1']?.id },
    { email: 'juan.r@jpdve.local', firstName: 'Juan', lastName: 'Rodriguez', code: 'E5.4.2.co', teamCode: 'E5.4.2', leaderId: byCode['E5.4.2']?.id },
    { email: 'isaac@jpdve.local', firstName: 'Isaac', lastName: 'Montoya', code: 'E5.4.3.co', teamCode: 'E5.4.3', leaderId: byCode['E5.4.3']?.id },
    { email: 'jose.r@jpdve.local', firstName: 'José', lastName: 'Reyes', code: 'E5.5.co', teamCode: 'E5.5', leaderId: byCode['E5.5']?.id },
    { email: 'angelo@jpdve.local', firstName: 'Angelo', lastName: 'Navarro', code: 'E5.6.co', teamCode: 'E5.6', leaderId: byCode['E5.6']?.id },
    { email: 'cristian@jpdve.local', firstName: 'Cristian', lastName: 'Guabo', code: 'E5.6.1.co', teamCode: 'E5.6.1', leaderId: byCode['E5.6.1']?.id },
    { email: 'jesus@jpdve.local', firstName: 'Jesús', lastName: 'Rodriguez', code: 'E5.7.co', teamCode: 'E5.7', leaderId: byCode['E5.7']?.id },
    { email: 'victor@jpdve.local', firstName: 'Victor', lastName: 'Gonzalez', code: 'E5.7.1.co', teamCode: 'E5.7.1', leaderId: byCode['E5.7.1']?.id },
    { email: 'javier@jpdve.local', firstName: 'Javier', lastName: 'Morales', code: 'E5.7.2.co', teamCode: 'E5.7.2', leaderId: byCode['E5.7.2']?.id },
    { email: 'deivis@jpdve.local', firstName: 'Deivis', lastName: 'Santos', code: 'E5.7.3.co', teamCode: 'E5.7.3', leaderId: byCode['E5.7.3']?.id },
    { email: 'kennedy@jpdve.local', firstName: 'Kennedy', lastName: 'Pérez', code: 'E5.7.4.co', teamCode: 'E5.7.4', leaderId: byCode['E5.7.4']?.id },
    { email: 'erick@jpdve.local', firstName: 'Erick', lastName: 'Sánchez', code: 'E5.8.co', teamCode: 'E5.8', leaderId: byCode['E5.8']?.id },
  ];

  let created = 0;
  for (const cl of coLeaders) {
    const user = await prisma.user.upsert({
      where: { email: cl.email },
      update: { password },
      create: {
        email: cl.email,
        password,
        firstName: cl.firstName,
        lastName: cl.lastName,
        status: 'ACTIVE',
        roles: ['LEADER'],
        campusId: campus.id,
        networkId: netE5.id,
        ministerialRole: 'LIDER',
        leaderCode: cl.code,
        leaderId: cl.leaderId || byCode['E5']?.id,
        profile: { create: {} },
      },
    });

    // Add as CO_LEADER to their team
    const group = groupByCode[cl.teamCode];
    if (group) {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: group.id, userId: user.id } },
        update: { role: 'CO_LEADER' },
        create: { groupId: group.id, userId: user.id, role: 'CO_LEADER' },
      });
    }

    console.log(`  ✓ ${cl.firstName} ${cl.lastName} (${cl.email}) → ${cl.teamCode}`);
    created++;
  }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(` CO-LÍDERES CREADOS: ${created}`);
  console.log(` Password: ChangeMe123!`);
  console.log(`═══════════════════════════════════════════════════\n`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
