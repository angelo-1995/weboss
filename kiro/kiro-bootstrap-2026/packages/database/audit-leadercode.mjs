import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log(' AUDITORÍA LEADERCODE DUPLICADOS');
  console.log(' Fecha: ' + new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════════\n');

  // AUD-001: Users with leaderCode = E5
  console.log('══ AUD-001: leaderCode = "E5" ══');
  const e5Users = await prisma.user.findMany({
    where: { leaderCode: 'E5', deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true, ministerialRole: true, leaderCode: true, leaderId: true, networkId: true },
  });
  for (const u of e5Users) {
    const gm = await prisma.groupMember.findMany({
      where: { userId: u.id, leftAt: null, role: { in: ['LEADER', 'CO_LEADER'] } },
      include: { group: { select: { id: true, name: true, code: true } } },
    });
    const groupInfo = gm.map(m => `${m.group.code} (${m.role})`).join(', ') || 'NONE';
    console.log(`  ${u.firstName} ${u.lastName}`);
    console.log(`    email: ${u.email}`);
    console.log(`    ministerialRole: ${u.ministerialRole}`);
    console.log(`    leaderId: ${u.leaderId || 'null'}`);
    console.log(`    groups: ${groupInfo}`);
    console.log('');
  }

  // AUD-002: Users with leaderCode = E5.1
  console.log('══ AUD-002: leaderCode = "E5.1" ══');
  const e51Users = await prisma.user.findMany({
    where: { leaderCode: 'E5.1', deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true, ministerialRole: true, leaderCode: true, leaderId: true, networkId: true },
  });
  for (const u of e51Users) {
    const gm = await prisma.groupMember.findMany({
      where: { userId: u.id, leftAt: null, role: { in: ['LEADER', 'CO_LEADER'] } },
      include: { group: { select: { id: true, name: true, code: true } } },
    });
    const groupInfo = gm.map(m => `${m.group.code} (${m.role})`).join(', ') || 'NONE';
    console.log(`  ${u.firstName} ${u.lastName}`);
    console.log(`    email: ${u.email}`);
    console.log(`    ministerialRole: ${u.ministerialRole}`);
    console.log(`    leaderId: ${u.leaderId || 'null'}`);
    console.log(`    groups: ${groupInfo}`);
    console.log('');
  }

  // AUD-003: Users with leaderCode = E5.3
  console.log('══ AUD-003: leaderCode = "E5.3" ══');
  const e53Users = await prisma.user.findMany({
    where: { leaderCode: 'E5.3', deletedAt: null },
    select: { id: true, firstName: true, lastName: true, email: true, ministerialRole: true, leaderCode: true, leaderId: true, networkId: true },
  });
  for (const u of e53Users) {
    const gm = await prisma.groupMember.findMany({
      where: { userId: u.id, leftAt: null, role: { in: ['LEADER', 'CO_LEADER'] } },
      include: { group: { select: { id: true, name: true, code: true } } },
    });
    const groupInfo = gm.map(m => `${m.group.code} (${m.role})`).join(', ') || 'NONE';
    console.log(`  ${u.firstName} ${u.lastName}`);
    console.log(`    email: ${u.email}`);
    console.log(`    ministerialRole: ${u.ministerialRole}`);
    console.log(`    leaderId: ${u.leaderId || 'null'}`);
    console.log(`    groups: ${groupInfo}`);
    console.log('');
  }

  // AUD-004/005: Full matrix
  console.log('══ AUD-005: MATRIZ COMPLETA ══\n');
  const allDups = await prisma.user.groupBy({
    by: ['leaderCode'],
    where: { deletedAt: null, leaderCode: { not: null } },
    _count: { leaderCode: true },
    having: { leaderCode: { _count: { gt: 1 } } },
  });

  console.log('  leaderCode | count | status');
  console.log('  ─────────────────────────────────────');
  
  for (const dup of allDups) {
    const users = await prisma.user.findMany({
      where: { leaderCode: dup.leaderCode, deletedAt: null },
      select: { email: true, ministerialRole: true },
    });
    
    // Determine status
    let status;
    const emails = users.map(u => u.email);
    const hasDemoUser = emails.some(e => e.includes('demo.community-os'));
    const hasJpdveUser = emails.some(e => e.includes('@jpdve.local'));
    
    if (hasDemoUser && hasJpdveUser) {
      status = 'DEMO_DATA + JPDVE (CONFLICT)';
    } else if (hasDemoUser) {
      status = 'DEMO_DATA';
    } else if (dup._count.leaderCode === 2) {
      status = 'VALID_CO_LEADERSHIP (ADR-012)';
    } else if (dup._count.leaderCode === 3) {
      status = 'CHECK — 3 users with same code';
    } else {
      status = 'UNEXPECTED';
    }
    
    console.log(`  ${dup.leaderCode?.padEnd(10)} | ${dup._count.leaderCode}     | ${status}`);
    users.forEach(u => console.log(`             └─ ${u.email} (${u.ministerialRole || 'null'})`));
  }

  // AUD-006: Security impact analysis
  console.log('\n══ AUD-006: IMPACTO EN SEGURIDAD ══\n');
  
  // Check if any demo user has E5 code and could see E5 data
  const demoWithE5 = await prisma.user.findMany({
    where: { leaderCode: { startsWith: 'E5' }, email: { contains: 'demo.community-os' }, deletedAt: null },
    select: { email: true, leaderCode: true, roles: true },
  });
  
  if (demoWithE5.length > 0) {
    console.log('  ⚠️ DEMO USERS WITH E5 CODE (potential scope leak):');
    demoWithE5.forEach(u => console.log(`    - ${u.email} (${u.leaderCode}) roles: ${u.roles}`));
  } else {
    console.log('  ✅ No demo users have E5.* leaderCodes');
  }

  // Check if admin has E5 code (would be expected)
  const adminE5 = await prisma.user.findFirst({
    where: { email: 'admin@jpdve.local', deletedAt: null },
    select: { leaderCode: true, roles: true },
  });
  console.log(`\n  Admin user: leaderCode=${adminE5?.leaderCode}, roles=${adminE5?.roles}`);
  console.log(`  ${adminE5?.roles?.includes('SUPER_ADMIN') ? '✅ Admin has SUPER_ADMIN — leaderCode is irrelevant (full access bypass)' : '⚠️ Check admin roles'}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(' AUDITORÍA COMPLETA');
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
