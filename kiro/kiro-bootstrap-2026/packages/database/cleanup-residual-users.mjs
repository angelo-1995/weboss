import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Cleanup: Soft-delete all users NOT in the official E5 organigrama.
 * Keep only the 35 real organigrama users + admin.
 */
async function main() {
  console.log('🧹 Cleaning residual users NOT in organigrama E5...\n');

  // Official emails from the organigrama image
  const keepEmails = [
    'admin@jpdve.local',        // Pastor General
    'oris@jpdve.local',         // E5 - Líder Red
    'luis.h@jpdve.local',       // E5 - Co-líder Red
    'keisly@jpdve.local',       // E5.1
    'michelle@jpdve.local',     // E5.1 co
    'daniela.g@jpdve.local',    // E5.2
    'milagro@jpdve.local',      // E5.3
    'paola@jpdve.local',        // E5.3 co
    'daniel.g@jpdve.local',     // E5.4
    'andres.p@jpdve.local',     // E5.4.1
    'kenneth@jpdve.local',      // E5.4.1 co
    'jose.c@jpdve.local',       // E5.4.2
    'juan.r@jpdve.local',       // E5.4.2 co
    'abraham@jpdve.local',      // E5.4.3
    'isaac@jpdve.local',        // E5.4.3 co
    'jair@jpdve.local',         // E5.5
    'jose.r@jpdve.local',       // E5.5 co
    'augusto@jpdve.local',      // E5.6
    'angelo@jpdve.local',       // E5.6 co
    'jonatan@jpdve.local',      // E5.6.1
    'cristian@jpdve.local',     // E5.6.1 co
    'jordi@jpdve.local',        // E5.6.2
    'marlone@jpdve.local',      // E5.6.3
    'diego.e@jpdve.local',      // E5.7
    'jesus@jpdve.local',        // E5.7 co
    'kevin@jpdve.local',        // E5.7.1
    'victor@jpdve.local',       // E5.7.1 co
    'ismael@jpdve.local',       // E5.7.2
    'javier@jpdve.local',       // E5.7.2 co
    'diego.esp@jpdve.local',    // E5.7.3
    'deivis@jpdve.local',       // E5.7.3 co
    'daniel.c@jpdve.local',     // E5.7.4
    'kennedy@jpdve.local',      // E5.7.4 co
    'daphne@jpdve.local',       // E5.8
    'erick@jpdve.local',        // E5.8 co
  ];

  // Find all users NOT in the keep list
  const toDelete = await prisma.user.findMany({
    where: {
      email: { notIn: keepEmails },
      deletedAt: null,
    },
    select: { id: true, email: true, firstName: true, lastName: true, leaderCode: true },
  });

  console.log(`Users to soft-delete: ${toDelete.length}\n`);
  toDelete.forEach(u => console.log(`  ✗ ${u.email} (${u.firstName} ${u.lastName}) code=${u.leaderCode || 'null'}`));

  if (toDelete.length === 0) {
    console.log('\n✅ No residual users found. Database is clean.');
    return;
  }

  // Soft-delete them
  const ids = toDelete.map(u => u.id);
  const result = await prisma.user.updateMany({
    where: { id: { in: ids } },
    data: { deletedAt: new Date() },
  });

  console.log(`\n✅ Soft-deleted ${result.count} residual users.`);

  // Also remove their leaderCode to prevent scope interference
  await prisma.user.updateMany({
    where: { id: { in: ids } },
    data: { leaderCode: null },
  });
  console.log(`✅ Cleared leaderCode for deleted users.`);

  // Verify final state
  const remaining = await prisma.user.count({ where: { deletedAt: null } });
  console.log(`\n📊 Active users remaining: ${remaining}`);
  console.log(`   Expected: ~35 (organigrama) + admin = 35`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
