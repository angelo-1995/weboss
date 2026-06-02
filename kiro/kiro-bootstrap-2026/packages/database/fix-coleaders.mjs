import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * ADR-012: Fix co-leader leaderCodes and leaderIds
 * 
 * Problem: Co-leaders have codes like "E5.6.co" which breaks prefix matching.
 * Solution: Co-leaders share the SAME leaderCode as the leader. 
 * Their leaderId points to the SUPERVISOR (not the other co-leader).
 */
async function main() {
  console.log('🔧 Fixing co-leader data per ADR-012...\n');

  // Get reference users
  const admin = await prisma.user.findFirst({ where: { email: 'admin@jpdve.local' }, select: { id: true } });
  const oris = await prisma.user.findFirst({ where: { email: 'oris@jpdve.local' }, select: { id: true } });
  const augusto = await prisma.user.findFirst({ where: { email: 'augusto@jpdve.local' }, select: { id: true } });
  const danielG = await prisma.user.findFirst({ where: { email: 'daniel.g@jpdve.local' }, select: { id: true } });
  const diego = await prisma.user.findFirst({ where: { email: 'diego.e@jpdve.local' }, select: { id: true } });

  if (!admin || !oris) {
    throw new Error('Required users not found');
  }

  // Fix co-leaders: change leaderCode from X.co to X, change leaderId to proper supervisor
  const fixes = [
    // E5 co-leader: Luis Hernandez
    { email: 'luis.h@jpdve.local', newCode: 'E5', newLeaderId: admin.id, label: 'Luis → E5 (co with Oris)' },
    // E5.6 co-leader: Angelo Navarro
    { email: 'angelo@jpdve.local', newCode: 'E5.6', newLeaderId: oris.id, label: 'Angelo → E5.6 (co with Augusto)' },
    // E5.1 co-leader: Michelle Lam
    { email: 'michelle@jpdve.local', newCode: 'E5.1', newLeaderId: oris.id, label: 'Michelle → E5.1 (co with Keisly)' },
    // E5.3 co-leader: Paola Andrade
    { email: 'paola@jpdve.local', newCode: 'E5.3', newLeaderId: oris.id, label: 'Paola → E5.3 (co with Milagro)' },
    // E5.5 co-leader: José Reyes
    { email: 'jose.r@jpdve.local', newCode: 'E5.5', newLeaderId: oris.id, label: 'José → E5.5 (co with Jair)' },
    // E5.7 co-leader: Jesús Rodriguez
    { email: 'jesus@jpdve.local', newCode: 'E5.7', newLeaderId: oris.id, label: 'Jesús → E5.7 (co with Diego)' },
    // E5.8 co-leader: Erick Sánchez
    { email: 'erick@jpdve.local', newCode: 'E5.8', newLeaderId: oris.id, label: 'Erick → E5.8 (co with Daphne)' },
    // E5.4.1 co-leader: Kenneth Gil
    { email: 'kenneth@jpdve.local', newCode: 'E5.4.1', newLeaderId: danielG?.id || oris.id, label: 'Kenneth → E5.4.1 (co with Andres)' },
    // E5.4.2 co-leader: Juan Rodriguez
    { email: 'juan.r@jpdve.local', newCode: 'E5.4.2', newLeaderId: danielG?.id || oris.id, label: 'Juan → E5.4.2 (co with Jose)' },
    // E5.4.3 co-leader: Isaac Montoya
    { email: 'isaac@jpdve.local', newCode: 'E5.4.3', newLeaderId: danielG?.id || oris.id, label: 'Isaac → E5.4.3 (co with Abraham)' },
    // E5.6.1 co-leader: Cristian Guabo
    { email: 'cristian@jpdve.local', newCode: 'E5.6.1', newLeaderId: augusto?.id || oris.id, label: 'Cristian → E5.6.1 (co with Jonatan)' },
    // E5.7.1 co-leader: Victor Gonzalez
    { email: 'victor@jpdve.local', newCode: 'E5.7.1', newLeaderId: diego?.id || oris.id, label: 'Victor → E5.7.1 (co with Kevin)' },
    // E5.7.2 co-leader: Javier Morales
    { email: 'javier@jpdve.local', newCode: 'E5.7.2', newLeaderId: diego?.id || oris.id, label: 'Javier → E5.7.2 (co with Ismael)' },
    // E5.7.3 co-leader: Deivis Santos
    { email: 'deivis@jpdve.local', newCode: 'E5.7.3', newLeaderId: diego?.id || oris.id, label: 'Deivis → E5.7.3 (co with Diego Espinosa)' },
    // E5.7.4 co-leader: Kennedy Pérez
    { email: 'kennedy@jpdve.local', newCode: 'E5.7.4', newLeaderId: diego?.id || oris.id, label: 'Kennedy → E5.7.4 (co with Daniel Centeno)' },
  ];

  let fixed = 0;
  for (const f of fixes) {
    const user = await prisma.user.findFirst({ where: { email: f.email }, select: { id: true, leaderCode: true } });
    if (!user) {
      console.log(`  ⚠️  ${f.email} not found, skipping`);
      continue;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { leaderCode: f.newCode, leaderId: f.newLeaderId },
    });
    console.log(`  ✓ ${f.label} (was: ${user.leaderCode})`);
    fixed++;
  }

  console.log(`\n═══════════════════════════════════════════════════`);
  console.log(` CO-LEADERS FIXED: ${fixed}`);
  console.log(` All co-leaders now share the same leaderCode as their partner.`);
  console.log(` HierarchyVisibilityService will now include them in scope.`);
  console.log(`═══════════════════════════════════════════════════\n`);

  // Verify Angelo now
  const angelo = await prisma.user.findFirst({
    where: { email: 'angelo@jpdve.local' },
    select: { leaderCode: true, leaderId: true },
  });
  console.log(`Verification — Angelo: leaderCode=${angelo?.leaderCode}, leaderId=${angelo?.leaderId}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
