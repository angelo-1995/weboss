import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('👥 Creando co-líderes del organigrama E5...\n');

  const password = await argon2.hash('ChangeMe123!', { type: 2, memoryCost: 65536, timeCost: 3, parallelism: 4 });
  const campus = await prisma.campus.findFirst({ where: { slug: 'sede-central' } });
  const net = await prisma.network.findFirst({ where: { code: 'E5' } });

  const coLeaders = [
    { email: 'michelle@jpdve.local', firstName: 'Michelle', lastName: 'Lam', code: 'E5.1' },
    { email: 'paola@jpdve.local', firstName: 'Paola', lastName: 'Andrade', code: 'E5.3' },
    { email: 'jose.r@jpdve.local', firstName: 'José', lastName: 'Reyes', code: 'E5.5' },
    { email: 'angelo.n@jpdve.local', firstName: 'Angelo', lastName: 'Navarro', code: 'E5.6' },
    { email: 'jesus.r@jpdve.local', firstName: 'Jesús', lastName: 'Rodríguez', code: 'E5.7' },
    { email: 'erick.s@jpdve.local', firstName: 'Erick', lastName: 'Sánchez', code: 'E5.8' },
    { email: 'kenneth@jpdve.local', firstName: 'Kenneth', lastName: 'Gil', code: 'E5.4.1' },
    { email: 'juan.r@jpdve.local', firstName: 'Juan', lastName: 'Rodriguez', code: 'E5.4.2' },
    { email: 'isaac@jpdve.local', firstName: 'Isaac', lastName: 'Montoya', code: 'E5.4.3' },
    { email: 'cristian@jpdve.local', firstName: 'Cristian', lastName: 'Guabo', code: 'E5.6.1' },
    { email: 'victor@jpdve.local', firstName: 'Victor', lastName: 'Gonzalez', code: 'E5.7.1' },
    { email: 'javier@jpdve.local', firstName: 'Javier', lastName: 'Morales', code: 'E5.7.2' },
    { email: 'deivis@jpdve.local', firstName: 'Deivis', lastName: 'Santos', code: 'E5.7.3' },
    { email: 'kennedy@jpdve.local', firstName: 'Kennedy', lastName: 'Pérez', code: 'E5.7.4' },
  ];

  let count = 0;
  for (const cl of coLeaders) {
    // Find the group
    const group = await prisma.group.findFirst({ where: { code: cl.code } });
    if (!group) { console.log(`  ⚠️ Grupo ${cl.code} no encontrado`); continue; }

    // Find the leader (to set as coverageLeader)
    const leader = await prisma.user.findFirst({ where: { leaderCode: cl.code } });

    // Create user
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
        networkId: net.id,
        ministerialRole: 'LIDER',
        leaderCode: `${cl.code}.co`,
        leaderId: leader?.leaderId || null,
        profile: { create: {} },
      },
    });

    // Assign as CO_LEADER in the group
    await prisma.groupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
      update: { role: 'CO_LEADER' },
      create: { groupId: group.id, userId: user.id, role: 'CO_LEADER' },
    });

    count++;
  }

  console.log(`✓ ${count} co-líderes creados y asignados\n`);
  console.log('NUEVOS USUARIOS (password: ChangeMe123!):');
  console.log('───────────────────────────────────────────');
  for (const cl of coLeaders) {
    console.log(`  ${cl.firstName} ${cl.lastName}: ${cl.email} (Co-líder ${cl.code})`);
  }
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
